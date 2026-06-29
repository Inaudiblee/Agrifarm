"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Languages, Leaf, ShieldCheck, UserRound } from "lucide-react";
import { AccountMenu } from "@/components/account-menu";
import { useLocale } from "@/components/locale-provider";
import { getAuthToken, getAuthUser, type AuthUser } from "@/lib/auth-storage";
import { getRoleHomeHref, isSeller } from "@/lib/auth-routing";

export default function SettingsPage() {
  const router = useRouter();
  const { locale, setLocale, copy } = useLocale();
  const [user, setUser] = useState<AuthUser | null>(null);
  const t = copy.settingsPage;

  useEffect(() => {
    const storedUser = getAuthUser();
    if (!getAuthToken() || !storedUser) {
      router.replace("/login");
      return;
    }
    setUser(storedUser);
  }, [router]);

  if (!user) {
    return <main className="settings-loading">{t.loading}</main>;
  }

  const dashboardHref = getRoleHomeHref(user);
  const accountLabel = isSeller(user) ? t.seller : t.buyer;

  return (
    <div className="settings-shell">
      <header className="settings-header">
        <Link href="/" className="settings-brand">
          <span><Leaf size={22} /></span>
          <strong>AGRI<span>FARM</span></strong>
        </Link>
        <AccountMenu user={user} accountLabel={accountLabel} dashboardHref={dashboardHref} settingsHref="/settings" />
      </header>

      <main className="settings-main">
        <Link href={dashboardHref} className="settings-back"><ArrowLeft size={18} />{t.back}</Link>
        <div className="settings-heading">
          <span><UserRound size={20} /></span>
          <div><h1>{t.title}</h1><p>{t.intro}</p></div>
        </div>

        <section className="settings-grid">
          <article className="settings-card">
            <h2><UserRound size={20} />{t.account}</h2>
            <dl>
              <div><dt>{t.name}</dt><dd>{user.fullName}</dd></div>
              <div><dt>{t.email}</dt><dd>{user.email}</dd></div>
              <div><dt>{t.role}</dt><dd>{accountLabel}</dd></div>
            </dl>
          </article>

          <article className="settings-card">
            <h2><Languages size={20} />{t.language}</h2>
            <p>{t.languageHelp}</p>
            <div className="settings-language" role="group" aria-label={t.language}>
              <button type="button" aria-pressed={locale === "en"} onClick={() => setLocale("en")}>{t.english}</button>
              <button type="button" aria-pressed={locale === "fil"} onClick={() => setLocale("fil")}>{t.tagalog}</button>
            </div>
          </article>

          <article className="settings-card settings-safety">
            <span><ShieldCheck size={26} /></span>
            <div><h2>{t.safety}</h2><p>{t.safetyHelp}</p></div>
          </article>
        </section>
      </main>
    </div>
  );
}
