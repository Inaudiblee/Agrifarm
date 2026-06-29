"use client";

import Link from "next/link";
import { useLocale } from "./locale-provider";
import { LanguageSwitch } from "./language-switch";

export type ActivePage = "home" | "about" | "shop" | "howItWorks" | "contact" | "login" | "register";

export function SiteHeader({ active }: { active?: ActivePage }) {
  const { copy: t } = useLocale();

  const linkClass = (page: ActivePage) =>
    `auth-nav-link${active === page ? " is-active" : ""}`;

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
          <LanguageSwitch compact />
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
