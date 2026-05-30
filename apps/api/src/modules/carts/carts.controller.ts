import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { IsInt, IsString, Min } from "class-validator";
import { AuthenticatedRequest, AuthGuard } from "../auth/auth.guard";
import { CartsService } from "./carts.service";

class AddCartItemDto {
  @IsString()
  variantId!: string;

  @IsInt()
  @Min(1)
  quantity!: number;
}

@UseGuards(AuthGuard)
@Controller("cart")
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  @Get()
  get(@Req() request: AuthenticatedRequest) {
    return this.cartsService.getCart(request.user!);
  }

  @Post("items")
  addItem(@Req() request: AuthenticatedRequest, @Body() body: AddCartItemDto) {
    return this.cartsService.addItem(request.user!, body);
  }

  @Patch("items/:id")
  updateItem(@Req() request: AuthenticatedRequest, @Param("id") id: string, @Body() body: AddCartItemDto) {
    return this.cartsService.updateItem(request.user!, id, body.quantity);
  }

  @Delete("items/:id")
  removeItem(@Req() request: AuthenticatedRequest, @Param("id") id: string) {
    return this.cartsService.removeItem(request.user!, id);
  }

  @Delete()
  clear(@Req() request: AuthenticatedRequest) {
    return this.cartsService.clear(request.user!);
  }
}
