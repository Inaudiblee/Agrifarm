import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { StoreStatus } from "@prisma/client";
import { ArrayNotEmpty, IsArray, IsEnum, IsOptional, IsString } from "class-validator";
import { AuthenticatedRequest, AuthGuard } from "../auth/auth.guard";
import { Roles } from "../../security/roles.decorator";
import { RolesGuard } from "../../security/roles.guard";
import { StoresService } from "./stores.service";

class CreateStoreDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(StoreStatus)
  status?: StoreStatus;
}

class ServiceAreasDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  barangays!: string[];

  @IsOptional()
  @IsString()
  deliveryFee?: string;

  @IsOptional()
  @IsString()
  minOrder?: string;
}

@Controller("stores")
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @Get()
  list(@Req() request: AuthenticatedRequest) {
    return this.storesService.list();
  }

  @Get("slug/:slug")
  getBySlug(@Param("slug") slug: string) {
    return this.storesService.getBySlug(slug);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles("SELLER")
  @Get("mine")
  mine(@Req() request: AuthenticatedRequest) {
    return this.storesService.mine(request.user!);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles("SELLER")
  @Post()
  create(@Req() request: AuthenticatedRequest, @Body() body: CreateStoreDto) {
    return this.storesService.create(request.user!, body);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles("SELLER")
  @Patch(":id")
  update(@Req() request: AuthenticatedRequest, @Param("id") id: string, @Body() body: Partial<CreateStoreDto>) {
    return this.storesService.update(request.user!, id, body);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles("SELLER")
  @Delete(":id")
  close(@Req() request: AuthenticatedRequest, @Param("id") id: string) {
    return this.storesService.close(request.user!, id);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles("SELLER")
  @Post(":id/service-areas")
  addServiceAreas(@Req() request: AuthenticatedRequest, @Param("id") id: string, @Body() body: ServiceAreasDto) {
    return this.storesService.addServiceAreas(request.user!, id, body);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles("SELLER")
  @Delete(":id/service-areas/:barangayId")
  removeServiceArea(@Req() request: AuthenticatedRequest, @Param("id") id: string, @Param("barangayId") barangayId: string) {
    return this.storesService.removeServiceArea(request.user!, id, barangayId);
  }
}
