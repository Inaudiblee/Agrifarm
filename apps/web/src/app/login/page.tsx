"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthCard } from "@/components/auth-card";
import { useLocale } from "@/components/locale-provider";
import { useToast } from "@/components/toast-provider";
import { getApiBase, parseApiError } from "@/lib/api";
import { getAuthToken, getAuthUser, saveAuthSession, type AuthSession } from "@/lib/auth-storage";
import { getRoleHomeHref } from "@/lib/auth-routing";
import { validateLogin } from "@/lib/form-validation";

const inputClass =
  "auth-input";

export default function LoginPage() {
  const { copy: t } = useLocale();
  const { notify } = useToast();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = getAuthToken();
    const user = getAuthUser();
    if (!token || !user) {
      notify("info", "demoHint");
      return;
    }

    notify("info", "alreadyLoggedIn");
    router.replace(getRoleHomeHref(user));
  }, [notify, router]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();

    const validationError = validateLogin(email, password);
    if (validationError) {
      notify("warning", validationError);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${getApiBase()}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      if (!response.ok) {
        await parseApiError(response);
        notify("error", "loginFailed");
        return;
      }

      const data = (await response.json()) as AuthSession;
      saveAuthSession(data);
      notify("success", "login");
      router.push(getRoleHomeHref(data.user));
      router.refresh();
    } catch {
      notify("error", "network");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      active="login"
      title={t.login.title}
      subtitle={t.login.subtitle}
      footer={
        <>
          {t.login.footer}{" "}
          <Link href="/register" className="auth-inline-link">
            {t.login.footerLink}
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <label className="auth-field">
          <span className="auth-label">{t.login.email}</span>
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            placeholder="you@example.com"
          />
        </label>
        <label className="auth-field">
          <span className="auth-label">{t.login.password}</span>
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
            placeholder="Password"
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="auth-submit"
        >
          {loading ? t.login.submitting : t.login.submit}
        </button>
      </form>
      <p className="auth-demo-note">
        {t.login.demo} <code>buyer@agrifarm.local</code> / <code>password123</code>
      </p>
    </AuthCard>
  );
}
