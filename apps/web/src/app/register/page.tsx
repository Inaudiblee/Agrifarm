"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthCard } from "@/components/auth-card";
import { useLocale } from "@/components/locale-provider";
import { useToast } from "@/components/toast-provider";
import { checkEmailAvailability } from "@/lib/auth-api";
import { getApiBase, parseApiError } from "@/lib/api";
import { getAuthToken, getAuthUser, saveAuthSession, type AuthSession } from "@/lib/auth-storage";
import { getRoleHomeHref } from "@/lib/auth-routing";
import { isValidEmail, normalizeEmail } from "@/lib/auth-rules";
import { validateRegister } from "@/lib/form-validation";

const inputClass = "auth-input";

type Role = "BUYER" | "SELLER";

export default function RegisterPage() {
  const { copy: t } = useLocale();
  const { notify } = useToast();
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("BUYER");
  const [loading, setLoading] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const lastCheckedEmail = useRef("");

  const roleOptions = [
    { value: "BUYER" as const, label: t.register.buyer },
    { value: "SELLER" as const, label: t.register.seller },
  ];

  useEffect(() => {
    const token = getAuthToken();
    const user = getAuthUser();
    if (!token || !user) {
      notify("info", "register");
      return;
    }

    notify("info", "alreadyLoggedIn");
    router.replace(getRoleHomeHref(user));
  }, [notify, router]);

  async function handleEmailBlur() {
    const normalized = normalizeEmail(email);
    if (!normalized || !isValidEmail(normalized) || normalized === lastCheckedEmail.current) {
      return;
    }

    lastCheckedEmail.current = normalized;
    setCheckingEmail(true);

    const result = await checkEmailAvailability(normalized);
    setCheckingEmail(false);

    if (result?.valid === false) {
      notify("warning", "emailInvalid");
      return;
    }

    if (result && !result.available) {
      notify("warning", "emailTaken");
    }
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();

    const validationError = validateRegister(fullName, email, password, phone);
    if (validationError) {
      notify("warning", validationError);
      return;
    }

    const normalized = normalizeEmail(email);
    const availability = await checkEmailAvailability(normalized);
    if (availability?.valid && !availability.available) {
      notify("warning", "emailTaken");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${getApiBase()}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim().replace(/\s+/g, " "),
          email: normalized,
          password,
          role,
          ...(phone.trim() ? { phone: phone.trim() } : {}),
        }),
      });

      if (!response.ok) {
        await parseApiError(response);
        notify("error", "registerFailed");
        return;
      }

      const data = (await response.json()) as AuthSession;
      saveAuthSession(data);
      notify("success", "register");
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
      active="register"
      title={t.register.title}
      subtitle={t.register.subtitle}
      footer={
        <>
          {t.register.footer}{" "}
          <Link href="/login" className="auth-inline-link">
            {t.register.footerLink}
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <label className="auth-field">
          <span className="auth-label">{t.register.fullName}</span>
          <input
            type="text"
            autoComplete="name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className={inputClass}
            placeholder="Juan Dela Cruz"
          />
        </label>
        <label className="auth-field">
          <span className="auth-label">{t.register.email}</span>
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              lastCheckedEmail.current = "";
            }}
            onBlur={handleEmailBlur}
            className={inputClass}
            placeholder="you@example.com"
          />
          {checkingEmail && <p className="auth-help-text">Checking availability...</p>}
        </label>
        <label className="auth-field">
          <span className="auth-label">
            {t.register.phone} <span className="auth-optional">{t.register.optional}</span>
          </span>
          <input
            type="tel"
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={inputClass}
            placeholder="09XX XXX XXXX"
          />
        </label>
        <fieldset className="border-0 p-0 m-0">
          <legend className="auth-label mb-2">{t.register.roleLegend}</legend>
          <div className="grid grid-cols-2 gap-3">
            {roleOptions.map((option) => (
              <label
                key={option.value}
                className={`auth-role-option${role === option.value ? " is-selected" : ""}`}
              >
                <input
                  type="radio"
                  name="role"
                  value={option.value}
                  checked={role === option.value}
                  onChange={() => setRole(option.value)}
                  className="sr-only"
                />
                {option.label}
              </label>
            ))}
          </div>
        </fieldset>
        <label className="auth-field">
          <span className="auth-label">{t.register.password}</span>
          <input
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
            placeholder="Password"
          />
          <p className="auth-help-text">{t.register.passwordHint}</p>
        </label>
        <button type="submit" disabled={loading} className="auth-submit">
          {loading ? t.register.submitting : t.register.submit}
        </button>
      </form>
    </AuthCard>
  );
}
