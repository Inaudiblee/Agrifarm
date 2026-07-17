import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { User } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class CartsService {
  constructor(private readonly prisma: PrismaService) {}

  async getCart(user: User) {
    const cart = await this.prisma.cart.upsert({
      where: { userId: user.id },
      create: { userId: user.id },
      update: {}
    });

    return this.prisma.cart.findUnique({
      where: { id: cart.id },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: { include: { images: { orderBy: [{ isPrimary: "desc" }, { displayOrder: "asc" }] } } },
                store: { include: { serviceAreas: { include: { barangay: true } } } }
              }
            }
          },
          orderBy: { createdAt: "asc" }
        }
      }
    });
  }

  async addItem(user: User, input: { variantId: string; quantity: number }) {
    if (input.quantity <= 0) {
      throw new BadRequestException("Quantity must be positive.");
    }

    await this.prisma.$transaction(async (tx) => {
      const variant = await tx.productVariant.findUnique({
        where: { id: input.variantId },
        include: { product: true }
      });
      if (!variant || !variant.isActive || variant.product.deletedAt || variant.product.status !== "ACTIVE") {
        throw new NotFoundException("Product variant not found.");
      }

      const cart = await tx.cart.upsert({
        where: { userId: user.id },
        create: { userId: user.id },
        update: {}
      });
      const existing = await tx.cartItem.findUnique({
        where: { cartId_variantId: { cartId: cart.id, variantId: input.variantId } }
      });
      const requestedQuantity = (existing?.quantity ?? 0) + input.quantity;
      if (variant.stockOnHand < requestedQuantity) {
        throw new BadRequestException("Not enough stock for the requested cart quantity.");
      }

      await tx.cartItem.upsert({
        where: { cartId_variantId: { cartId: cart.id, variantId: input.variantId } },
        create: { cartId: cart.id, variantId: input.variantId, quantity: input.quantity },
        update: { quantity: requestedQuantity }
      });
    });

    return this.getCart(user);
  }

  async clear(user: User) {
    const cart = await this.prisma.cart.findUnique({ where: { userId: user.id } });
    if (!cart) {
      return { cleared: true };
    }

    await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    return { cleared: true };
  }

  async updateItem(user: User, cartItemId: string, quantity: number) {
    if (quantity <= 0) {
      throw new BadRequestException("Quantity must be positive.");
    }
    const item = await this.requireOwnedCartItem(user, cartItemId);
    if (item.variant.stockOnHand < quantity) {
      throw new BadRequestException("Not enough stock for the requested cart quantity.");
    }

    await this.prisma.cartItem.update({ where: { id: item.id }, data: { quantity } });
    return this.getCart(user);
  }

  async removeItem(user: User, cartItemId: string) {
    const item = await this.requireOwnedCartItem(user, cartItemId);
    await this.prisma.cartItem.delete({ where: { id: item.id } });
    return this.getCart(user);
  }

  private async requireOwnedCartItem(user: User, cartItemId: string) {
    const item = await this.prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: { cart: true, variant: true }
    });
    if (!item || item.cart.userId !== user.id) {
      throw new NotFoundException("Cart item not found.");
    }

    return item;
  }
}
