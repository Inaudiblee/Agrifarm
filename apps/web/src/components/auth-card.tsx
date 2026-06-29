"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Leaf, Moon, SunMedium } from "lucide-react";
import { LanguageSwitch } from "./language-switch";
import { useLocale } from "./locale-provider";

type AuthCardProps = {
  active: "login" | "register";
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
};

const authAsset = (name: string) => `/assets/agrifarm/auth/${name}`;

export function AuthCard({ active, title, subtitle, children, footer }: AuthCardProps) {
  const { copy } = useLocale();
  const t = copy.authUi;
  const [mode, setMode] = useState<"morning" | "night">("morning");
  const isNight = mode === "night";
  const signTitle = active === "login" ? t.welcomeBack : t.startGrowing;
  const signBody = active === "login" ? t.loginSignBody : t.registerSignBody;

  return (
    <div className="auth-shell" data-auth-mode={mode} data-auth-view={active}>
      <header className="auth-scene-header">
        <Link href="/" className="auth-scene-brand" aria-label="AgriFarm home">
          <span className="auth-scene-brand-mark" aria-hidden="true">
            <Leaf size={34} />
          </span>
          <span>
            <strong>AgriFarm</strong>
            <small>From our farms, for our future.</small>
          </span>
        </Link>
        <div className="auth-scene-actions">
          <LanguageSwitch compact />
          <button
            type="button"
            className="auth-mode-toggle"
            onClick={() => setMode(isNight ? "morning" : "night")}
            aria-label={isNight ? "Switch to morning mode" : "Switch to night mode"}
            aria-pressed={isNight}
          >
            {isNight ? <Moon size={18} /> : <SunMedium size={18} />}
          </button>
          <Link href="/" className="auth-back-link">
            <ArrowLeft size={17} />
            {t.backHome}
          </Link>
        </div>
      </header>

      <div className="auth-mobile-actions" aria-label="Authentication page actions">
        <LanguageSwitch compact />
        <button
          type="button"
          className="auth-mode-toggle"
          onClick={() => setMode(isNight ? "morning" : "night")}
          aria-label={isNight ? "Switch to morning mode" : "Switch to night mode"}
          aria-pressed={isNight}
        >
          {isNight ? <Moon size={18} /> : <SunMedium size={18} />}
        </button>
        <Link href="/" className="auth-back-link">
          <ArrowLeft size={17} />
          {t.backHome}
        </Link>
      </div>

      <main className="auth-layout">
        <aside className="auth-visual-panel" aria-label="AgriFarm rooftop garden story">
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
                  <Leaf size={28} />
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
