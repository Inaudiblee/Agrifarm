-- Pasig coverage and multi-seller integrity hardening

-- Drop old single-column foreign keys before replacing them with composite integrity guards.
ALTER TABLE "public"."Order" DROP CONSTRAINT "Order_shippingAddressId_fkey";
ALTER TABLE "public"."ProductVariant" DROP CONSTRAINT "ProductVariant_productId_fkey";
ALTER TABLE "public"."OrderItem" DROP CONSTRAINT "OrderItem_sellerOrderId_fkey";
ALTER TABLE "public"."OrderItem" DROP CONSTRAINT "OrderItem_variantId_fkey";

-- First-class barangay catalog for serviceability, validation, and delivery rules.
CREATE TABLE "public"."Barangay" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "normalizedName" VARCHAR(120) NOT NULL,
    "city" VARCHAR(120) NOT NULL DEFAULT 'Pasig',
    "province" VARCHAR(120) NOT NULL DEFAULT 'Metro Manila',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Barangay_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."StoreServiceArea" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "barangayId" TEXT NOT NULL,
    "deliveryFee" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "minOrder" DECIMAL(12,2),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StoreServiceArea_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "public"."Address" ADD COLUMN "barangayId" TEXT;

CREATE UNIQUE INDEX "Barangay_normalizedName_key" ON "public"."Barangay"("normalizedName");
CREATE INDEX "Barangay_city_province_idx" ON "public"."Barangay"("city", "province");
CREATE INDEX "Barangay_isActive_idx" ON "public"."Barangay"("isActive");

CREATE UNIQUE INDEX "StoreServiceArea_storeId_barangayId_key" ON "public"."StoreServiceArea"("storeId", "barangayId");
CREATE INDEX "StoreServiceArea_barangayId_idx" ON "public"."StoreServiceArea"("barangayId");
CREATE INDEX "StoreServiceArea_isActive_idx" ON "public"."StoreServiceArea"("isActive");

CREATE UNIQUE INDEX "Address_id_userId_key" ON "public"."Address"("id", "userId");
CREATE INDEX "Address_barangayId_idx" ON "public"."Address"("barangayId");

CREATE UNIQUE INDEX "Product_id_storeId_key" ON "public"."Product"("id", "storeId");
CREATE UNIQUE INDEX "ProductVariant_id_storeId_key" ON "public"."ProductVariant"("id", "storeId");
CREATE UNIQUE INDEX "SellerOrder_id_storeId_key" ON "public"."SellerOrder"("id", "storeId");

ALTER TABLE "public"."Address" ADD CONSTRAINT "Address_barangayId_fkey" FOREIGN KEY ("barangayId") REFERENCES "public"."Barangay"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "public"."StoreServiceArea" ADD CONSTRAINT "StoreServiceArea_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "public"."Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."StoreServiceArea" ADD CONSTRAINT "StoreServiceArea_barangayId_fkey" FOREIGN KEY ("barangayId") REFERENCES "public"."Barangay"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "public"."Order" ADD CONSTRAINT "Order_shippingAddressId_buyerId_fkey" FOREIGN KEY ("shippingAddressId", "buyerId") REFERENCES "public"."Address"("id", "userId") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "public"."ProductVariant" ADD CONSTRAINT "ProductVariant_productId_storeId_fkey" FOREIGN KEY ("productId", "storeId") REFERENCES "public"."Product"("id", "storeId") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."OrderItem" ADD CONSTRAINT "OrderItem_sellerOrderId_storeId_fkey" FOREIGN KEY ("sellerOrderId", "storeId") REFERENCES "public"."SellerOrder"("id", "storeId") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."OrderItem" ADD CONSTRAINT "OrderItem_variantId_storeId_fkey" FOREIGN KEY ("variantId", "storeId") REFERENCES "public"."ProductVariant"("id", "storeId") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "public"."StoreServiceArea" ADD CONSTRAINT "StoreServiceArea_amounts_nonnegative" CHECK ("deliveryFee" >= 0 AND ("minOrder" IS NULL OR "minOrder" >= 0));
