import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { PaymentMethod, SellerOrderStatus } from "@prisma/client";
import { IsEnum, IsOptional, IsString } from "class-validator";
import { AuthenticatedRequest, AuthGuard } from "../auth/auth.guard";
import { Roles } from "../../security/roles.decorator";
import { RolesGuard } from "../../security/roles.guard";
import { OrdersService } from "./orders.service";

class CheckoutDto {
  @IsString()
  shippingAddressId!: string;

  @IsEnum(PaymentMethod)
  paymentMethod!: PaymentMethod;

  @IsOptional()
  @IsString()
  notes?: string;
}

class UpdateSellerOrderStatusDto {
  @IsEnum(SellerOrderStatus)
  status!: SellerOrderStatus;
}

@UseGuards(AuthGuard)
@Controller("orders")
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  mine(@Req() request: AuthenticatedRequest) {
    return this.ordersService.listMine(request.user!);
  }

  @Get("seller")
  @UseGuards(AuthGuard, RolesGuard)
  @Roles("SELLER")
  sellerOrders(@Req() request: AuthenticatedRequest) {
    return this.ordersService.listSellerOrders(request.user!);
  }

  @Patch("seller/:id/status")
  @UseGuards(AuthGuard, RolesGuard)
  @Roles("SELLER")
  updateSellerOrderStatus(
    @Req() request: AuthenticatedRequest,
    @Param("id") id: string,
    @Body() body: UpdateSellerOrderStatusDto
  ) {
    return this.ordersService.updateSellerOrderStatus(request.user!, id, body.status);
  }

  @Get(":id")
  get(@Req() request: AuthenticatedRequest, @Param("id") id: string) {
    return this.ordersService.getMine(request.user!, id);
  }

  @Post("checkout")
  checkout(@Req() request: AuthenticatedRequest, @Body() body: CheckoutDto) {
    return this.ordersService.checkout(request.user!, body);
  }

  @Post(":id/cancel")
  cancel(@Req() request: AuthenticatedRequest, @Param("id") id: string) {
    return this.ordersService.cancelMine(request.user!, id);
  }
}
