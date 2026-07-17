import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import {
  AuditAction,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  SellerOrderStatus,
  User
} from "@prisma/client";
import { createHmac, timingSafeEqual } from "crypto";
import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { AuditService } from "../../audit/audit.service";
import { PrismaService } from "../../prisma/prisma.service";

type CheckoutItemInput = { variantId: string; quantity: number };

@Injectable()
export class PaymentsService {
  private readonly legacyWebhookSecret = this.readEnv("PAYMENT_WEBHOOK_SECRET") ?? "dev_payment_webhook_secret";
  private readonly paymongoWebhookSecret = this.readEnv("PAYMONGO_WEBHOOK_SECRET") ?? this.readEnv("PAYMENT_WEBHOOK_SECRET");
  private readonly paymongoSecretKey = this.readEnv("PAYMONGO_SECRET_KEY");
  private readonly webOrigin = (this.readEnv("WEB_ORIGIN") ?? "http://localhost:3000").replace(/\/$/, "");

  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService
  ) {}

  async webhook(
    signature: string | undefined,
    input: { orderNumber: string; status: PaymentStatus; provider?: string; providerRef?: string }
  ) {
    this.verifyLegacySignature(signature, input);
    const order = await this.prisma.order.findUnique({ where: { orderNumber: input.orderNumber } });
    if (!order) throw new BadRequestException("Order not found.");

    return this.prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findFirstOrThrow({ where: { orderId: order.id }, orderBy: { createdAt: "desc" } });
      const updatedPayment = await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: input.status,
          provider: input.provider,
          providerRef: input.providerRef,
          paidAt: input.status === PaymentStatus.PAID ? new Date() : payment.paidAt
        }
      });
      await tx.order.update({ where: { id: order.id }, data: { paymentStatus: input.status } });
      await this.audit.write({
        action: input.status === PaymentStatus.REFUNDED ? AuditAction.REFUND : AuditAction.UPDATE,
        entityType: "Payment",
        entityId: updatedPayment.id,
        metadata: { orderNumber: order.orderNumber, status: input.status },
        client: tx
      });
      return { ok: true, payment: updatedPayment };
    });
  }

  async createPayMongoCheckout(
    user: User,
    input: { pickupAt: string; items?: CheckoutItemInput[] }
  ) {
    if (!this.paymongoSecretKey) throw new BadRequestException("PAYMONGO_SECRET_KEY is not configured.");
    const pickupAt = this.validatePickupAt(input.pickupAt);
    const expiresAt = this.pickupWindowEnd(pickupAt);
    const directItems = input.items?.length ? this.combineItems(input.items) : null;

    const cart = directItems
      ? null
      : await this.prisma.cart.findUnique({
          where: { userId: user.id },
          include: { items: { orderBy: { createdAt: "asc" } } }
        });
    const requestedItems = directItems ?? cart?.items.map((item) => ({ variantId: item.variantId, quantity: item.quantity })) ?? [];
    if (!requestedItems.length) throw new BadRequestException("Cart is empty.");

    const variants = await this.prisma.productVariant.findMany({
      where: { id: { in: requestedItems.map((item) => item.variantId) } },
      include: { product: true, store: true }
    });
    if (variants.length !== requestedItems.length) throw new BadRequestException("One or more products are unavailable.");

    const items = requestedItems.map((requested) => {
      const variant = variants.find((entry) => entry.id === requested.variantId)!;
      if (!variant.isActive || variant.product.status !== "ACTIVE" || variant.product.deletedAt) {
        throw new BadRequestException(`Product is unavailable: ${variant.product.name}`);
      }
      if (variant.availableStock < requested.quantity) {
        throw new BadRequestException(`Not enough available stock for ${variant.product.name}.`);
      }
      return { variant, quantity: requested.quantity };
    });

    const grandTotal = items.reduce((sum, item) => sum + Number(item.variant.price) * item.quantity, 0);
    const depositAmount = Math.round(grandTotal * 50) / 100;
    const remainingBalance = Math.round((grandTotal - depositAmount) * 100) / 100;
    const orderNumber = this.orderNumber();

    const order = await this.prisma.$transaction(async (tx) => {
      const createdOrder = await tx.order.create({
        data: {
          orderNumber,
          buyerId: user.id,
          status: OrderStatus.PENDING_PAYMENT,
          paymentStatus: PaymentStatus.PENDING,
          subtotal: grandTotal.toFixed(2),
          grandTotal: grandTotal.toFixed(2),
          depositAmount: depositAmount.toFixed(2),
          remainingBalance: remainingBalance.toFixed(2),
          pickupScheduledAt: pickupAt,
          expiresAt,
          clearCartOnPaid: !directItems
        }
      });

      const groups = new Map<string, typeof items>();
      for (const item of items) groups.set(item.variant.storeId, [...(groups.get(item.variant.storeId) ?? []), item]);
      for (const [storeId, storeItems] of groups) {
        const sellerSubtotal = storeItems.reduce((sum, item) => sum + Number(item.variant.price) * item.quantity, 0);
        const sellerOrder = await tx.sellerOrder.create({
          data: {
            orderId: createdOrder.id,
            storeId,
            status: SellerOrderStatus.PENDING,
            subtotal: sellerSubtotal.toFixed(2),
            payoutAmount: sellerSubtotal.toFixed(2),
            remainingBalance: (Math.round(sellerSubtotal * 50) / 100).toFixed(2)
          }
        });
        await tx.orderItem.createMany({
          data: storeItems.map(({ variant, quantity }) => ({
            orderId: createdOrder.id,
            sellerOrderId: sellerOrder.id,
            variantId: variant.id,
            storeId,
            productName: variant.product.name,
            variantName: variant.name,
            unit: variant.unit,
            quantity,
            unitPrice: Number(variant.price).toFixed(2),
            subtotal: (Number(variant.price) * quantity).toFixed(2)
          }))
        });
      }
      await tx.payment.create({
        data: {
          orderId: createdOrder.id,
          method: PaymentMethod.GCASH,
          status: PaymentStatus.PENDING,
          amount: depositAmount.toFixed(2),
          provider: "PAYMONGO"
        }
      });
      return createdOrder;
    });

    try {
      const response = await fetch("https://api.paymongo.com/v2/checkout_sessions", {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`${this.paymongoSecretKey}:`).toString("base64")}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          data: {
            attributes: {
              line_items: [{
                name: `Reservation deposit - ${order.orderNumber}`,
                description: "50% pickup reservation deposit",
                amount: Math.round(depositAmount * 100),
                currency: "PHP",
                quantity: 1
              }],
              payment_method_types: ["gcash"],
              success_url: `${this.webOrigin}/buyer/checkout/success?ref=${encodeURIComponent(order.orderNumber)}`,
              cancel_url: `${this.webOrigin}/buyer/checkout/failed?ref=${encodeURIComponent(order.orderNumber)}`,
              reference_number: order.orderNumber,
              description: "AgriFarm pickup reservation deposit",
              show_line_items: true
            }
          }
        })
      });
      const payload = (await response.json()) as {
        data?: { id?: string; attributes?: { checkout_url?: string } };
        errors?: Array<{ detail?: string; code?: string }>;
      };
      if (!response.ok || !payload.data?.id || !payload.data.attributes?.checkout_url) {
        const detail = payload.errors?.map((error) => error.detail ?? error.code).filter(Boolean).join(". ");
        throw new Error(detail || "Unable to create PayMongo checkout session.");
      }
      await this.prisma.payment.updateMany({
        where: { orderId: order.id, provider: "PAYMONGO" },
        data: { providerRef: payload.data.id }
      });
      return {
        checkoutUrl: payload.data.attributes.checkout_url,
        sessionId: payload.data.id,
        referenceNumber: order.orderNumber,
        orderId: order.id
      };
    } catch (caught) {
      await this.prisma.$transaction([
        this.prisma.order.update({ where: { id: order.id }, data: { status: OrderStatus.CANCELLED, paymentStatus: PaymentStatus.FAILED } }),
        this.prisma.sellerOrder.updateMany({ where: { orderId: order.id }, data: { status: SellerOrderStatus.CANCELLED } }),
        this.prisma.payment.updateMany({ where: { orderId: order.id }, data: { status: PaymentStatus.FAILED } })
      ]);
      throw new BadRequestException(caught instanceof Error ? caught.message : "Unable to create PayMongo checkout session.");
    }
  }

  async paymongoWebhook(signature: string | undefined, rawBody: Buffer | undefined, body: any) {
    this.verifyPayMongoSignature(signature, rawBody, Boolean(body?.data?.attributes?.livemode));
    const eventType = body?.data?.attributes?.type;
    if (eventType !== "checkout_session.payment.paid") return { received: true, ignored: true };

    const resource = body?.data?.attributes?.data;
    const sessionId = resource?.id as string | undefined;
    const referenceNumber = resource?.attributes?.reference_number as string | undefined;
    const payment = await this.prisma.payment.findFirst({
      where: {
        OR: [
          ...(sessionId ? [{ providerRef: sessionId }] : []),
          ...(referenceNumber ? [{ order: { orderNumber: referenceNumber } }] : [])
        ]
      },
      include: { order: { include: { items: true } } }
    });
    if (!payment) throw new BadRequestException("Reservation payment was not found.");
    if (payment.status === PaymentStatus.PAID && payment.order.status === OrderStatus.RESERVED) return { received: true };

    await this.prisma.$transaction(async (tx) => {
      for (const item of payment.order.items) {
        const updated = await tx.productVariant.updateMany({
          where: { id: item.variantId, availableStock: { gte: item.quantity } },
          data: {
            availableStock: { decrement: item.quantity },
            stockOnHand: { decrement: item.quantity },
            reservedStock: { increment: item.quantity }
          }
        });
        if (updated.count !== 1) throw new BadRequestException(`Stock changed before payment for ${item.productName}.`);
        const variant = await tx.productVariant.findUniqueOrThrow({ where: { id: item.variantId } });
        await tx.inventoryLedger.create({
          data: {
            variantId: item.variantId,
            changedById: payment.order.buyerId,
            reason: "RESERVATION",
            quantityDelta: -item.quantity,
            quantityAfter: variant.availableStock,
            referenceType: "Order",
            referenceId: payment.order.id
          }
        });
      }
      await tx.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.PAID, paidAt: new Date() }
      });
      await tx.order.update({
        where: { id: payment.order.id },
        data: { status: OrderStatus.RESERVED, paymentStatus: PaymentStatus.PAID }
      });
      await tx.sellerOrder.updateMany({
        where: { orderId: payment.order.id },
        data: { status: SellerOrderStatus.RESERVED, confirmedAt: new Date() }
      });
      if (payment.order.clearCartOnPaid) {
        const cart = await tx.cart.findUnique({ where: { userId: payment.order.buyerId } });
        if (cart) await tx.cartItem.deleteMany({ where: { cartId: cart.id, variantId: { in: payment.order.items.map((item) => item.variantId) } } });
      }
      await this.audit.write({
        actorId: payment.order.buyerId,
        action: AuditAction.STATUS_CHANGE,
        entityType: "Order",
        entityId: payment.order.id,
        metadata: { status: OrderStatus.RESERVED, depositPaid: payment.amount.toString() },
        client: tx
      });
    });
    return { received: true };
  }

  private combineItems(items: CheckoutItemInput[]) {
    const combined = new Map<string, number>();
    for (const item of items) {
      if (!item.variantId || !Number.isInteger(item.quantity) || item.quantity < 1) throw new BadRequestException("Invalid checkout item.");
      combined.set(item.variantId, (combined.get(item.variantId) ?? 0) + item.quantity);
    }
    return [...combined].map(([variantId, quantity]) => ({ variantId, quantity }));
  }

  private validatePickupAt(value: string) {
    const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(value);
    if (!match) throw new BadRequestException("Choose a valid pickup date and time.");
    const [, year, month, day, hour, minute] = match;
    const pickupAt = new Date(`${year}-${month}-${day}T${hour}:${minute}:00+08:00`);
    const nowInManila = new Date(Date.now() + 8 * 60 * 60 * 1000);
    const todayUtc = Date.UTC(nowInManila.getUTCFullYear(), nowInManila.getUTCMonth(), nowInManila.getUTCDate());
    const selectedUtc = Date.UTC(Number(year), Number(month) - 1, Number(day));
    const daysAway = Math.round((selectedUtc - todayUtc) / 86_400_000);
    const minutes = Number(hour) * 60 + Number(minute);
    if (daysAway < 1 || daysAway > 2) throw new BadRequestException("Pickup must be scheduled 1 to 2 days from today.");
    if (minutes < 12 * 60 || minutes > 17 * 60) throw new BadRequestException("Pickup time must be from 12:00 PM to 5:00 PM.");
    return pickupAt;
  }

  private pickupWindowEnd(pickupAt: Date) {
    const manila = new Date(pickupAt.getTime() + 8 * 60 * 60 * 1000);
    return new Date(Date.UTC(manila.getUTCFullYear(), manila.getUTCMonth(), manila.getUTCDate(), 9, 0, 0));
  }

  private orderNumber() {
    return `AGR-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
  }

  private verifyLegacySignature(signature: string | undefined, body: unknown) {
    if (!signature) throw new UnauthorizedException("Missing payment signature.");
    const expected = createHmac("sha256", this.legacyWebhookSecret).update(JSON.stringify(body)).digest("hex");
    this.assertSignature(expected, signature.replace(/^sha256=/, ""));
  }

  private verifyPayMongoSignature(signature: string | undefined, rawBody: Buffer | undefined, liveMode: boolean) {
    if (!this.paymongoWebhookSecret) throw new UnauthorizedException("PAYMONGO_WEBHOOK_SECRET is not configured.");
    if (!signature || !rawBody) throw new UnauthorizedException("Missing PayMongo signature.");
    const parts = Object.fromEntries(signature.split(",").map((part) => part.trim().split("=", 2)));
    const timestamp = parts.t;
    const provided = liveMode ? parts.li : parts.te;
    if (!timestamp || !provided) throw new UnauthorizedException("Invalid PayMongo signature format.");
    const expected = createHmac("sha256", this.paymongoWebhookSecret).update(`${timestamp}.${rawBody.toString("utf8")}`).digest("hex");
    this.assertSignature(expected, provided);
  }

  private assertSignature(expected: string, provided: string) {
    const expectedBuffer = Buffer.from(expected, "hex");
    const providedBuffer = Buffer.from(provided, "hex");
    if (expectedBuffer.length !== providedBuffer.length || !timingSafeEqual(expectedBuffer, providedBuffer)) {
      throw new UnauthorizedException("Invalid payment signature.");
    }
  }

  private readEnv(key: string) {
    if (process.env[key]) return process.env[key];
    const candidates = [join(process.cwd(), ".env"), join(process.cwd(), "apps", "api", ".env"), join(process.cwd(), "apps", "api", ".env.local")];
    for (const file of candidates) {
      if (!existsSync(file)) continue;
      const line = readFileSync(file, "utf8").split(/\r?\n/).find((entry) => entry.trim().startsWith(`${key}=`));
      if (!line) continue;
      return line.slice(line.indexOf("=") + 1).trim().replace(/^['"]|['"]$/g, "");
    }
    return undefined;
  }
}
