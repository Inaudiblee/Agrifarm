"use client";

import Link from "next/link";
import { LayoutDashboard, LogOut, Settings, UserRound } from "lucide-react";
import { useLocale } from "@/components/locale-provider";
import { clearAuthSession, type AuthUser } from "@/lib/auth-storage";

const labels = {
  en: {
    menu: "Account menu",
    dashboard: "Dashboard",
    settings: "Settings",
    logout: "Log out",
  },
  fil: {
    menu: "Menu ng account",
    dashboard: "Dashboard",
    settings: "Mga setting",
    logout: "Mag-logout",
  },
} as const;

export function AccountMenu({
  user,
  accountLabel,
  dashboardHref,
  settingsHref,
  dashboardLabel,
  showSettings = true,
  compact = false,
}: {
  user: AuthUser;
  accountLabel: string;
  dashboardHref: string;
  settingsHref: string;
  dashboardLabel?: string;
  showSettings?: boolean;
  compact?: boolean;
}) {
  const { locale } = useLocale();
  const t = labels[locale];

  function logout() {
    clearAuthSession();
    window.location.replace("/");
  }

  return (
    <details className={`account-menu${compact ? " is-compact" : ""}`}>
      <summary className="account-menu-summary" aria-label={`${user.fullName}, ${t.menu}`}>
        <span className="account-menu-avatar" aria-hidden="true">
          <UserRound size={20} />
        </span>
        <span className="account-menu-name">
          <strong>{user.fullName}</strong>
          <small>{accountLabel}</small>
        </span>
        <span className="account-menu-chevron" aria-hidden="true" />
      </summary>
      <div className="account-menu-popover">
        <div className="account-menu-identity">
          <strong>{user.fullName}</strong>
          <small>{user.email}</small>
        </div>
        <Link href={dashboardHref}>
          <LayoutDashboard size={18} />
          <span>{dashboardLabel ?? t.dashboard}</span>
        </Link>
        {showSettings ? (
          <Link href={settingsHref}>
            <Settings size={18} />
            <span>{t.settings}</span>
          </Link>
        ) : null}
        <button type="button" onClick={logout}>
          <LogOut size={18} />
          <span>{t.logout}</span>
        </button>
      </div>
    </details>
  );
}
