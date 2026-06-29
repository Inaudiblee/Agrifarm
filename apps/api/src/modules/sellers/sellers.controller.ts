import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { FarmerGender } from "@prisma/client";
import { IsEnum, IsOptional, IsString, Matches } from "class-validator";
import { AuthenticatedRequest, AuthGuard } from "../auth/auth.guard";
import { Roles } from "../../security/roles.decorator";
import { RolesGuard } from "../../security/roles.guard";
import { SellersService } from "./sellers.service";

class SellerProfileDto {
  @IsString()
  businessName!: string;

  @IsOptional()
  @IsEnum(FarmerGender)
  gender?: FarmerGender;

  @IsOptional()
  @IsString()
  @Matches(/^(male|female)-0[1-5]$/)
  avatarKey?: string;
}

@UseGuards(AuthGuard)
@Controller("sellers")
export class SellersController {
  constructor(private readonly sellersService: SellersService) {}

  @UseGuards(AuthGuard, RolesGuard)
  @Roles("SELLER")
  @Get("me")
  me(@Req() request: AuthenticatedRequest) {
    return this.sellersService.getProfile(request.user!);
  }

  @Post("profile")
  @UseGuards(AuthGuard, RolesGuard)
  @Roles("SELLER")
  profile(@Req() request: AuthenticatedRequest, @Body() body: SellerProfileDto) {
    return this.sellersService.upsertProfile(request.user!, body);
  }
}
