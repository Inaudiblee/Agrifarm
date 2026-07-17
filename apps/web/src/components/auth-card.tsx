"use client";

import Link from "next/link";
import { useState } from "react";
import { Leaf, Moon, SunMedium } from "lucide-react";
import { LanguageSwitch } from "./language-switch";
import { useLocale } from "./locale-provider";
import { useTheme } from "./theme-provider";
import { AGRIFARM_LOGO_SRC } from "@/lib/brand-assets";

type AuthCardProps = {
  active: "login" | "register";
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
  afterCard?: React.ReactNode;
};

const authAsset = (name: string) => `/assets/agrifarm/auth/${name}`;

export function AuthCard({ active, title, subtitle, children, footer, afterCard }: AuthCardProps) {
  const { copy } = useLocale();
  const t = copy.authUi;
  const nav = copy.landing.navLabels;
  const { theme, setTheme } = useTheme();
  const isNight = theme === "night";
  const mode = isNight ? "night" : "morning";
  const signTitle = active === "login" ? t.welcomeBack : t.startGrowing;
  const signBody = active === "login" ? t.loginSignBody : t.registerSignBody;

  return (
    <div className="auth-shell" data-auth-mode={mode} data-auth-view={active}>
      <header className="auth-scene-header">
        <Link href="/" className="auth-scene-brand" aria-label="AgriFarm home">
          <span className="auth-scene-brand-mark" aria-hidden="true">
            <img src={AGRIFARM_LOGO_SRC} alt="" aria-hidden="true" />
          </span>
          <span>
            <strong>AgriFarm</strong>
            <small>From our farms, for our future.</small>
          </span>
        </Link>
        <nav className="auth-scene-nav" aria-label="Primary navigation">
          <Link href="/marketplace">{nav.marketplace}</Link>
          <Link href="/farmers">{nav.farmers}</Link>
          <Link href="/recipes">{nav.recipes}</Link>
          <Link href="/forecast">{nav.forecast}</Link>
          <Link href="/pasig">{nav.explorePasig}</Link>
        </nav>
        <div className="auth-scene-actions">
          <LanguageSwitch compact />
          <button
            type="button"
            className="auth-mode-toggle"
            onClick={() => setTheme(isNight ? "day" : "night")}
            aria-label={isNight ? "Switch to morning mode" : "Switch to night mode"}
            aria-pressed={isNight}
          >
            {isNight ? <Moon size={18} /> : <SunMedium size={18} />}
          </button>
          <Link href="/login" className={`auth-top-link${active === "login" ? " is-active" : ""}`}>
            {copy.nav.login}
          </Link>
          <Link href="/register" className={`auth-top-link primary${active === "register" ? " is-active" : ""}`}>
            {copy.nav.register}
          </Link>
        </div>
      </header>

      <div className="auth-mobile-actions" aria-label="Authentication page actions">
        <Link href="/login" className={`auth-top-link${active === "login" ? " is-active" : ""}`}>
          {copy.nav.login}
        </Link>
        <Link href="/register" className={`auth-top-link primary${active === "register" ? " is-active" : ""}`}>
          {copy.nav.register}
        </Link>
        <LanguageSwitch compact />
        <button
          type="button"
          className="auth-mode-toggle"
          onClick={() => setTheme(isNight ? "day" : "night")}
          aria-label={isNight ? "Switch to morning mode" : "Switch to night mode"}
          aria-pressed={isNight}
        >
          {isNight ? <Moon size={18} /> : <SunMedium size={18} />}
        </button>
      </div>

      <main className="auth-layout">
        <aside className="auth-visual-panel" aria-label="AgriFarm urban garden highlights">
          <div className="auth-visual-shade" aria-hidden="true" />
          <img
            className="auth-hanging-planter"
            src={authAsset("auth-hanging-planter.svg")}
            alt=""
            aria-hidden="true"
          />
          <img
            className="auth-lanterns"
            src={authAsset("auth-lantern-string-lights.svg")}
            alt=""
            aria-hidden="true"
          />
          <img
            className="auth-produce-basket"
            src={authAsset("auth-produce-basket-corner.svg")}
            alt=""
            aria-hidden="true"
          />
          <div className="auth-scene-kicker" aria-hidden="true">
            <span>{isNight ? t.eveningAccess : t.morningAccess}</span>
            <strong>{isNight ? t.lanternGarden : t.sunriseGarden}</strong>
          </div>
          <div className="auth-scene-sign" aria-hidden="true">
            <strong>{signTitle}</strong>
            <span>{signBody}</span>
            <Leaf size={28} />
          </div>
          <div className="auth-scene-chips" aria-hidden="true">
            <span>{t.pasigCity}</span>
            <span>{active === "login" ? t.buyerFarmerPortal : t.newAccount}</span>
          </div>
        </aside>

        <section className="auth-form-panel" aria-labelledby={`${active}-title`}>
          <div className="auth-form-inner">
            <p className="auth-form-kicker">{active === "login" ? t.accountAccess : t.createAccount}</p>
            <section className="auth-card" aria-labelledby={`${active}-title`}>
              <div className="auth-card-header">
                <span className="auth-card-mark" aria-hidden="true">
                  <img src={AGRIFARM_LOGO_SRC} alt="" aria-hidden="true" />
                </span>
                <p className="auth-eyebrow">AgriFarm</p>
                <h1 id={`${active}-title`} className="auth-title">
                  {title}
                </h1>
                <p className="auth-subtitle">{subtitle}</p>
              </div>
              {children}
              <div className="auth-social">
                <div className="auth-divider">
                  <span />
                  <strong>{t.continueWith}</strong>
                  <span />
                </div>
                <div className="auth-social-grid">
                  <button type="button" className="auth-social-button" aria-label="Continue with Google">
                    <img src={authAsset("auth-social-google-button.svg")} alt="" aria-hidden="true" />
                    Google
                  </button>
                  <button type="button" className="auth-social-button" aria-label="Continue with Facebook">
                    <img src={authAsset("auth-social-facebook-button.svg")} alt="" aria-hidden="true" />
                    Facebook
                  </button>
                </div>
              </div>
              <p className="auth-footer-text">{footer}</p>
            </section>
            {afterCard}

            <div className="auth-benefit-strip">
              <div className="auth-benefit">
                <img src={authAsset("auth-benefit-support-farmers.svg")} alt="" aria-hidden="true" />
                <span>
                  <strong>{t.supportFarmers}</strong>
                  <small>{t.supportFarmersBody}</small>
                </span>
              </div>
              <div className="auth-benefit">
                <img src={authAsset("auth-benefit-sustainable.svg")} alt="" aria-hidden="true" />
                <span>
                  <strong>{t.sustainable}</strong>
                  <small>{t.sustainableBody}</small>
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
