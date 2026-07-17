import { Body, Controller, Headers, Post, RawBodyRequest, Req, UseGuards } from "@nestjs/common";
import { PaymentStatus } from "@prisma/client";
import { IsArray, IsEnum, IsNumber, IsOptional, IsString, Min, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { AuthenticatedRequest, AuthGuard } from "../auth/auth.guard";
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

class PayMongoCheckoutItemDto {
  @IsString()
  variantId!: string;

  @IsNumber()
  @Min(1)
  quantity!: number;
}

class PayMongoCheckoutDto {
  @IsString()
  pickupAt!: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PayMongoCheckoutItemDto)
  items?: PayMongoCheckoutItemDto[];
}

@Controller("payments")
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post("webhook")
  webhook(@Headers("x-agrifarm-signature") signature: string | undefined, @Body() body: PaymentWebhookDto) {
    return this.paymentsService.webhook(signature, body);
  }

  @Post("paymongo/checkout-session")
  @UseGuards(AuthGuard)
  createPayMongoCheckout(@Req() request: AuthenticatedRequest, @Body() body: PayMongoCheckoutDto) {
    return this.paymentsService.createPayMongoCheckout(request.user!, body);
  }

  @Post("paymongo/webhook")
  paymongoWebhook(
    @Headers("paymongo-signature") signature: string | undefined,
    @Req() request: RawBodyRequest<AuthenticatedRequest>,
    @Body() body: unknown
  ) {
    return this.paymentsService.paymongoWebhook(signature, request.rawBody, body);
  }
}
