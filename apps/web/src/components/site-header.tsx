"use client";

import Link from "next/link";
import { useLocale } from "./locale-provider";

export type ActivePage = "home" | "about" | "shop" | "howItWorks" | "contact" | "login" | "register";

export function SiteHeader({ active }: { active?: ActivePage }) {
  const { locale, copy: t, setLocale } = useLocale();

  function toggleLanguage() {
    setLocale(locale === "en" ? "fil" : "en");
  }

  const linkClass = (page: ActivePage) =>
    `auth-nav-link${active === page ? " is-active" : ""}`;
  const languageLabel = locale === "en" ? "Tagalog" : "English";
  const languageCode = locale === "en" ? "TL" : "EN";

  return (
    <header className="auth-header">
      <div className="auth-header-inner">
        <Link href="/" className="brand-plaque auth-brand" aria-label="AgriFarm home">
          <span className="brand-mark" aria-hidden="true">
            <span />
          </span>
          <span className="brand-text-wrap">
            <span className="brand-eyebrow">Barangay Grown</span>
            <strong className="brand-wordmark">AgriFarm</strong>
          </span>
        </Link>
        <nav className="auth-nav" aria-label="Account navigation">
          <button
            type="button"
            onClick={toggleLanguage}
            className="nav-locale-btn"
            aria-label={
              locale === "en"
                ? "Switch to Tagalog, palitan ang wika sa Tagalog"
                : "Switch to English, palitan ang wika sa Ingles"
            }
            title={locale === "en" ? t.notify.success.langFil : t.notify.success.langEn}
          >
            <span className="nav-locale-code">{languageCode}</span>
            <span>{languageLabel}</span>
          </button>
          <Link href="/login" className={linkClass("login")}>
            {t.nav.login}
          </Link>
          <Link href="/register" className={linkClass("register")}>
            {t.nav.register}
          </Link>
        </nav>
      </div>
    </header>
  );
}
