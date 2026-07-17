import { BadRequestException, Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { AuditAction, OrderStatus, PaymentMethod, Prisma, SellerOrderStatus, User } from "@prisma/client";
import { randomBytes } from "crypto";
import { AuditService } from "../../audit/audit.service";
import { PrismaService } from "../../prisma/prisma.service";

type CheckoutClient = Prisma.TransactionClient | PrismaService;
type CartForCheckout = NonNullable<Awaited<ReturnType<OrdersService["loadCart"]>>>;
type CartItemForCheckout = CartForCheckout["items"][number];

@Injectable()
export class OrdersService implements OnModuleInit, OnModuleDestroy {
  private expirationTimer?: NodeJS.Timeout;

  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService
  ) {}

  onModuleInit() {
    this.expirationTimer = setInterval(() => void this.expireReservations(), 60_000);
    this.expirationTimer.unref();
  }

  onModuleDestroy() {
    if (this.expirationTimer) clearInterval(this.expirationTimer);
  }

  async listMine(user: User) {
    await this.expireReservations();
    return this.prisma.order.findMany({
      where: { buyerId: user.id },
      include: {
        sellerOrders: { include: { store: true, items: true, fulfillment: true } },
        payments: true,
        shippingAddress: true
      },
      orderBy: { createdAt: "desc" }
    });
  }

  async getMine(user: User, orderId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, buyerId: user.id },
      include: {
        sellerOrders: { include: { store: true, items: true, fulfillment: true } },
        payments: true,
        shippingAddress: true
      }
    });
    if (!order) {
      throw new BadRequestException("Order not found.");
    }

    return order;
  }

  async cancelMine(user: User, orderId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, buyerId: user.id },
      include: { sellerOrders: { include: { items: true } } }
    });
    if (!order) {
      throw new BadRequestException("Order not found.");
    }
    const cancellableStatuses: OrderStatus[] = [OrderStatus.PENDING_PAYMENT, OrderStatus.RESERVED];
    if (!cancellableStatuses.includes(order.status)) {
      throw new BadRequestException("This order can no longer be cancelled.");
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.order.update({
        where: { id: order.id },
        data: { status: OrderStatus.CANCELLED, cancelledAt: new Date() }
      });
      await tx.sellerOrder.updateMany({
        where: { orderId: order.id },
        data: { status: SellerOrderStatus.CANCELLED, cancelledAt: new Date() }
      });
      if (order.status === OrderStatus.RESERVED) await this.releaseReservedStock(tx, order, user.id, "CANCELLATION");
      await this.audit.write({
        actorId: user.id,
        action: AuditAction.STATUS_CHANGE,
        entityType: "Order",
        entityId: order.id,
        metadata: { status: OrderStatus.CANCELLED },
        client: tx
      });
      return updated;
    });
  }

  async listSellerOrders(user: User) {
    await this.expireReservations();
    return this.prisma.sellerOrder.findMany({
      where: { store: { sellerProfile: { userId: user.id } } },
      include: { order: { include: { shippingAddress: true, buyer: true } }, store: true, items: true, fulfillment: true },
      orderBy: { createdAt: "desc" }
    });
  }

  async updateSellerOrderStatus(user: User, sellerOrderId: string, status: SellerOrderStatus) {
    const sellerOrder = await this.prisma.sellerOrder.findFirst({
      where: { id: sellerOrderId, store: { sellerProfile: { userId: user.id } } }
    });
    if (!sellerOrder) {
      throw new BadRequestException("Seller order not found.");
    }

    const updated = await this.prisma.sellerOrder.update({
      where: { id: sellerOrder.id },
      data: {
        status,
        confirmedAt: status === SellerOrderStatus.CONFIRMED ? new Date() : sellerOrder.confirmedAt,
        cancelledAt: status === SellerOrderStatus.CANCELLED ? new Date() : sellerOrder.cancelledAt,
        deliveredAt: status === SellerOrderStatus.DELIVERED ? new Date() : sellerOrder.deliveredAt
      }
    });
    await this.audit.write({
      actorId: user.id,
      action: AuditAction.STATUS_CHANGE,
      entityType: "SellerOrder",
      entityId: updated.id,
      metadata: { status }
    });
    return updated;
  }

  async completeSellerOrder(user: User, sellerOrderId: string) {
    const sellerOrder = await this.prisma.sellerOrder.findFirst({
      where: { id: sellerOrderId, store: { sellerProfile: { userId: user.id } } },
      include: { items: true, order: true }
    });
    if (!sellerOrder) throw new BadRequestException("Seller order not found.");
    if (sellerOrder.status !== SellerOrderStatus.RESERVED || sellerOrder.order.status !== OrderStatus.RESERVED) {
      throw new BadRequestException("Only a reserved order awaiting pickup can be completed.");
    }

    return this.prisma.$transaction(async (tx) => {
      const claimed = await tx.sellerOrder.updateMany({
        where: { id: sellerOrder.id, status: SellerOrderStatus.RESERVED },
        data: { status: SellerOrderStatus.COMPLETED, deliveredAt: new Date(), balancePaidAt: new Date(), remainingBalance: 0 }
      });
      if (claimed.count !== 1) throw new BadRequestException("This reservation has already been updated.");
      for (const item of sellerOrder.items) {
        const updated = await tx.productVariant.updateMany({
          where: { id: item.variantId, reservedStock: { gte: item.quantity }, totalStock: { gte: item.quantity } },
          data: { reservedStock: { decrement: item.quantity }, totalStock: { decrement: item.quantity } }
        });
        if (updated.count !== 1) throw new BadRequestException(`Reserved stock is inconsistent for ${item.productName}.`);
        const variant = await tx.productVariant.findUniqueOrThrow({ where: { id: item.variantId } });
        await tx.inventoryLedger.create({
          data: {
            variantId: item.variantId,
            changedById: user.id,
            reason: "PICKUP_COMPLETION",
            quantityDelta: -item.quantity,
            quantityAfter: variant.totalStock,
            referenceType: "SellerOrder",
            referenceId: sellerOrder.id
          }
        });
      }
      const openParts = await tx.sellerOrder.count({
        where: { orderId: sellerOrder.orderId, status: { not: SellerOrderStatus.COMPLETED } }
      });
      const nextRemaining = Math.max(0, Number(sellerOrder.order.remainingBalance) - Number(sellerOrder.remainingBalance));
      const order = await tx.order.update({
        where: { id: sellerOrder.orderId },
        data: {
          remainingBalance: openParts === 0 ? 0 : nextRemaining.toFixed(2),
          status: openParts === 0 ? OrderStatus.COMPLETED : OrderStatus.RESERVED
        }
      });
      await this.audit.write({
        actorId: user.id,
        action: AuditAction.STATUS_CHANGE,
        entityType: "SellerOrder",
        entityId: sellerOrder.id,
        metadata: { status: SellerOrderStatus.COMPLETED, remainingCashReceived: sellerOrder.remainingBalance.toString() },
        client: tx
      });
      return order;
    });
  }

  async expireReservations() {
    const expired = await this.prisma.order.findMany({
      where: { status: OrderStatus.RESERVED, expiresAt: { lt: new Date() } },
      include: { sellerOrders: { include: { items: true } } },
      take: 100
    });
    for (const order of expired) {
      await this.prisma.$transaction(async (tx) => {
        const claimed = await tx.order.updateMany({
          where: { id: order.id, status: OrderStatus.RESERVED },
          data: { status: OrderStatus.EXPIRED }
        });
        if (claimed.count !== 1) return;
        await tx.sellerOrder.updateMany({ where: { orderId: order.id }, data: { status: SellerOrderStatus.EXPIRED } });
        await this.releaseReservedStock(tx, order, undefined, "RESERVATION_RELEASE");
      });
    }
    return { expired: expired.length };
  }

  private async releaseReservedStock(
    tx: Prisma.TransactionClient,
    order: { id: string; sellerOrders: Array<{ items: Array<{ variantId: string; quantity: number }> }> },
    changedById: string | undefined,
    reason: "CANCELLATION" | "RESERVATION_RELEASE"
  ) {
    for (const sellerOrder of order.sellerOrders) {
      for (const item of sellerOrder.items) {
        const updated = await tx.productVariant.updateMany({
          where: { id: item.variantId, reservedStock: { gte: item.quantity } },
          data: {
            reservedStock: { decrement: item.quantity },
            availableStock: { increment: item.quantity },
            stockOnHand: { increment: item.quantity }
          }
        });
        if (updated.count !== 1) throw new BadRequestException("Reserved stock is inconsistent.");
        const variant = await tx.productVariant.findUniqueOrThrow({ where: { id: item.variantId } });
        await tx.inventoryLedger.create({
          data: {
            variantId: item.variantId,
            changedById,
            reason,
            quantityDelta: item.quantity,
            quantityAfter: variant.availableStock,
            referenceType: "Order",
            referenceId: order.id
          }
        });
      }
    }
  }

  async checkout(user: User, input: { shippingAddressId: string; paymentMethod: PaymentMethod; notes?: string }) {
    return this.prisma.$transaction(async (tx) => {
      const cart = await this.loadCart(tx, user.id);
      if (!cart || cart.items.length === 0) {
        throw new BadRequestException("Cart is empty.");
      }

      const address = await tx.address.findFirst({
        where: { id: input.shippingAddressId, userId: user.id, deletedAt: null },
        include: { barangayRef: true }
      });
      if (!address?.barangayId) {
        throw new BadRequestException("Use a valid Pasig barangay address for checkout.");
      }

      const groups = new Map<string, CartItemForCheckout[]>();
      for (const item of cart.items) {
        if (!item.variant.isActive || item.variant.product.status !== "ACTIVE" || item.variant.product.deletedAt) {
          throw new BadRequestException(`Product is unavailable: ${item.variant.product.name}`);
        }
        if (item.variant.stockOnHand < item.quantity) {
          throw new BadRequestException(`Not enough stock for ${item.variant.product.name}.`);
        }
        groups.set(item.variant.storeId, [...(groups.get(item.variant.storeId) ?? []), item]);
      }

      const sellerSummaries = [];
      let subtotal = 0;
      let deliveryFee = 0;

      for (const [storeId, items] of groups.entries()) {
        const serviceArea = await tx.storeServiceArea.findUnique({
          where: { storeId_barangayId: { storeId, barangayId: address.barangayId } },
          include: { store: true }
        });
        if (!serviceArea?.isActive || serviceArea.store.status !== "ACTIVE") {
          throw new BadRequestException(`${items[0].variant.store.name} does not deliver to ${address.barangay}.`);
        }

        const sellerSubtotal = items.reduce((sum, item) => sum + Number(item.variant.price) * item.quantity, 0);
        if (serviceArea.minOrder && sellerSubtotal < Number(serviceArea.minOrder)) {
          throw new BadRequestException(`${serviceArea.store.name} requires a minimum order of ${serviceArea.minOrder}.`);
        }

        subtotal += sellerSubtotal;
        deliveryFee += Number(serviceArea.deliveryFee);
        sellerSummaries.push({ storeId, items, subtotal: sellerSubtotal, deliveryFee: Number(serviceArea.deliveryFee) });
      }

      const order = await tx.order.create({
        data: {
          orderNumber: this.orderNumber(),
          buyerId: user.id,
          shippingAddressId: address.id,
          subtotal: subtotal.toFixed(2),
          deliveryFee: deliveryFee.toFixed(2),
          grandTotal: (subtotal + deliveryFee).toFixed(2),
          notes: input.notes
        }
      });

      for (const seller of sellerSummaries) {
        const sellerOrder = await tx.sellerOrder.create({
          data: {
            orderId: order.id,
            storeId: seller.storeId,
            subtotal: seller.subtotal.toFixed(2),
            deliveryFee: seller.deliveryFee.toFixed(2),
            payoutAmount: seller.subtotal.toFixed(2)
          }
        });

        for (const item of seller.items) {
          const updated = await tx.productVariant.updateMany({
            where: { id: item.variantId, stockOnHand: { gte: item.quantity } },
            data: { stockOnHand: { decrement: item.quantity } }
          });
          if (updated.count !== 1) {
            throw new BadRequestException(`Stock changed before checkout for ${item.variant.product.name}.`);
          }

          const variantAfterSale = await tx.productVariant.findUniqueOrThrow({ where: { id: item.variantId } });
          await tx.inventoryLedger.create({
            data: {
              variantId: item.variantId,
              changedById: user.id,
              reason: "SALE",
              quantityDelta: -item.quantity,
              quantityAfter: variantAfterSale.stockOnHand,
              referenceType: "Order",
              referenceId: order.id
            }
          });

          await tx.orderItem.create({
            data: {
              orderId: order.id,
              sellerOrderId: sellerOrder.id,
              variantId: item.variantId,
              storeId: seller.storeId,
              productName: item.variant.product.name,
              variantName: item.variant.name,
              unit: item.variant.unit,
              quantity: item.quantity,
              unitPrice: Number(item.variant.price).toFixed(2),
              subtotal: (Number(item.variant.price) * item.quantity).toFixed(2)
            }
          });
        }
      }

      await tx.payment.create({
        data: {
          orderId: order.id,
          method: input.paymentMethod,
          amount: (subtotal + deliveryFee).toFixed(2)
        }
      });
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
      await this.audit.write({
        actorId: user.id,
        action: AuditAction.CREATE,
        entityType: "Order",
        entityId: order.id,
        metadata: {
          orderNumber: order.orderNumber,
          sellerOrderCount: sellerSummaries.length,
          paymentMethod: input.paymentMethod,
          grandTotal: (subtotal + deliveryFee).toFixed(2)
        },
        client: tx
      });

      return tx.order.findUniqueOrThrow({
        where: { id: order.id },
        include: {
          sellerOrders: { include: { store: true, items: true } },
          payments: true,
          shippingAddress: true
        }
      });
    });
  }

  private loadCart(client: CheckoutClient, userId: string) {
    return client.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: true,
                store: true
              }
            }
          }
        }
      }
    });
  }

  private orderNumber() {
    const date = new Date();
    const day = date.toISOString().slice(0, 10).replace(/-/g, "");
    return `AGF-${day}-${randomBytes(4).toString("hex").toUpperCase()}`;
  }
}
