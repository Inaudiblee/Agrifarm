"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { AuthCard } from "@/components/auth-card";
import { useLocale } from "@/components/locale-provider";
import { useToast } from "@/components/toast-provider";
import { checkEmailAvailability } from "@/lib/auth-api";
import { getApiBase, parseApiError } from "@/lib/api";
import { getAuthToken, getAuthUser, saveAuthSession, type AuthSession } from "@/lib/auth-storage";
import { getRoleHomeHref } from "@/lib/auth-routing";
import { AUTH_LIMITS, isValidEmail, normalizeEmail } from "@/lib/auth-rules";
import { validateRegister } from "@/lib/form-validation";

const inputClass = "auth-input";
type FocusedRegisterField = "password" | "confirmPassword" | "terms" | null;

function isAllowedGmailAddress(value: string) {
  return isValidEmail(value) && normalizeEmail(value).endsWith("@gmail.com");
}

export default function RegisterPage() {
  const { copy: t } = useLocale();
  const { notify, showToast } = useToast();
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [focusedField, setFocusedField] = useState<FocusedRegisterField>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const lastCheckedEmail = useRef("");

  const passwordRules = [
    {
      label: t.register.passwordRules.length,
      valid: password.length >= AUTH_LIMITS.passwordMin && password.length <= AUTH_LIMITS.passwordMax,
    },
    { label: t.register.passwordRules.uppercase, valid: /[A-Z]/.test(password) },
    { label: t.register.passwordRules.lowercase, valid: /[a-z]/.test(password) },
    { label: t.register.passwordRules.number, valid: /\d/.test(password) },
    { label: t.register.passwordRules.noSpaces, valid: password.length > 0 && !/\s/.test(password) },
  ];
  const hasEmailValue = email.trim().length > 0;
  const emailIsValid = !hasEmailValue || isAllowedGmailAddress(email);

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
    if (!normalized || !isAllowedGmailAddress(normalized) || normalized === lastCheckedEmail.current) {
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

  function handleFieldBlur(field: FocusedRegisterField) {
    return () => {
      window.setTimeout(() => {
        setFocusedField((current) => (current === field ? null : current));
      }, 120);
    };
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();

    const validationError = validateRegister(firstName, lastName, email, password, confirmPassword, acceptedTerms);
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
          fullName: `${firstName} ${lastName}`.trim().replace(/\s+/g, " "),
          email: normalized,
          password,
          role: "BUYER",
        }),
      });

      if (!response.ok) {
        const message = await parseApiError(response);
        showToast({ type: "error", message });
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
          <span>
            {t.register.footer}{" "}
            <Link href="/login" className="auth-inline-link">
              {t.register.footerLink}
            </Link>
          </span>
        </>
      }
    >
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <div className="auth-name-grid">
          <label className="auth-field">
            <span className="auth-label">{t.register.firstName}</span>
            <input
              type="text"
              autoComplete="given-name"
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              className={inputClass}
              placeholder="Juan"
            />
          </label>
          <label className="auth-field">
            <span className="auth-label">{t.register.lastName}</span>
            <input
              type="text"
              autoComplete="family-name"
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
              className={inputClass}
              placeholder="Dela Cruz"
            />
          </label>
        </div>

        <label className="auth-field">
          <span className="auth-label">{t.register.email}</span>
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              lastCheckedEmail.current = "";
            }}
            onBlur={() => void handleEmailBlur()}
            className={`${inputClass}${!emailIsValid ? " is-invalid" : ""}`}
            aria-invalid={!emailIsValid}
            placeholder="agrifarm@gmail.com"
          />
          {!emailIsValid && <p className="auth-help-text is-error">{t.register.gmailInvalidInline}</p>}
          {checkingEmail && <p className="auth-help-text">{t.register.checkingEmail}</p>}
        </label>


        <label className="auth-field">
          <span className="auth-label">{t.register.password}</span>
          <div className="auth-password-field">
            <input
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={password}
              onFocus={() => setFocusedField("password")}
              onBlur={handleFieldBlur("password")}
              onChange={(event) => setPassword(event.target.value)}
              className={inputClass}
              placeholder="Password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? t.register.hidePassword : t.register.showPassword}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {focusedField === "password" && (
            <ul className="auth-password-rules" aria-live="polite">
              {passwordRules.map((rule) => (
                <li key={rule.label} className={rule.valid ? "is-valid" : "is-invalid"}>
                  <span aria-hidden="true">{rule.valid ? "✓" : "✗"}</span>
                  {rule.label}
                </li>
              ))}
            </ul>
          )}
        </label>

        <label className="auth-field">
          <span className="auth-label">{t.register.confirmPassword}</span>
          <div className="auth-password-field">
            <input
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              value={confirmPassword}
              onFocus={() => setFocusedField("confirmPassword")}
              onBlur={handleFieldBlur("confirmPassword")}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className={inputClass}
              placeholder="Confirm password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((value) => !value)}
              aria-label={showConfirmPassword ? t.register.hidePassword : t.register.showPassword}
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {focusedField === "confirmPassword" && <p className="auth-help-text">{t.register.tips.confirmPassword}</p>}
        </label>

        <label className="auth-terms">
          <input
            type="checkbox"
            checked={acceptedTerms}
            onFocus={() => setFocusedField("terms")}
            onBlur={handleFieldBlur("terms")}
            onChange={(event) => setAcceptedTerms(event.target.checked)}
          />
          <span>
            {t.register.acceptTermsPrefix}{" "}
            <Link href="/terms" className="auth-inline-link">
              {t.register.termsLink}
            </Link>{" "}
            {t.register.acceptTermsMiddle}{" "}
            <Link href="/privacy" className="auth-inline-link">
              {t.register.privacyLink}
            </Link>
          </span>
        </label>
        {focusedField === "terms" && <p className="auth-help-text">{t.register.tips.terms}</p>}

        <button type="submit" disabled={loading} className="auth-submit">
          {loading ? t.register.submitting : t.register.submit}
        </button>
      </form>
    </AuthCard>
  );
}
