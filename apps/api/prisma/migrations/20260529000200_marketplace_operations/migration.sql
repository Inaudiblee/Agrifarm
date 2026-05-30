-- CreateEnum
CREATE TYPE "public"."SellerOrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "public"."FinancialTransactionType" AS ENUM ('SALE', 'COMMISSION', 'REFUND', 'PAYOUT', 'ADJUSTMENT');

-- CreateEnum
CREATE TYPE "public"."CommissionPlanStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "public"."AuditAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'STATUS_CHANGE', 'APPROVAL', 'REJECTION', 'PAYOUT', 'REFUND');

-- CreateEnum
CREATE TYPE "public"."NotificationType" AS ENUM ('ORDER_UPDATE', 'PAYMENT_UPDATE', 'FULFILLMENT_UPDATE', 'INVENTORY_ALERT', 'ACCOUNT_UPDATE', 'SYSTEM');

-- DropForeignKey
ALTER TABLE "public"."Fulfillment" DROP CONSTRAINT "Fulfillment_orderId_fkey";

-- DropIndex
DROP INDEX "public"."Fulfillment_orderId_key";

-- DropIndex
DROP INDEX "public"."ProductVariant_sku_key";

-- AlterTable
ALTER TABLE "public"."Fulfillment" DROP COLUMN "orderId",
ADD COLUMN     "sellerOrderId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."OrderItem" ADD COLUMN     "sellerOrderId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."Product" ADD COLUMN     "searchVector" tsvector;

-- AlterTable
ALTER TABLE "public"."ProductVariant" ADD COLUMN     "storeId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "public"."SellerOrder" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "status" "public"."SellerOrderStatus" NOT NULL DEFAULT 'PENDING',
    "subtotal" DECIMAL(12,2) NOT NULL,
    "deliveryFee" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "commissionFee" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "payoutAmount" DECIMAL(12,2) NOT NULL,
    "confirmedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SellerOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FinancialTransaction" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "orderId" TEXT,
    "sellerOrderId" TEXT,
    "type" "public"."FinancialTransactionType" NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "balanceAfter" DECIMAL(12,2) NOT NULL,
    "reference" VARCHAR(160),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FinancialTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CommissionPlan" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "description" TEXT,
    "ratePercent" DECIMAL(5,2) NOT NULL,
    "fixedFee" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "status" "public"."CommissionPlanStatus" NOT NULL DEFAULT 'ACTIVE',
    "effectiveFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "effectiveUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommissionPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."StoreCommission" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "commissionPlanId" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StoreCommission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AuditLog" (
    "id" TEXT NOT NULL,
    "actorId" TEXT,
    "action" "public"."AuditAction" NOT NULL,
    "entityType" VARCHAR(120) NOT NULL,
    "entityId" VARCHAR(120),
    "metadata" JSONB,
    "ipAddress" VARCHAR(45),
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "public"."NotificationType" NOT NULL,
    "title" VARCHAR(160) NOT NULL,
    "body" TEXT,
    "metadata" JSONB,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SellerOrder_orderId_idx" ON "public"."SellerOrder"("orderId");

-- CreateIndex
CREATE INDEX "SellerOrder_storeId_idx" ON "public"."SellerOrder"("storeId");

-- CreateIndex
CREATE INDEX "SellerOrder_status_idx" ON "public"."SellerOrder"("status");

-- CreateIndex
CREATE UNIQUE INDEX "SellerOrder_orderId_storeId_key" ON "public"."SellerOrder"("orderId", "storeId");

-- CreateIndex
CREATE INDEX "FinancialTransaction_storeId_idx" ON "public"."FinancialTransaction"("storeId");

-- CreateIndex
CREATE INDEX "FinancialTransaction_orderId_idx" ON "public"."FinancialTransaction"("orderId");

-- CreateIndex
CREATE INDEX "FinancialTransaction_sellerOrderId_idx" ON "public"."FinancialTransaction"("sellerOrderId");

-- CreateIndex
CREATE INDEX "FinancialTransaction_type_idx" ON "public"."FinancialTransaction"("type");

-- CreateIndex
CREATE INDEX "FinancialTransaction_createdAt_idx" ON "public"."FinancialTransaction"("createdAt");

-- CreateIndex
CREATE INDEX "CommissionPlan_status_idx" ON "public"."CommissionPlan"("status");

-- CreateIndex
CREATE INDEX "CommissionPlan_effectiveFrom_effectiveUntil_idx" ON "public"."CommissionPlan"("effectiveFrom", "effectiveUntil");

