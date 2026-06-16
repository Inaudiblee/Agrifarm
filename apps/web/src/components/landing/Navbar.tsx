"use client";

import Link from "next/link";
import { useState } from "react";
import { navItems } from "@/data/landing";
import { useLocale } from "@/components/locale-provider";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { locale, copy: t, setLocale } = useLocale();

  function toggleLanguage() {
    setLocale(locale === "en" ? "fil" : "en");
  }

  const languageLabel = locale === "en" ? "Tagalog" : "English";
  const languageCode = locale === "en" ? "TL" : "EN";
  const languageTitle = locale === "en" ? t.notify.success.langFil : t.notify.success.langEn;

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="carved-nav">
        <div className="nav-etched-rail nav-etched-rail-top" aria-hidden="true" />
        <div className="nav-inner-bevel" aria-hidden="true">
          <span />
          <span />
        </div>

        <div className="nav-content">
          <Link
            href="#home"
            className="brand-plaque"
            aria-label="AgriFarm home"
          >
            <span className="brand-mark" aria-hidden="true">
              <span />
            </span>
            <span className="brand-text-wrap">
              <span className="brand-eyebrow">Barangay Grown</span>
              <strong className="brand-wordmark">AgriFarm</strong>
            </span>
          </Link>

          <nav
            className="nav-links hidden lg:flex"
            aria-label="Main navigation"
          >
            {navItems.map((item, i) => (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-carve-link${i === 0 ? " is-active" : ""}`}
                aria-current={i === 0 ? "page" : undefined}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex-1 lg:hidden" />

          <div className="hidden items-center gap-3 pl-4 lg:flex">
            <button
              type="button"
              className="nav-locale-btn"
              onClick={toggleLanguage}
              aria-label={
                locale === "en"
                  ? "Switch to Tagalog, palitan ang wika sa Tagalog"
                  : "Switch to English, palitan ang wika sa Ingles"
              }
              title={languageTitle}
            >
              <span className="nav-locale-code">{languageCode}</span>
              <span>{languageLabel}</span>
            </button>
            <Link href="/login" className="nav-login-btn">
              <span aria-hidden="true" />
              Login
            </Link>
          </div>

          <button
            type="button"
            className="hamburger-carved my-auto ml-3 lg:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen(v => !v)}
          >
            <i /><i /><i />
          </button>
        </div>
        <div className="nav-etched-rail nav-etched-rail-bottom" aria-hidden="true" />
      </div>

      <nav
        className={`mobile-menu-carved lg:hidden ${open ? "is-open" : ""}`}
        aria-label="Mobile navigation"
      >
        {navItems.map(item => (
          <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>
            {item.label}
          </Link>
        ))}
        <button
          type="button"
          className="mobile-locale-carved"
          onClick={() => {
            toggleLanguage();
            setOpen(false);
          }}
          aria-label={
            locale === "en"
              ? "Switch to Tagalog, palitan ang wika sa Tagalog"
              : "Switch to English, palitan ang wika sa Ingles"
          }
        >
          <span>{languageCode}</span>
          {languageLabel}
        </button>
        <Link href="/login" onClick={() => setOpen(false)}>Login</Link>
      </nav>
    </header>
  );
}
