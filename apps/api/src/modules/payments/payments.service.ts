import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { AuditAction, PaymentStatus } from "@prisma/client";
import { createHmac, timingSafeEqual } from "crypto";
import { AuditService } from "../../audit/audit.service";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class PaymentsService {
  private readonly webhookSecret = process.env.PAYMENT_WEBHOOK_SECRET ?? "dev_payment_webhook_secret";

  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService
  ) {}

  async webhook(
    signature: string | undefined,
    input: { orderNumber: string; status: PaymentStatus; provider?: string; providerRef?: string }
  ) {
    this.verifySignature(signature, input);

    const order = await this.prisma.order.findUnique({ where: { orderNumber: input.orderNumber } });
    if (!order) {
      throw new BadRequestException("Order not found.");
    }

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
      await tx.order.update({
        where: { id: order.id },
        data: { paymentStatus: input.status }
      });
      await this.audit.write({
        action: input.status === PaymentStatus.REFUNDED ? AuditAction.REFUND : AuditAction.UPDATE,
        entityType: "Payment",
        entityId: updatedPayment.id,
        metadata: {
          orderNumber: order.orderNumber,
          status: input.status,
          provider: input.provider,
          providerRef: input.providerRef
        },
        client: tx
      });

      return { ok: true, payment: updatedPayment };
    });
  }

  private verifySignature(signature: string | undefined, body: unknown) {
    if (!signature) {
      throw new UnauthorizedException("Missing payment signature.");
    }

    const expected = createHmac("sha256", this.webhookSecret).update(JSON.stringify(body)).digest("hex");
    const normalizedSignature = signature.replace(/^sha256=/, "");
    const expectedBuffer = Buffer.from(expected, "hex");
    const providedBuffer = Buffer.from(normalizedSignature, "hex");
    if (expectedBuffer.length !== providedBuffer.length || !timingSafeEqual(expectedBuffer, providedBuffer)) {
      throw new UnauthorizedException("Invalid payment signature.");
    }
  }
}
