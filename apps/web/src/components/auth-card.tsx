"use client";

import Link from "next/link";
import { SiteHeader } from "./site-header";
import { useLocale } from "./locale-provider";

type AuthCardProps = {
  active: "login" | "register";
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
};

export function AuthCard({ active, title, subtitle, children, footer }: AuthCardProps) {
  const { copy: t } = useLocale();

  return (
    <div className="auth-shell">
      <SiteHeader active={active} />
      <main className="auth-main">
        <section className="auth-card" aria-labelledby={`${active}-title`}>
          <div className="auth-card-cap" aria-hidden="true" />
          <div className="auth-card-header">
            <span className="auth-card-mark" aria-hidden="true" />
            <p className="auth-eyebrow">AgriFarm Account</p>
            <h1 id={`${active}-title`} className="auth-title">
              {title}
            </h1>
            <p className="auth-subtitle">{subtitle}</p>
          </div>
          {children}
          <p className="auth-footer-text">{footer}</p>
        </section>
      </main>
      <footer className="auth-page-footer">
        <Link href="/" className="footer-link">
          {t.home.backHome}
        </Link>
      </footer>
    </div>
  );
}
