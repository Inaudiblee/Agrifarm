import { Body, Controller, Headers, Post } from "@nestjs/common";
import { PaymentStatus } from "@prisma/client";
import { IsEnum, IsOptional, IsString } from "class-validator";
import { PaymentsService } from "./payments.service";

class PaymentWebhookDto {
  @IsString()
  orderNumber!: string;

  @IsEnum(PaymentStatus)
  status!: PaymentStatus;

  @IsOptional()
  @IsString()
  provider?: string;

  @IsOptional()
  @IsString()
  providerRef?: string;
}

@Controller("payments")
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post("webhook")
  webhook(@Headers("x-agrifarm-signature") signature: string | undefined, @Body() body: PaymentWebhookDto) {
    return this.paymentsService.webhook(signature, body);
  }
}
