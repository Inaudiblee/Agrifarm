import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { AuditAction, ProductStatus, User } from "@prisma/client";
import { AuditService } from "../../audit/audit.service";
import { PrismaService } from "../../prisma/prisma.service";
import { StoresService } from "../stores/stores.service";

const normalizeBarangay = (name: string) => name.trim().toLowerCase().replace(/\s+/g, " ");
const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storesService: StoresService,
    private readonly audit: AuditService
  ) {}

  async list(input: { barangay?: string; q?: string }) {
    return this.prisma.product.findMany({
      where: {
        status: ProductStatus.ACTIVE,
        deletedAt: null,
        ...(input.q
          ? {
              OR: [
                { name: { contains: input.q, mode: "insensitive" } },
                { description: { contains: input.q, mode: "insensitive" } }
              ]
            }
          : {}),
        ...(input.barangay
          ? {
              store: {
                serviceAreas: {
                  some: {
                    isActive: true,
                    barangay: { normalizedName: normalizeBarangay(input.barangay), isActive: true }
                  }
                }
              }
            }
          : {})
      },
      include: {
        store: { select: { id: true, name: true, slug: true } },
        variants: { where: { isActive: true }, orderBy: { price: "asc" } },
        images: { orderBy: { displayOrder: "asc" } }
      },
      orderBy: { createdAt: "desc" }
    });
  }

  async listMine(user: User) {
    return this.prisma.product.findMany({
      where: {
        deletedAt: null,
        store: { sellerProfile: { userId: user.id } }
      },
      include: {
        store: { select: { id: true, name: true, slug: true, status: true } },
        variants: { orderBy: { createdAt: "asc" } },
        images: { orderBy: { displayOrder: "asc" } },
        categories: { include: { category: true } },
        _count: { select: { reviews: true } }
      },
      orderBy: { createdAt: "desc" }
    });
  }

  async create(
    user: User,
    input: {
      storeId: string;
      name: string;
      slug?: string;
      description?: string;
      variantName?: string;
      sku?: string;
      unit?: string;
      price: string;
      stockOnHand: number;
    }
  ) {
    await this.storesService.requireOwnedStore(user, input.storeId);
    const price = Number(input.price);
    if (!Number.isFinite(price) || price <= 0) {
      throw new BadRequestException("Price must be a positive decimal value.");
    }

    return this.prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          storeId: input.storeId,
          name: input.name,
          slug: input.slug ? slugify(input.slug) : slugify(input.name),
          description: input.description,
          status: ProductStatus.ACTIVE
        }
      });

      await tx.productVariant.create({
        data: {
          storeId: input.storeId,
          productId: product.id,
          name: input.variantName ?? "Regular",
          sku: input.sku,
          unit: input.unit ?? "kg",
          price: price.toFixed(2),
          stockOnHand: input.stockOnHand,
          inventoryLedger: {
            create: {
              reason: "INITIAL_STOCK",
              quantityDelta: input.stockOnHand,
              quantityAfter: input.stockOnHand,
              changedById: user.id
            }
          }
        }
      });
      await this.audit.write({
        actorId: user.id,
        action: AuditAction.CREATE,
        entityType: "Product",
        entityId: product.id,
        metadata: { storeId: input.storeId, price: price.toFixed(2), stockOnHand: input.stockOnHand },
        client: tx
      });

      return tx.product.findUniqueOrThrow({
        where: { id: product.id },
        include: { variants: true }
      });
    });
  }

  async get(id: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, deletedAt: null },
      include: {
        store: { select: { id: true, name: true, slug: true, status: true } },
        variants: { where: { isActive: true }, orderBy: { price: "asc" } },
        images: { orderBy: { displayOrder: "asc" } },
        categories: { include: { category: true } },
        reviews: { where: { deletedAt: null }, orderBy: { createdAt: "desc" } }
      }
    });
    if (!product || product.status !== ProductStatus.ACTIVE) {
      throw new NotFoundException("Product not found.");
    }

    return product;
  }

  async update(user: User, productId: string, input: { name?: string; slug?: string; description?: string }) {
    const product = await this.requireOwnedProduct(user, productId);
    const updated = await this.prisma.product.update({
      where: { id: product.id },
      data: {
        ...(input.name ? { name: input.name } : {}),
        ...(input.slug ? { slug: slugify(input.slug) } : {}),
        ...(input.description !== undefined ? { description: input.description } : {})
      },
      include: { variants: true }
    });
    await this.audit.write({
      actorId: user.id,
      action: AuditAction.UPDATE,
      entityType: "Product",
      entityId: updated.id,
      metadata: input
    });
    return updated;
  }

  async archive(user: User, productId: string) {
    const product = await this.requireOwnedProduct(user, productId);
    const updated = await this.prisma.product.update({
      where: { id: product.id },
      data: { status: ProductStatus.ARCHIVED, deletedAt: new Date() }
    });
    await this.audit.write({
      actorId: user.id,
      action: AuditAction.STATUS_CHANGE,
      entityType: "Product",
      entityId: updated.id,
      metadata: { status: updated.status }
    });
    return updated;
  }

  async addImage(
    user: User,
    productId: string,
    input: { url: string; altText?: string; displayOrder?: number; isPrimary?: boolean }
  ) {
    const product = await this.requireOwnedProduct(user, productId);
    if (input.isPrimary) {
      await this.prisma.productImage.updateMany({ where: { productId: product.id }, data: { isPrimary: false } });
    }

    const image = await this.prisma.productImage.create({
      data: {
        productId: product.id,
        url: input.url,
        altText: input.altText,
        displayOrder: input.displayOrder ?? 0,
        isPrimary: input.isPrimary ?? false
      }
    });
    await this.audit.write({
      actorId: user.id,
      action: AuditAction.CREATE,
      entityType: "ProductImage",
      entityId: image.id,
      metadata: { productId: product.id }
    });
    return image;
  }

  async addVariant(
    user: User,
    productId: string,
    input: { name: string; sku?: string; unit?: string; price: string; stockOnHand: number }
  ) {
    const product = await this.requireOwnedProduct(user, productId);
    const price = this.requirePositivePrice(input.price);
    return this.prisma.$transaction(async (tx) => {
      const variant = await tx.productVariant.create({
        data: {
          productId: product.id,
          storeId: product.storeId,
          name: input.name,
          sku: input.sku,
          unit: input.unit ?? "kg",
          price: price.toFixed(2),
          stockOnHand: input.stockOnHand,
          inventoryLedger: {
            create: {
              changedById: user.id,
              reason: "INITIAL_STOCK",
              quantityDelta: input.stockOnHand,
              quantityAfter: input.stockOnHand
            }
          }
        }
      });
      await this.audit.write({
        actorId: user.id,
        action: AuditAction.CREATE,
        entityType: "ProductVariant",
        entityId: variant.id,
        metadata: { productId: product.id, stockOnHand: input.stockOnHand },
        client: tx
      });
      return variant;
    });
  }

  async updateVariant(
    user: User,
    variantId: string,
    input: { name?: string; sku?: string; unit?: string; price?: string; isActive?: boolean }
  ) {
    const variant = await this.requireOwnedVariant(user, variantId);
    const updated = await this.prisma.productVariant.update({
      where: { id: variant.id },
      data: {
        ...(input.name ? { name: input.name } : {}),
        ...(input.sku !== undefined ? { sku: input.sku } : {}),
        ...(input.unit ? { unit: input.unit } : {}),
        ...(input.price ? { price: this.requirePositivePrice(input.price).toFixed(2) } : {}),
        ...(input.isActive !== undefined ? { isActive: input.isActive } : {})
      }
    });
    await this.audit.write({
      actorId: user.id,
      action: AuditAction.UPDATE,
      entityType: "ProductVariant",
      entityId: updated.id,
      metadata: input
    });
    return updated;
  }

  async adjustStock(user: User, variantId: string, input: { quantityDelta: number; notes?: string }) {
    const variant = await this.requireOwnedVariant(user, variantId);
    const quantityAfter = variant.stockOnHand + input.quantityDelta;
    if (quantityAfter < 0) {
      throw new BadRequestException("Stock adjustment cannot make stock negative.");
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.productVariant.update({
        where: { id: variant.id },
        data: { stockOnHand: quantityAfter }
      });
      await tx.inventoryLedger.create({
        data: {
          variantId: variant.id,
          changedById: user.id,
          reason: "ADJUSTMENT",
          quantityDelta: input.quantityDelta,
          quantityAfter,
          notes: input.notes
        }
      });
      await this.audit.write({
        actorId: user.id,
        action: AuditAction.UPDATE,
        entityType: "InventoryLedger",
        entityId: updated.id,
        metadata: { quantityDelta: input.quantityDelta, quantityAfter },
        client: tx
      });
      return updated;
    });
  }

  private requirePositivePrice(value: string) {
    const price = Number(value);
    if (!Number.isFinite(price) || price <= 0) {
      throw new BadRequestException("Price must be a positive decimal value.");
    }
    return price;
  }

  private async requireOwnedProduct(user: User, productId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: { store: { include: { sellerProfile: true } } }
    });
    if (!product || product.deletedAt) {
      throw new NotFoundException("Product not found.");
    }
    await this.storesService.requireOwnedStore(user, product.storeId);
    return product;
  }

  private async requireOwnedVariant(user: User, variantId: string) {
    const variant = await this.prisma.productVariant.findUnique({
      where: { id: variantId },
      include: { product: true }
    });
    if (!variant) {
      throw new NotFoundException("Product variant not found.");
    }
    await this.storesService.requireOwnedStore(user, variant.storeId);
    return variant;
  }
}
