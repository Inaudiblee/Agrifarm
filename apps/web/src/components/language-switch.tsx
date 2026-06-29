"use client";

import { useLocale } from "./locale-provider";

export function LanguageSwitch({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale, copy: t } = useLocale();

  return (
    <div className={`language-switch${compact ? " is-compact" : ""}`} aria-label={t.nav.language}>
      <button type="button" aria-pressed={locale === "en"} onClick={() => setLocale("en")}>
        ENG
      </button>
      <button type="button" aria-pressed={locale === "fil"} onClick={() => setLocale("fil")}>
        PH
      </button>
    </div>
  );
}
