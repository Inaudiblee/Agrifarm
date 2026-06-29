CREATE TABLE "TranslationOverride" (
  "id" TEXT NOT NULL,
  "key" VARCHAR(180) NOT NULL,
  "locale" VARCHAR(10) NOT NULL,
  "value" TEXT NOT NULL,
  "updatedById" VARCHAR(255),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "TranslationOverride_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "TranslationOverride_key_locale_key" ON "TranslationOverride"("key", "locale");
CREATE INDEX "TranslationOverride_locale_idx" ON "TranslationOverride"("locale");
CREATE INDEX "TranslationOverride_updatedAt_idx" ON "TranslationOverride"("updatedAt");
