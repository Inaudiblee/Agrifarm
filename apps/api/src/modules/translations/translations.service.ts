import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { SUPPORTED_LOCALES, translationRegistry, type SupportedLocale } from "../../i18n/translation-registry";

@Injectable()
export class TranslationsService {
  constructor(private readonly prisma: PrismaService) {}

  async publicOverrides() {
    const rows = await this.prisma.translationOverride.findMany({
      select: { key: true, locale: true, value: true }
    });

    const locales = SUPPORTED_LOCALES.reduce(
      (acc, locale) => ({ ...acc, [locale]: {} }),
      {} as Record<SupportedLocale, Record<string, string>>
    );

    for (const row of rows) {
      if (row.locale === "en" || row.locale === "fil") {
        locales[row.locale][row.key] = row.value;
      }
    }

    return { locales };
  }

  async adminTranslations() {
    const overrides = await this.prisma.translationOverride.findMany({
      select: { key: true, locale: true, value: true, updatedAt: true }
    });
    const overrideMap = new Map(overrides.map((item) => [`${item.key}:${item.locale}`, item]));

    return translationRegistry.map((entry) => ({
      key: entry.key,
      label: entry.label,
      values: SUPPORTED_LOCALES.reduce(
        (acc, locale) => {
          const override = overrideMap.get(`${entry.key}:${locale}`);
          acc[locale] = {
            defaultValue: entry.defaultValue[locale],
            value: override?.value ?? entry.defaultValue[locale],
            isOverridden: Boolean(override),
            updatedAt: override?.updatedAt ?? null
          };
          return acc;
        },
        {} as Record<SupportedLocale, { defaultValue: string; value: string; isOverridden: boolean; updatedAt: Date | null }>
      )
    }));
  }
}
