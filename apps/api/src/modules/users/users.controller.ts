import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { IsBoolean, IsOptional, IsString } from "class-validator";
import { AuthenticatedRequest, AuthGuard } from "../auth/auth.guard";
import { UsersService } from "./users.service";

class CreateAddressDto {
  @IsOptional()
  @IsString()
  label?: string;

  @IsString()
  recipientName!: string;

  @IsString()
  phone!: string;

  @IsString()
  street!: string;

  @IsString()
  barangay!: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  province?: string;

  @IsOptional()
  @IsString()
  postalCode?: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

class UpdateAddressDto {
  @IsOptional()
  @IsString()
  label?: string;

  @IsOptional()
  @IsString()
  recipientName?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  street?: string;

  @IsOptional()
  @IsString()
  barangay?: string;

  @IsOptional()
  @IsString()
  postalCode?: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

@UseGuards(AuthGuard)
@Controller("users/me")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get("addresses")
  listAddresses(@Req() request: AuthenticatedRequest) {
    return this.usersService.listAddresses(request.user!);
  }

  @Post("addresses")
  createAddress(@Req() request: AuthenticatedRequest, @Body() body: CreateAddressDto) {
    return this.usersService.createAddress(request.user!, body);
  }

  @Get("addresses/:id")
  getAddress(@Req() request: AuthenticatedRequest, @Param("id") id: string) {
    return this.usersService.getOwnedAddress(request.user!, id);
  }

  @Patch("addresses/:id")
  updateAddress(@Req() request: AuthenticatedRequest, @Param("id") id: string, @Body() body: UpdateAddressDto) {
    return this.usersService.updateAddress(request.user!, id, body);
  }

  @Post("addresses/:id/default")
  setDefaultAddress(@Req() request: AuthenticatedRequest, @Param("id") id: string) {
    return this.usersService.setDefaultAddress(request.user!, id);
  }

  @Delete("addresses/:id")
  deleteAddress(@Req() request: AuthenticatedRequest, @Param("id") id: string) {
    return this.usersService.deleteAddress(request.user!, id);
  }
}
