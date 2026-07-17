import { ConflictException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { AuditAction, Prisma, StoreStatus, User } from "@prisma/client";
import { AuditService } from "../../audit/audit.service";
import { PrismaService } from "../../prisma/prisma.service";
import { SellersService } from "../sellers/sellers.service";

const normalizeBarangay = (name: string) => name.trim().toLowerCase().replace(/\s+/g, " ");
const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

@Injectable()
export class StoresService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sellersService: SellersService,
    private readonly audit: AuditService
  ) {}

  async list() {
    return this.prisma.store.findMany({
      where: { status: StoreStatus.ACTIVE, deletedAt: null },
      include: {
        sellerProfile: { select: { businessName: true, verifiedAt: true, gender: true, avatarKey: true } },
        serviceAreas: { where: { isActive: true }, include: { barangay: true } },
        _count: { select: { products: true } }
      },
      orderBy: { createdAt: "desc" }
    });
  }

  async getBySlug(slug: string) {
    const store = await this.prisma.store.findUnique({
      where: { slug },
      include: {
        sellerProfile: { select: { businessName: true, verifiedAt: true, gender: true, avatarKey: true } },
        serviceAreas: { where: { isActive: true }, include: { barangay: true } },
        products: {
          where: { status: "ACTIVE", deletedAt: null },
          include: { variants: { where: { isActive: true } }, images: { orderBy: { displayOrder: "asc" } } }
        }
      }
    });
    if (!store || store.deletedAt || store.status !== StoreStatus.ACTIVE) {
      throw new NotFoundException("Store not found.");
    }

    return store;
  }

  async create(user: User, input: { name: string; slug?: string; description?: string; status?: StoreStatus }) {
    const profile = await this.sellersService.requireSellerProfile(user);
    const baseSlug = input.slug ? slugify(input.slug) : slugify(input.name);
    const existing = await this.prisma.store.findUnique({ where: { slug: baseSlug }, select: { id: true } });
    if (existing) {
      throw new ConflictException("That store URL is already in use. Choose a different store name or slug.");
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        const store = await tx.store.create({
          data: {
            sellerProfileId: profile.id,
            name: input.name,
            slug: baseSlug,
            description: input.description,
            status: input.status ?? StoreStatus.ACTIVE
          }
        });
        await this.audit.write({
          actorId: user.id,
          action: AuditAction.CREATE,
          entityType: "Store",
          entityId: store.id,
          metadata: { slug: store.slug, status: store.status },
          client: tx
        });
        return store;
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new ConflictException("That store URL is already in use. Choose a different store name or slug.");
      }
      throw error;
    }
  }

  async mine(user: User) {
    const profile = await this.sellersService.requireSellerProfile(user);
    return this.prisma.store.findMany({
      where: { sellerProfileId: profile.id, deletedAt: null },
      include: { serviceAreas: { include: { barangay: true } } },
      orderBy: { createdAt: "desc" }
    });
  }

  async addServiceAreas(
    user: User,
    storeId: string,
    input: { barangays: string[]; deliveryFee?: string; minOrder?: string }
  ) {
    await this.requireOwnedStore(user, storeId);
    const barangays = await this.prisma.barangay.findMany({
      where: { normalizedName: { in: input.barangays.map(normalizeBarangay) }, isActive: true }
    });
    const missing = input.barangays.filter((name) => !barangays.some((b) => b.normalizedName === normalizeBarangay(name)));
    if (missing.length > 0) {
      throw new NotFoundException(`Unknown or inactive Pasig barangay: ${missing.join(", ")}`);
    }

    await this.prisma.$transaction(
      barangays.map((barangay) =>
        this.prisma.storeServiceArea.upsert({
          where: { storeId_barangayId: { storeId, barangayId: barangay.id } },
          create: {
            storeId,
            barangayId: barangay.id,
            deliveryFee: input.deliveryFee ?? "0",
            minOrder: input.minOrder
          },
          update: {
            isActive: true,
            deliveryFee: input.deliveryFee ?? "0",
            minOrder: input.minOrder
          }
        })
      )
    );
    await this.audit.write({
      actorId: user.id,
      action: AuditAction.UPDATE,
      entityType: "StoreServiceArea",
      entityId: storeId,
      metadata: { barangays: input.barangays, deliveryFee: input.deliveryFee ?? "0", minOrder: input.minOrder }
    });

    return this.prisma.store.findUnique({
      where: { id: storeId },
      include: { serviceAreas: { include: { barangay: true }, orderBy: { createdAt: "asc" } } }
    });
  }

  async getOrCreateDefaultStoreForGarden(user: User, gardenName: string) {
    const profile = await this.sellersService.requireSellerProfile(user);
    const normalizedGarden = normalizeBarangay(gardenName);
    const barangay = await this.prisma.barangay.findUnique({
      where: { normalizedName: normalizedGarden }
    });
    if (!barangay || !barangay.isActive) {
      throw new NotFoundException(`Unknown or inactive Pasig barangay: ${gardenName}`);
    }

    const storeName = `${barangay.name} Urban Garden`;
    const existing = await this.prisma.store.findFirst({
      where: {
        sellerProfileId: profile.id,
        deletedAt: null,
        OR: [
          { name: storeName },
          {
            serviceAreas: {
              some: {
                barangayId: barangay.id,
                isActive: true
              }
            }
          }
        ]
      },
      include: { serviceAreas: { include: { barangay: true } } },
      orderBy: { createdAt: "asc" }
    });

    if (existing) {
      await this.prisma.storeServiceArea.upsert({
        where: { storeId_barangayId: { storeId: existing.id, barangayId: barangay.id } },
        create: { storeId: existing.id, barangayId: barangay.id, deliveryFee: "0" },
        update: { isActive: true }
      });
      return existing;
    }

    const baseSlug = slugify(`${storeName}-${profile.id.slice(-6)}`);
    return this.prisma.$transaction(async (tx) => {
      const store = await tx.store.create({
        data: {
          sellerProfileId: profile.id,
          name: storeName,
          slug: baseSlug,
          description: `Default selling point for ${barangay.name} urban garden harvests.`,
          status: StoreStatus.ACTIVE,
          serviceAreas: {
            create: {
              barangayId: barangay.id,
              deliveryFee: "0"
            }
          }
        },
        include: { serviceAreas: { include: { barangay: true } } }
      });
      await this.audit.write({
        actorId: user.id,
        action: AuditAction.CREATE,
        entityType: "Store",
        entityId: store.id,
        metadata: { slug: store.slug, status: store.status, defaultUrbanGarden: barangay.name },
        client: tx
      });
      return store;
    });
  }

  async update(user: User, storeId: string, input: { name?: string; slug?: string; description?: string; status?: StoreStatus }) {
    await this.requireOwnedStore(user, storeId);
    const data = {
      ...(input.name ? { name: input.name } : {}),
      ...(input.slug ? { slug: slugify(input.slug) } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.status ? { status: input.status } : {})
    };

    const store = await this.prisma.store.update({ where: { id: storeId }, data });
    await this.audit.write({
      actorId: user.id,
      action: AuditAction.UPDATE,
      entityType: "Store",
      entityId: store.id,
      metadata: data
    });
    return store;
  }

  async close(user: User, storeId: string) {
    await this.requireOwnedStore(user, storeId);
    const store = await this.prisma.store.update({
      where: { id: storeId },
      data: { status: StoreStatus.CLOSED, deletedAt: new Date() }
    });
    await this.audit.write({
      actorId: user.id,
      action: AuditAction.STATUS_CHANGE,
      entityType: "Store",
      entityId: store.id,
      metadata: { status: store.status }
    });
    return store;
  }

  async removeServiceArea(user: User, storeId: string, barangayId: string) {
    await this.requireOwnedStore(user, storeId);
    const area = await this.prisma.storeServiceArea.update({
      where: { storeId_barangayId: { storeId, barangayId } },
      data: { isActive: false }
    });
    await this.audit.write({
      actorId: user.id,
      action: AuditAction.UPDATE,
      entityType: "StoreServiceArea",
      entityId: area.id,
      metadata: { isActive: false }
    });
    return area;
  }

  async requireOwnedStore(user: User, storeId: string) {
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
      include: { sellerProfile: true }
    });
    if (!store || store.deletedAt) {
      throw new NotFoundException("Store not found.");
    }
    if (store.sellerProfile.userId !== user.id) {
      throw new ForbiddenException("You do not own this store.");
    }

    return store;
  }
}