-- CreateIndex
CREATE INDEX "StoreCommission_storeId_idx" ON "public"."StoreCommission"("storeId");

-- CreateIndex
CREATE INDEX "StoreCommission_commissionPlanId_idx" ON "public"."StoreCommission"("commissionPlanId");

-- CreateIndex
CREATE INDEX "StoreCommission_startsAt_endsAt_idx" ON "public"."StoreCommission"("startsAt", "endsAt");

-- CreateIndex
CREATE INDEX "AuditLog_actorId_idx" ON "public"."AuditLog"("actorId");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "public"."AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "public"."AuditLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "public"."AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "Notification_userId_readAt_idx" ON "public"."Notification"("userId", "readAt");

-- CreateIndex
CREATE INDEX "Notification_type_idx" ON "public"."Notification"("type");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "public"."Notification"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Fulfillment_sellerOrderId_key" ON "public"."Fulfillment"("sellerOrderId");

-- CreateIndex
CREATE INDEX "OrderItem_sellerOrderId_idx" ON "public"."OrderItem"("sellerOrderId");

-- CreateIndex
CREATE INDEX "ProductVariant_storeId_idx" ON "public"."ProductVariant"("storeId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariant_storeId_sku_key" ON "public"."ProductVariant"("storeId", "sku");

-- AddForeignKey
ALTER TABLE "public"."ProductVariant" ADD CONSTRAINT "ProductVariant_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "public"."Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SellerOrder" ADD CONSTRAINT "SellerOrder_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SellerOrder" ADD CONSTRAINT "SellerOrder_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "public"."Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrderItem" ADD CONSTRAINT "OrderItem_sellerOrderId_fkey" FOREIGN KEY ("sellerOrderId") REFERENCES "public"."SellerOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Fulfillment" ADD CONSTRAINT "Fulfillment_sellerOrderId_fkey" FOREIGN KEY ("sellerOrderId") REFERENCES "public"."SellerOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FinancialTransaction" ADD CONSTRAINT "FinancialTransaction_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "public"."Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FinancialTransaction" ADD CONSTRAINT "FinancialTransaction_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FinancialTransaction" ADD CONSTRAINT "FinancialTransaction_sellerOrderId_fkey" FOREIGN KEY ("sellerOrderId") REFERENCES "public"."SellerOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StoreCommission" ADD CONSTRAINT "StoreCommission_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "public"."Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StoreCommission" ADD CONSTRAINT "StoreCommission_commissionPlanId_fkey" FOREIGN KEY ("commissionPlanId") REFERENCES "public"."CommissionPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Search support
CREATE INDEX "Product_searchVector_idx" ON "public"."Product" USING GIN ("searchVector");

CREATE OR REPLACE FUNCTION "public"."set_product_search_vector"()
RETURNS trigger AS $$
BEGIN
  NEW."searchVector" :=
    setweight(to_tsvector('english', coalesce(NEW."name", '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW."description", '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "Product_searchVector_trigger"
BEFORE INSERT OR UPDATE OF "name", "description"
ON "public"."Product"
FOR EACH ROW
EXECUTE FUNCTION "public"."set_product_search_vector"();

UPDATE "public"."Product"
SET "searchVector" =
  setweight(to_tsvector('english', coalesce("name", '')), 'A') ||
  setweight(to_tsvector('english', coalesce("description", '')), 'B');

-- Data quality guardrails
ALTER TABLE "public"."SellerOrder" ADD CONSTRAINT "SellerOrder_amounts_nonnegative" CHECK ("subtotal" >= 0 AND "deliveryFee" >= 0 AND "commissionFee" >= 0 AND "payoutAmount" >= 0);
ALTER TABLE "public"."FinancialTransaction" ADD CONSTRAINT "FinancialTransaction_amount_not_zero" CHECK ("amount" <> 0);
ALTER TABLE "public"."CommissionPlan" ADD CONSTRAINT "CommissionPlan_rate_range" CHECK ("ratePercent" >= 0 AND "ratePercent" <= 100);
ALTER TABLE "public"."CommissionPlan" ADD CONSTRAINT "CommissionPlan_fixedFee_nonnegative" CHECK ("fixedFee" >= 0);
ALTER TABLE "public"."CommissionPlan" ADD CONSTRAINT "CommissionPlan_effective_dates" CHECK ("effectiveUntil" IS NULL OR "effectiveUntil" > "effectiveFrom");
ALTER TABLE "public"."StoreCommission" ADD CONSTRAINT "StoreCommission_dates" CHECK ("endsAt" IS NULL OR "endsAt" > "startsAt");
