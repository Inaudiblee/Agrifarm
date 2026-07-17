-- DropIndex
DROP INDEX "public"."AgriculturalStatistic_sourceId_externalRecordId_key";

-- AlterTable
ALTER TABLE "public"."Order" ALTER COLUMN "status" SET DEFAULT 'PENDING_PAYMENT';

-- CreateTable
CREATE TABLE "public"."HistoricalReport" (
    "id" TEXT NOT NULL,
    "reportName" VARCHAR(255) NOT NULL,
    "reportType" TEXT NOT NULL,
    "uploadDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uploadedBy" VARCHAR(255) NOT NULL,
    "dataSource" VARCHAR(255) NOT NULL,
    "dateRange" VARCHAR(120) NOT NULL,
    "recordsCount" INTEGER NOT NULL,
    "productsIncluded" TEXT NOT NULL,
    "fileContent" TEXT NOT NULL,

    CONSTRAINT "HistoricalReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ForecastRun" (
    "id" TEXT NOT NULL,
    "forecastDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "datasetUsed" VARCHAR(255) NOT NULL,
    "productsForecasted" INTEGER NOT NULL,
    "sarimaModel" VARCHAR(120) NOT NULL,
    "mape" DECIMAL(5,2) NOT NULL,
    "duration" INTEGER NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "ForecastRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ForecastResult" (
    "id" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "product" VARCHAR(160) NOT NULL,
    "historicalDemand" JSONB NOT NULL,
    "forecastNextMonth" DECIMAL(14,2) NOT NULL,
    "forecastNext3Months" JSONB NOT NULL,
    "trend" TEXT NOT NULL,
    "confidence" DECIMAL(5,2) NOT NULL,
    "mape" DECIMAL(5,2) NOT NULL,
    "mae" DECIMAL(12,2) NOT NULL,
    "rmse" DECIMAL(12,2) NOT NULL,
    "status" TEXT NOT NULL,
    "modelUsed" VARCHAR(120) NOT NULL,
    "trainingDatasetSize" INTEGER NOT NULL,
    "testingDatasetSize" INTEGER NOT NULL,

    CONSTRAINT "ForecastResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ForecastRecommendation" (
    "id" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "product" VARCHAR(160) NOT NULL,
    "recommendation" TEXT NOT NULL,

    CONSTRAINT "ForecastRecommendation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ForecastSchedule" (
    "id" TEXT NOT NULL,
    "schedule" VARCHAR(20) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ForecastSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ForecastLog" (
    "id" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "stepName" VARCHAR(120) NOT NULL,
    "status" VARCHAR(20) NOT NULL,
    "output" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ForecastLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AgriculturalStatistic_sourceId_externalRecordId_idx" ON "public"."AgriculturalStatistic"("sourceId", "externalRecordId");

-- AddForeignKey
ALTER TABLE "public"."ForecastResult" ADD CONSTRAINT "ForecastResult_runId_fkey" FOREIGN KEY ("runId") REFERENCES "public"."ForecastRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ForecastRecommendation" ADD CONSTRAINT "ForecastRecommendation_runId_fkey" FOREIGN KEY ("runId") REFERENCES "public"."ForecastRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ForecastLog" ADD CONSTRAINT "ForecastLog_runId_fkey" FOREIGN KEY ("runId") REFERENCES "public"."ForecastRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;
