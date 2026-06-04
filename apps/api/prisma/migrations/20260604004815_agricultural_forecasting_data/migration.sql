-- CreateEnum
CREATE TYPE "public"."FarmingSiteType" AS ENUM ('BACKYARD', 'COMMUNITY_GARDEN', 'ROOFTOP', 'SCHOOL_GARDEN', 'INSTITUTIONAL', 'COMMERCIAL', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."CultivationStatus" AS ENUM ('PLANNED', 'PLANTED', 'GROWING', 'HARVESTING', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "public"."AgriculturalDataSource" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "organization" VARCHAR(255),
    "referenceUrl" TEXT,
    "notes" TEXT,
    "importedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgriculturalDataSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UrbanFarmer" (
    "id" TEXT NOT NULL,
    "barangayId" TEXT NOT NULL,
    "sourceId" TEXT,
    "externalRecordId" VARCHAR(160),
    "registrationNumber" VARCHAR(120),
    "fullName" VARCHAR(255) NOT NULL,
    "registrationDate" DATE,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "contactDetails" JSONB,
    "attributes" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UrbanFarmer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FarmingAssociation" (
    "id" TEXT NOT NULL,
    "barangayId" TEXT,
    "sourceId" TEXT,
    "externalRecordId" VARCHAR(160),
    "name" VARCHAR(255) NOT NULL,
    "registrationNo" VARCHAR(120),
    "establishedDate" DATE,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "attributes" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FarmingAssociation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FarmingAssociationMember" (
    "associationId" TEXT NOT NULL,
    "farmerId" TEXT NOT NULL,
    "role" VARCHAR(120),
    "joinedAt" DATE,
    "leftAt" DATE,

    CONSTRAINT "FarmingAssociationMember_pkey" PRIMARY KEY ("associationId","farmerId")
);

-- CreateTable
CREATE TABLE "public"."FarmingSite" (
    "id" TEXT NOT NULL,
    "barangayId" TEXT NOT NULL,
    "associationId" TEXT,
    "sourceId" TEXT,
    "externalRecordId" VARCHAR(160),
    "name" VARCHAR(255) NOT NULL,
    "siteType" "public"."FarmingSiteType" NOT NULL,
    "address" TEXT,
    "areaSqm" DECIMAL(14,2),
    "latitude" DECIMAL(10,7),
    "longitude" DECIMAL(10,7),
    "establishedDate" DATE,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "attributes" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FarmingSite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FarmingSiteFarmer" (
    "siteId" TEXT NOT NULL,
    "farmerId" TEXT NOT NULL,
    "role" VARCHAR(120),
    "startedAt" DATE,
    "endedAt" DATE,

    CONSTRAINT "FarmingSiteFarmer_pkey" PRIMARY KEY ("siteId","farmerId")
);

-- CreateTable
CREATE TABLE "public"."Crop" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT,
    "externalRecordId" VARCHAR(160),
    "commonName" VARCHAR(160) NOT NULL,
    "scientificName" VARCHAR(255),
    "variety" VARCHAR(160),
    "category" VARCHAR(120),
    "defaultUnit" VARCHAR(30) NOT NULL DEFAULT 'kg',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "attributes" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Crop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CultivationRecord" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "cropId" TEXT NOT NULL,
    "farmerId" TEXT,
    "sourceId" TEXT,
    "externalRecordId" VARCHAR(160),
    "plantingDate" DATE NOT NULL,
    "expectedHarvestDate" DATE,
    "completedAt" DATE,
    "status" "public"."CultivationStatus" NOT NULL DEFAULT 'PLANTED',
    "areaPlantedSqm" DECIMAL(14,2),
    "quantityPlanted" DECIMAL(14,3),
    "plantingUnit" VARCHAR(30),
    "expectedHarvestQuantity" DECIMAL(14,3),
    "harvestUnit" VARCHAR(30),
    "attributes" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CultivationRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."HarvestRecord" (
    "id" TEXT NOT NULL,
    "cultivationId" TEXT,
    "siteId" TEXT NOT NULL,
    "cropId" TEXT NOT NULL,
    "farmerId" TEXT,
    "sourceId" TEXT,
    "externalRecordId" VARCHAR(160),
    "harvestedAt" DATE NOT NULL,
    "quantity" DECIMAL(14,3) NOT NULL,
    "unit" VARCHAR(30) NOT NULL,
    "marketableQuantity" DECIMAL(14,3),
    "rejectedQuantity" DECIMAL(14,3),
    "attributes" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HarvestRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SeasonalCropCalendar" (
    "id" TEXT NOT NULL,
    "cropId" TEXT NOT NULL,
    "barangayId" TEXT,
    "siteId" TEXT,
    "sourceId" TEXT,
    "externalRecordId" VARCHAR(160),
    "seasonName" VARCHAR(120),
    "effectiveYear" INTEGER,
    "plantingStartMonth" INTEGER NOT NULL,
    "plantingEndMonth" INTEGER NOT NULL,
    "harvestStartMonth" INTEGER NOT NULL,
    "harvestEndMonth" INTEGER NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SeasonalCropCalendar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MarketPriceObservation" (
    "id" TEXT NOT NULL,
    "cropId" TEXT NOT NULL,
    "barangayId" TEXT,
    "sourceId" TEXT,
    "externalRecordId" VARCHAR(160),
    "observedAt" DATE NOT NULL,
    "marketName" VARCHAR(255),
    "priceType" VARCHAR(80),
    "price" DECIMAL(14,2) NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'PHP',
    "unit" VARCHAR(30) NOT NULL,
    "attributes" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarketPriceObservation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CropAvailabilityObservation" (
    "id" TEXT NOT NULL,
    "cropId" TEXT NOT NULL,
    "barangayId" TEXT,
    "siteId" TEXT,
    "sourceId" TEXT,
    "externalRecordId" VARCHAR(160),
    "periodStart" DATE NOT NULL,
    "periodEnd" DATE NOT NULL,
    "availableQuantity" DECIMAL(14,3) NOT NULL,
    "unit" VARCHAR(30) NOT NULL,
    "availabilityLevel" VARCHAR(80),
    "attributes" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CropAvailabilityObservation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SupplyReport" (
    "id" TEXT NOT NULL,
    "cropId" TEXT NOT NULL,
    "barangayId" TEXT,
    "sourceId" TEXT,
    "externalRecordId" VARCHAR(160),
    "periodStart" DATE NOT NULL,
    "periodEnd" DATE NOT NULL,
    "unit" VARCHAR(30) NOT NULL,
    "openingStock" DECIMAL(14,3),
    "producedQuantity" DECIMAL(14,3),
    "inboundQuantity" DECIMAL(14,3),
    "outboundQuantity" DECIMAL(14,3),
    "wasteQuantity" DECIMAL(14,3),
    "closingStock" DECIMAL(14,3),
    "attributes" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupplyReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AgriculturalSaleRecord" (
    "id" TEXT NOT NULL,
    "cropId" TEXT NOT NULL,
    "barangayId" TEXT,
    "siteId" TEXT,
    "farmerId" TEXT,
    "sourceId" TEXT,
    "externalRecordId" VARCHAR(160),
    "soldAt" DATE NOT NULL,
    "quantity" DECIMAL(14,3) NOT NULL,
    "unit" VARCHAR(30) NOT NULL,
    "unitPrice" DECIMAL(14,2),
    "totalAmount" DECIMAL(14,2) NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'PHP',
    "channel" VARCHAR(120),
    "attributes" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgriculturalSaleRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AgriculturalStatistic" (
    "id" TEXT NOT NULL,
    "cropId" TEXT,
    "barangayId" TEXT,
    "siteId" TEXT,
    "sourceId" TEXT,
    "externalRecordId" VARCHAR(160),
    "metricName" VARCHAR(160) NOT NULL,
    "periodStart" DATE NOT NULL,
    "periodEnd" DATE NOT NULL,
    "value" DECIMAL(18,4) NOT NULL,
    "unit" VARCHAR(60) NOT NULL,
    "dimensions" JSONB,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgriculturalStatistic_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AgriculturalDataSource_organization_idx" ON "public"."AgriculturalDataSource"("organization");

-- CreateIndex
CREATE INDEX "AgriculturalDataSource_importedAt_idx" ON "public"."AgriculturalDataSource"("importedAt");

-- CreateIndex
CREATE UNIQUE INDEX "UrbanFarmer_registrationNumber_key" ON "public"."UrbanFarmer"("registrationNumber");

-- CreateIndex
CREATE INDEX "UrbanFarmer_barangayId_idx" ON "public"."UrbanFarmer"("barangayId");

-- CreateIndex
CREATE INDEX "UrbanFarmer_sourceId_idx" ON "public"."UrbanFarmer"("sourceId");

-- CreateIndex
CREATE INDEX "UrbanFarmer_isActive_idx" ON "public"."UrbanFarmer"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "UrbanFarmer_sourceId_externalRecordId_key" ON "public"."UrbanFarmer"("sourceId", "externalRecordId");

-- CreateIndex
CREATE UNIQUE INDEX "FarmingAssociation_registrationNo_key" ON "public"."FarmingAssociation"("registrationNo");

-- CreateIndex
CREATE INDEX "FarmingAssociation_barangayId_idx" ON "public"."FarmingAssociation"("barangayId");

-- CreateIndex
CREATE INDEX "FarmingAssociation_sourceId_idx" ON "public"."FarmingAssociation"("sourceId");

-- CreateIndex
CREATE INDEX "FarmingAssociation_isActive_idx" ON "public"."FarmingAssociation"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "FarmingAssociation_sourceId_externalRecordId_key" ON "public"."FarmingAssociation"("sourceId", "externalRecordId");

-- CreateIndex
CREATE INDEX "FarmingAssociationMember_farmerId_idx" ON "public"."FarmingAssociationMember"("farmerId");

-- CreateIndex
CREATE INDEX "FarmingSite_barangayId_idx" ON "public"."FarmingSite"("barangayId");

-- CreateIndex
CREATE INDEX "FarmingSite_associationId_idx" ON "public"."FarmingSite"("associationId");

-- CreateIndex
CREATE INDEX "FarmingSite_sourceId_idx" ON "public"."FarmingSite"("sourceId");

-- CreateIndex
CREATE INDEX "FarmingSite_siteType_idx" ON "public"."FarmingSite"("siteType");

-- CreateIndex
CREATE INDEX "FarmingSite_isActive_idx" ON "public"."FarmingSite"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "FarmingSite_sourceId_externalRecordId_key" ON "public"."FarmingSite"("sourceId", "externalRecordId");

-- CreateIndex
CREATE INDEX "FarmingSiteFarmer_farmerId_idx" ON "public"."FarmingSiteFarmer"("farmerId");

-- CreateIndex
CREATE INDEX "Crop_sourceId_idx" ON "public"."Crop"("sourceId");

-- CreateIndex
CREATE INDEX "Crop_category_idx" ON "public"."Crop"("category");

-- CreateIndex
CREATE INDEX "Crop_isActive_idx" ON "public"."Crop"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Crop_commonName_variety_key" ON "public"."Crop"("commonName", "variety");

-- CreateIndex
CREATE UNIQUE INDEX "Crop_sourceId_externalRecordId_key" ON "public"."Crop"("sourceId", "externalRecordId");

-- CreateIndex
CREATE INDEX "CultivationRecord_siteId_plantingDate_idx" ON "public"."CultivationRecord"("siteId", "plantingDate");

-- CreateIndex
CREATE INDEX "CultivationRecord_cropId_plantingDate_idx" ON "public"."CultivationRecord"("cropId", "plantingDate");

-- CreateIndex
CREATE INDEX "CultivationRecord_farmerId_idx" ON "public"."CultivationRecord"("farmerId");

-- CreateIndex
CREATE INDEX "CultivationRecord_sourceId_idx" ON "public"."CultivationRecord"("sourceId");

-- CreateIndex
CREATE INDEX "CultivationRecord_status_idx" ON "public"."CultivationRecord"("status");

-- CreateIndex
CREATE UNIQUE INDEX "CultivationRecord_sourceId_externalRecordId_key" ON "public"."CultivationRecord"("sourceId", "externalRecordId");

-- CreateIndex
CREATE INDEX "HarvestRecord_cropId_harvestedAt_idx" ON "public"."HarvestRecord"("cropId", "harvestedAt");

-- CreateIndex
CREATE INDEX "HarvestRecord_siteId_harvestedAt_idx" ON "public"."HarvestRecord"("siteId", "harvestedAt");

-- CreateIndex
CREATE INDEX "HarvestRecord_farmerId_idx" ON "public"."HarvestRecord"("farmerId");

-- CreateIndex
CREATE INDEX "HarvestRecord_cultivationId_idx" ON "public"."HarvestRecord"("cultivationId");

-- CreateIndex
CREATE INDEX "HarvestRecord_sourceId_idx" ON "public"."HarvestRecord"("sourceId");

-- CreateIndex
CREATE UNIQUE INDEX "HarvestRecord_sourceId_externalRecordId_key" ON "public"."HarvestRecord"("sourceId", "externalRecordId");

-- CreateIndex
CREATE INDEX "SeasonalCropCalendar_cropId_effectiveYear_idx" ON "public"."SeasonalCropCalendar"("cropId", "effectiveYear");

-- CreateIndex
CREATE INDEX "SeasonalCropCalendar_barangayId_idx" ON "public"."SeasonalCropCalendar"("barangayId");

-- CreateIndex
CREATE INDEX "SeasonalCropCalendar_siteId_idx" ON "public"."SeasonalCropCalendar"("siteId");

-- CreateIndex
CREATE INDEX "SeasonalCropCalendar_sourceId_idx" ON "public"."SeasonalCropCalendar"("sourceId");

-- CreateIndex
CREATE UNIQUE INDEX "SeasonalCropCalendar_sourceId_externalRecordId_key" ON "public"."SeasonalCropCalendar"("sourceId", "externalRecordId");

-- CreateIndex
CREATE INDEX "MarketPriceObservation_cropId_observedAt_idx" ON "public"."MarketPriceObservation"("cropId", "observedAt");

-- CreateIndex
CREATE INDEX "MarketPriceObservation_barangayId_observedAt_idx" ON "public"."MarketPriceObservation"("barangayId", "observedAt");

-- CreateIndex
CREATE INDEX "MarketPriceObservation_sourceId_idx" ON "public"."MarketPriceObservation"("sourceId");

-- CreateIndex
CREATE UNIQUE INDEX "MarketPriceObservation_sourceId_externalRecordId_key" ON "public"."MarketPriceObservation"("sourceId", "externalRecordId");

-- CreateIndex
CREATE INDEX "CropAvailabilityObservation_cropId_periodStart_idx" ON "public"."CropAvailabilityObservation"("cropId", "periodStart");

-- CreateIndex
CREATE INDEX "CropAvailabilityObservation_barangayId_periodStart_idx" ON "public"."CropAvailabilityObservation"("barangayId", "periodStart");

-- CreateIndex
CREATE INDEX "CropAvailabilityObservation_siteId_idx" ON "public"."CropAvailabilityObservation"("siteId");

-- CreateIndex
CREATE INDEX "CropAvailabilityObservation_sourceId_idx" ON "public"."CropAvailabilityObservation"("sourceId");

-- CreateIndex
CREATE UNIQUE INDEX "CropAvailabilityObservation_sourceId_externalRecordId_key" ON "public"."CropAvailabilityObservation"("sourceId", "externalRecordId");

-- CreateIndex
CREATE INDEX "SupplyReport_cropId_periodStart_idx" ON "public"."SupplyReport"("cropId", "periodStart");

-- CreateIndex
CREATE INDEX "SupplyReport_barangayId_periodStart_idx" ON "public"."SupplyReport"("barangayId", "periodStart");

-- CreateIndex
CREATE INDEX "SupplyReport_sourceId_idx" ON "public"."SupplyReport"("sourceId");

-- CreateIndex
CREATE UNIQUE INDEX "SupplyReport_sourceId_externalRecordId_key" ON "public"."SupplyReport"("sourceId", "externalRecordId");

-- CreateIndex
CREATE INDEX "AgriculturalSaleRecord_cropId_soldAt_idx" ON "public"."AgriculturalSaleRecord"("cropId", "soldAt");

-- CreateIndex
CREATE INDEX "AgriculturalSaleRecord_barangayId_soldAt_idx" ON "public"."AgriculturalSaleRecord"("barangayId", "soldAt");

-- CreateIndex
CREATE INDEX "AgriculturalSaleRecord_siteId_idx" ON "public"."AgriculturalSaleRecord"("siteId");

-- CreateIndex
CREATE INDEX "AgriculturalSaleRecord_farmerId_idx" ON "public"."AgriculturalSaleRecord"("farmerId");

-- CreateIndex
CREATE INDEX "AgriculturalSaleRecord_sourceId_idx" ON "public"."AgriculturalSaleRecord"("sourceId");

-- CreateIndex
CREATE UNIQUE INDEX "AgriculturalSaleRecord_sourceId_externalRecordId_key" ON "public"."AgriculturalSaleRecord"("sourceId", "externalRecordId");

-- CreateIndex
CREATE INDEX "AgriculturalStatistic_metricName_periodStart_idx" ON "public"."AgriculturalStatistic"("metricName", "periodStart");

-- CreateIndex
CREATE INDEX "AgriculturalStatistic_cropId_periodStart_idx" ON "public"."AgriculturalStatistic"("cropId", "periodStart");

-- CreateIndex
CREATE INDEX "AgriculturalStatistic_barangayId_periodStart_idx" ON "public"."AgriculturalStatistic"("barangayId", "periodStart");

-- CreateIndex
CREATE INDEX "AgriculturalStatistic_siteId_idx" ON "public"."AgriculturalStatistic"("siteId");

-- CreateIndex
CREATE INDEX "AgriculturalStatistic_sourceId_idx" ON "public"."AgriculturalStatistic"("sourceId");

-- CreateIndex
CREATE UNIQUE INDEX "AgriculturalStatistic_sourceId_externalRecordId_key" ON "public"."AgriculturalStatistic"("sourceId", "externalRecordId");

-- AddForeignKey
ALTER TABLE "public"."UrbanFarmer" ADD CONSTRAINT "UrbanFarmer_barangayId_fkey" FOREIGN KEY ("barangayId") REFERENCES "public"."Barangay"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UrbanFarmer" ADD CONSTRAINT "UrbanFarmer_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "public"."AgriculturalDataSource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FarmingAssociation" ADD CONSTRAINT "FarmingAssociation_barangayId_fkey" FOREIGN KEY ("barangayId") REFERENCES "public"."Barangay"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FarmingAssociation" ADD CONSTRAINT "FarmingAssociation_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "public"."AgriculturalDataSource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FarmingAssociationMember" ADD CONSTRAINT "FarmingAssociationMember_associationId_fkey" FOREIGN KEY ("associationId") REFERENCES "public"."FarmingAssociation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FarmingAssociationMember" ADD CONSTRAINT "FarmingAssociationMember_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "public"."UrbanFarmer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FarmingSite" ADD CONSTRAINT "FarmingSite_barangayId_fkey" FOREIGN KEY ("barangayId") REFERENCES "public"."Barangay"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FarmingSite" ADD CONSTRAINT "FarmingSite_associationId_fkey" FOREIGN KEY ("associationId") REFERENCES "public"."FarmingAssociation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FarmingSite" ADD CONSTRAINT "FarmingSite_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "public"."AgriculturalDataSource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FarmingSiteFarmer" ADD CONSTRAINT "FarmingSiteFarmer_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "public"."FarmingSite"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FarmingSiteFarmer" ADD CONSTRAINT "FarmingSiteFarmer_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "public"."UrbanFarmer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Crop" ADD CONSTRAINT "Crop_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "public"."AgriculturalDataSource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CultivationRecord" ADD CONSTRAINT "CultivationRecord_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "public"."FarmingSite"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CultivationRecord" ADD CONSTRAINT "CultivationRecord_cropId_fkey" FOREIGN KEY ("cropId") REFERENCES "public"."Crop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CultivationRecord" ADD CONSTRAINT "CultivationRecord_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "public"."UrbanFarmer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CultivationRecord" ADD CONSTRAINT "CultivationRecord_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "public"."AgriculturalDataSource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."HarvestRecord" ADD CONSTRAINT "HarvestRecord_cultivationId_fkey" FOREIGN KEY ("cultivationId") REFERENCES "public"."CultivationRecord"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."HarvestRecord" ADD CONSTRAINT "HarvestRecord_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "public"."FarmingSite"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."HarvestRecord" ADD CONSTRAINT "HarvestRecord_cropId_fkey" FOREIGN KEY ("cropId") REFERENCES "public"."Crop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."HarvestRecord" ADD CONSTRAINT "HarvestRecord_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "public"."UrbanFarmer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."HarvestRecord" ADD CONSTRAINT "HarvestRecord_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "public"."AgriculturalDataSource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SeasonalCropCalendar" ADD CONSTRAINT "SeasonalCropCalendar_cropId_fkey" FOREIGN KEY ("cropId") REFERENCES "public"."Crop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SeasonalCropCalendar" ADD CONSTRAINT "SeasonalCropCalendar_barangayId_fkey" FOREIGN KEY ("barangayId") REFERENCES "public"."Barangay"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SeasonalCropCalendar" ADD CONSTRAINT "SeasonalCropCalendar_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "public"."FarmingSite"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SeasonalCropCalendar" ADD CONSTRAINT "SeasonalCropCalendar_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "public"."AgriculturalDataSource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MarketPriceObservation" ADD CONSTRAINT "MarketPriceObservation_cropId_fkey" FOREIGN KEY ("cropId") REFERENCES "public"."Crop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MarketPriceObservation" ADD CONSTRAINT "MarketPriceObservation_barangayId_fkey" FOREIGN KEY ("barangayId") REFERENCES "public"."Barangay"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MarketPriceObservation" ADD CONSTRAINT "MarketPriceObservation_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "public"."AgriculturalDataSource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CropAvailabilityObservation" ADD CONSTRAINT "CropAvailabilityObservation_cropId_fkey" FOREIGN KEY ("cropId") REFERENCES "public"."Crop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CropAvailabilityObservation" ADD CONSTRAINT "CropAvailabilityObservation_barangayId_fkey" FOREIGN KEY ("barangayId") REFERENCES "public"."Barangay"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CropAvailabilityObservation" ADD CONSTRAINT "CropAvailabilityObservation_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "public"."FarmingSite"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CropAvailabilityObservation" ADD CONSTRAINT "CropAvailabilityObservation_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "public"."AgriculturalDataSource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SupplyReport" ADD CONSTRAINT "SupplyReport_cropId_fkey" FOREIGN KEY ("cropId") REFERENCES "public"."Crop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SupplyReport" ADD CONSTRAINT "SupplyReport_barangayId_fkey" FOREIGN KEY ("barangayId") REFERENCES "public"."Barangay"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SupplyReport" ADD CONSTRAINT "SupplyReport_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "public"."AgriculturalDataSource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AgriculturalSaleRecord" ADD CONSTRAINT "AgriculturalSaleRecord_cropId_fkey" FOREIGN KEY ("cropId") REFERENCES "public"."Crop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AgriculturalSaleRecord" ADD CONSTRAINT "AgriculturalSaleRecord_barangayId_fkey" FOREIGN KEY ("barangayId") REFERENCES "public"."Barangay"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AgriculturalSaleRecord" ADD CONSTRAINT "AgriculturalSaleRecord_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "public"."FarmingSite"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AgriculturalSaleRecord" ADD CONSTRAINT "AgriculturalSaleRecord_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "public"."UrbanFarmer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AgriculturalSaleRecord" ADD CONSTRAINT "AgriculturalSaleRecord_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "public"."AgriculturalDataSource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AgriculturalStatistic" ADD CONSTRAINT "AgriculturalStatistic_cropId_fkey" FOREIGN KEY ("cropId") REFERENCES "public"."Crop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AgriculturalStatistic" ADD CONSTRAINT "AgriculturalStatistic_barangayId_fkey" FOREIGN KEY ("barangayId") REFERENCES "public"."Barangay"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AgriculturalStatistic" ADD CONSTRAINT "AgriculturalStatistic_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "public"."FarmingSite"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AgriculturalStatistic" ADD CONSTRAINT "AgriculturalStatistic_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "public"."AgriculturalDataSource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Data quality guardrails for imported and forecasting records.
ALTER TABLE "public"."FarmingAssociationMember" ADD CONSTRAINT "FarmingAssociationMember_dates_ordered" CHECK ("leftAt" IS NULL OR "joinedAt" IS NULL OR "leftAt" >= "joinedAt");
ALTER TABLE "public"."FarmingSiteFarmer" ADD CONSTRAINT "FarmingSiteFarmer_dates_ordered" CHECK ("endedAt" IS NULL OR "startedAt" IS NULL OR "endedAt" >= "startedAt");
ALTER TABLE "public"."FarmingSite" ADD CONSTRAINT "FarmingSite_area_nonnegative" CHECK ("areaSqm" IS NULL OR "areaSqm" >= 0);
ALTER TABLE "public"."FarmingSite" ADD CONSTRAINT "FarmingSite_latitude_range" CHECK ("latitude" IS NULL OR "latitude" BETWEEN -90 AND 90);
ALTER TABLE "public"."FarmingSite" ADD CONSTRAINT "FarmingSite_longitude_range" CHECK ("longitude" IS NULL OR "longitude" BETWEEN -180 AND 180);
ALTER TABLE "public"."CultivationRecord" ADD CONSTRAINT "CultivationRecord_dates_ordered" CHECK (("expectedHarvestDate" IS NULL OR "expectedHarvestDate" >= "plantingDate") AND ("completedAt" IS NULL OR "completedAt" >= "plantingDate"));
ALTER TABLE "public"."CultivationRecord" ADD CONSTRAINT "CultivationRecord_quantities_nonnegative" CHECK (("areaPlantedSqm" IS NULL OR "areaPlantedSqm" >= 0) AND ("quantityPlanted" IS NULL OR "quantityPlanted" >= 0) AND ("expectedHarvestQuantity" IS NULL OR "expectedHarvestQuantity" >= 0));
ALTER TABLE "public"."HarvestRecord" ADD CONSTRAINT "HarvestRecord_quantities_nonnegative" CHECK ("quantity" >= 0 AND ("marketableQuantity" IS NULL OR "marketableQuantity" >= 0) AND ("rejectedQuantity" IS NULL OR "rejectedQuantity" >= 0));
ALTER TABLE "public"."SeasonalCropCalendar" ADD CONSTRAINT "SeasonalCropCalendar_months_range" CHECK ("plantingStartMonth" BETWEEN 1 AND 12 AND "plantingEndMonth" BETWEEN 1 AND 12 AND "harvestStartMonth" BETWEEN 1 AND 12 AND "harvestEndMonth" BETWEEN 1 AND 12);
ALTER TABLE "public"."MarketPriceObservation" ADD CONSTRAINT "MarketPriceObservation_price_nonnegative" CHECK ("price" >= 0);
ALTER TABLE "public"."CropAvailabilityObservation" ADD CONSTRAINT "CropAvailabilityObservation_valid_period_quantity" CHECK ("periodEnd" >= "periodStart" AND "availableQuantity" >= 0);
ALTER TABLE "public"."SupplyReport" ADD CONSTRAINT "SupplyReport_valid_period_quantities" CHECK ("periodEnd" >= "periodStart" AND ("openingStock" IS NULL OR "openingStock" >= 0) AND ("producedQuantity" IS NULL OR "producedQuantity" >= 0) AND ("inboundQuantity" IS NULL OR "inboundQuantity" >= 0) AND ("outboundQuantity" IS NULL OR "outboundQuantity" >= 0) AND ("wasteQuantity" IS NULL OR "wasteQuantity" >= 0) AND ("closingStock" IS NULL OR "closingStock" >= 0));
ALTER TABLE "public"."AgriculturalSaleRecord" ADD CONSTRAINT "AgriculturalSaleRecord_amounts_nonnegative" CHECK ("quantity" >= 0 AND ("unitPrice" IS NULL OR "unitPrice" >= 0) AND "totalAmount" >= 0);
ALTER TABLE "public"."AgriculturalStatistic" ADD CONSTRAINT "AgriculturalStatistic_valid_period" CHECK ("periodEnd" >= "periodStart");
