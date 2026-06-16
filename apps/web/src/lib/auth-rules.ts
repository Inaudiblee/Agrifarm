/** Keep in sync with apps/api/src/modules/auth/auth.rules.ts */

export const AUTH_LIMITS = {
  emailMin: 3,
  emailMax: 255,
  passwordMin: 8,
  passwordMax: 128,
  fullNameMin: 2,
  fullNameMax: 255,
  phoneMax: 30,
} as const;

export const EMAIL_REGEX =
  /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/;

export const PASSWORD_STRONG_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)\S{8,128}$/;

const PHONE_REGEX = /^\+?[0-9][0-9\s-]{6,28}[0-9]$/;

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function isValidEmail(email: string) {
  const normalized = normalizeEmail(email);
  return (
    normalized.length >= AUTH_LIMITS.emailMin &&
    normalized.length <= AUTH_LIMITS.emailMax &&
    EMAIL_REGEX.test(normalized)
  );
}

export function isValidPhone(phone: string) {
  const cleaned = phone.trim();
  if (!cleaned) return true;
  return cleaned.length <= AUTH_LIMITS.phoneMax && PHONE_REGEX.test(cleaned);
}

export function getRegisterPasswordIssue(password: string) {
  if (!password) return "passwordRequired" as const;
  if (password.length < AUTH_LIMITS.passwordMin) return "passwordShort" as const;
  if (password.length > AUTH_LIMITS.passwordMax) return "passwordLong" as const;
  if (!PASSWORD_STRONG_REGEX.test(password)) return "passwordWeak" as const;
  return null;
}

export function getLoginPasswordIssue(password: string) {
  if (!password) return "passwordRequired" as const;
  if (password.length > AUTH_LIMITS.passwordMax) return "passwordLong" as const;
  return null;
}
