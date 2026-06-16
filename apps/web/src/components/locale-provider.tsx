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
import { getCopy, getStoredLocale, storeLocale, type Copy, type Locale } from "@/lib/i18n";
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

  const setLocale = useCallback(
    (next: Locale, options?: { silent?: boolean }) => {
      storeLocale(next);
      setLocaleState(next);
      setHasChosenLanguage(true);

      if (!options?.silent) {
        const nextCopy = getCopy(next);
        showToast({
          type: "success",
          title: nextCopy.notify.title.success,
          message: next === "en" ? nextCopy.notify.success.langEn : nextCopy.notify.success.langFil,
        });
      }
    },
    [setHasChosenLanguage, setLocaleState, showToast]
  );

  const value = useMemo(
    () => ({
      locale,
      copy: getCopy(locale),
      setLocale,
      hasChosenLanguage,
    }),
    [locale, setLocale, hasChosenLanguage]
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
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = getStoredLocale();
    if (stored) {
      setLocaleState(stored);
      setHasChosenLanguage(true);
    }
    setReady(true);
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

  if (!ready) {
    return null;
  }

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
