import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { IsBoolean, IsInt, IsOptional, IsString, Min } from "class-validator";
import { AuthenticatedRequest, AuthGuard } from "../auth/auth.guard";
import { Roles } from "../../security/roles.decorator";
import { RolesGuard } from "../../security/roles.guard";
import { ProductsService } from "./products.service";

class CreateProductDto {
  @IsOptional()
  @IsString()
  storeId?: string;

  @IsOptional()
  @IsString()
  urbanGardenName?: string;

  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  variantName?: string;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsString()
  price!: string;

  @IsInt()
  @Min(0)
  stockOnHand!: number;

  @IsOptional()
  @IsBoolean()
  imageWillBeUploaded?: boolean;
}

class UpdateProductDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

class CreateVariantDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsString()
  price!: string;

  @IsInt()
  @Min(0)
  stockOnHand!: number;
}

class UpdateVariantDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsString()
  price?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

class AdjustStockDto {
  @IsInt()
  quantityDelta!: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

class ProductImageDto {
  @IsString()
  url!: string;

  @IsOptional()
  @IsString()
  altText?: string;

  @IsOptional()
  @IsInt()
  displayOrder?: number;

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}

@Controller("products")
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  list(@Query("barangay") barangay?: string, @Query("q") q?: string) {
    return this.productsService.list({ barangay, q });
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles("SELLER")
  @Get("mine")
  mine(@Req() request: AuthenticatedRequest) {
    return this.productsService.listMine(request.user!);
  }

  @Get(":id")
  get(@Param("id") id: string) {
    return this.productsService.get(id);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles("SELLER")
  @Post()
  create(@Req() request: AuthenticatedRequest, @Body() body: CreateProductDto) {
    return this.productsService.create(request.user!, body);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles("SELLER")
  @Patch(":id")
  update(@Req() request: AuthenticatedRequest, @Param("id") id: string, @Body() body: UpdateProductDto) {
    return this.productsService.update(request.user!, id, body);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles("SELLER")
  @Delete(":id")
  archive(@Req() request: AuthenticatedRequest, @Param("id") id: string) {
    return this.productsService.archive(request.user!, id);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles("SELLER")
  @Post(":id/images")
  addImage(@Req() request: AuthenticatedRequest, @Param("id") id: string, @Body() body: ProductImageDto) {
    return this.productsService.addImage(request.user!, id, body);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles("SELLER")
  @Post(":id/images/upload")
  @UseInterceptors(FileInterceptor("image", {
    limits: { fileSize: 5 * 1024 * 1024, files: 1 },
    fileFilter: (_request, file, callback) => {
      const allowed = ["image/jpeg", "image/png", "image/webp"];
      callback(allowed.includes(file.mimetype) ? null : new BadRequestException("Use a JPG, PNG, or WebP image."), allowed.includes(file.mimetype));
    }
  }))
  uploadImage(
    @Req() request: AuthenticatedRequest,
    @Param("id") id: string,
    @UploadedFile() file?: { buffer: Buffer; mimetype: string; size: number; originalname: string }
  ) {
    if (!file) throw new BadRequestException("Choose a product image to upload.");
    return this.productsService.uploadImage(request.user!, id, file);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles("SELLER")
  @Post(":id/variants")
  addVariant(@Req() request: AuthenticatedRequest, @Param("id") id: string, @Body() body: CreateVariantDto) {
    return this.productsService.addVariant(request.user!, id, body);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles("SELLER")
  @Patch("variants/:variantId")
  updateVariant(@Req() request: AuthenticatedRequest, @Param("variantId") variantId: string, @Body() body: UpdateVariantDto) {
    return this.productsService.updateVariant(request.user!, variantId, body);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles("SELLER")
  @Post("variants/:variantId/stock-adjustments")
  adjustStock(@Req() request: AuthenticatedRequest, @Param("variantId") variantId: string, @Body() body: AdjustStockDto) {
    return this.productsService.adjustStock(request.user!, variantId, body);
  }
}
