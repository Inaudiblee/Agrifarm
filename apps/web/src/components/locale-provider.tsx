"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getApiBase } from "@/lib/api";
import { getCopy, getStoredLocale, storeLocale, type Copy, type Locale, type TranslationOverrideMap } from "@/lib/i18n";
import { HtmlLangSync } from "./html-lang-sync";
import { ToastProvider, useToast } from "./toast-provider";

type LocaleContextValue = {
  locale: Locale;
  copy: Copy;
  setLocale: (locale: Locale, options?: { silent?: boolean }) => void;
  hasChosenLanguage: boolean;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

function LocaleBridge({ children }: { children: ReactNode }) {
  const { locale, setLocaleState, hasChosenLanguage, setHasChosenLanguage } = useLocaleInternal();
  const { showToast } = useToast();
  const [overrides, setOverrides] = useState<TranslationOverrideMap>({});

  useEffect(() => {
    let cancelled = false;

    async function loadTranslations() {
      try {
        const response = await fetch(`${getApiBase()}/api/translations`);
        if (!response.ok) return;
        const data = (await response.json()) as { locales?: TranslationOverrideMap };
        if (!cancelled) {
          setOverrides(data.locales ?? {});
        }
      } catch {
        // Source translations remain the safe fallback when the API is unavailable.
      }
    }

    void loadTranslations();

    return () => {
      cancelled = true;
    };
  }, []);

  const setLocale = useCallback(
    (next: Locale, options?: { silent?: boolean }) => {
      storeLocale(next);
      setLocaleState(next);
      setHasChosenLanguage(true);

      if (!options?.silent) {
        const nextCopy = getCopy(next, overrides[next]);
        showToast({
          type: "success",
          title: nextCopy.notify.title.success,
          message: next === "en" ? nextCopy.notify.success.langEn : nextCopy.notify.success.langFil,
        });
      }
    },
    [overrides, setHasChosenLanguage, setLocaleState, showToast]
  );

  const value = useMemo(
    () => ({
      locale,
      copy: getCopy(locale, overrides[locale]),
      setLocale,
      hasChosenLanguage,
    }),
    [locale, overrides, setLocale, hasChosenLanguage]
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

type InternalState = {
  locale: Locale;
  setLocaleState: (l: Locale) => void;
  hasChosenLanguage: boolean;
  setHasChosenLanguage: (v: boolean) => void;
};

const LocaleInternalContext = createContext<InternalState | null>(null);

function useLocaleInternal(): InternalState {
  const ctx = useContext(LocaleInternalContext);
  if (!ctx) throw new Error("LocaleBridge must be inside LocaleProvider");
  return ctx;
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");
  const [hasChosenLanguage, setHasChosenLanguage] = useState(false);

  useEffect(() => {
    const stored = getStoredLocale();
    if (stored) {
      setLocaleState(stored);
      setHasChosenLanguage(true);
    }
  }, []);

  const internal = useMemo(
    () => ({
      locale,
      setLocaleState,
      hasChosenLanguage,
      setHasChosenLanguage,
    }),
    [locale, hasChosenLanguage]
  );

  return (
    <LocaleInternalContext.Provider value={internal}>
      <ToastProvider locale={locale}>
        <HtmlLangSync locale={locale} />
        <LocaleBridge>{children}</LocaleBridge>
      </ToastProvider>
    </LocaleInternalContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error("useLocale must be used within LocaleProvider");
  }
  return ctx;
}
