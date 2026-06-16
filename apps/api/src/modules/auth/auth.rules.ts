export const AUTH_LIMITS = {
  emailMin: 3,
  emailMax: 255,
  passwordMin: 8,
  passwordMax: 128,
  fullNameMin: 2,
  fullNameMax: 255,
  phoneMax: 30
} as const;

/** Practical RFC 5322–style pattern; stored lowercase in PostgreSQL (VarChar 255). */
export const EMAIL_REGEX =
  /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/;

/** At least 8 chars, one upper, one lower, one digit; no spaces; max 128. */
export const PASSWORD_STRONG_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)\S{8,128}$/;

const PHONE_REGEX = /^\+?[0-9][0-9\s-]{6,28}[0-9]$/;

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isValidEmail(email: string): boolean {
  const normalized = normalizeEmail(email);
  return (
    normalized.length >= AUTH_LIMITS.emailMin &&
    normalized.length <= AUTH_LIMITS.emailMax &&
    EMAIL_REGEX.test(normalized)
  );
}

export type PasswordIssue = "required" | "short" | "long" | "weak";

export function getPasswordIssue(password: string, requireStrong = false): PasswordIssue | null {
  if (!password) return "required";
  if (password.length < AUTH_LIMITS.passwordMin) return "short";
  if (password.length > AUTH_LIMITS.passwordMax) return "long";
  if (requireStrong && !PASSWORD_STRONG_REGEX.test(password)) return "weak";
  return null;
}

export function assertRegisterPassword(password: string): void {
  const issue = getPasswordIssue(password, true);
  if (issue === "required") {
    throw new Error("PASSWORD_REQUIRED");
  }
  if (issue === "short") {
    throw new Error("PASSWORD_SHORT");
  }
  if (issue === "long") {
    throw new Error("PASSWORD_LONG");
  }
  if (issue === "weak") {
    throw new Error("PASSWORD_WEAK");
  }
}

export function normalizePhone(phone?: string): string | undefined {
  if (!phone?.trim()) return undefined;
  const cleaned = phone.trim();
  if (cleaned.length > AUTH_LIMITS.phoneMax) {
    throw new Error("PHONE_LONG");
  }
  if (!PHONE_REGEX.test(cleaned)) {
    throw new Error("PHONE_INVALID");
  }
  return cleaned;
}

export function normalizeFullName(fullName: string): string {
  return fullName.trim().replace(/\s+/g, " ");
}

export function isValidFullName(fullName: string): boolean {
  const normalized = normalizeFullName(fullName);
  return (
    normalized.length >= AUTH_LIMITS.fullNameMin &&
    normalized.length <= AUTH_LIMITS.fullNameMax
  );
}

export const PASSWORD_ISSUE_MESSAGES: Record<PasswordIssue, string> = {
  required: "Password is required.",
  short: `Password must be at least ${AUTH_LIMITS.passwordMin} characters.`,
  long: `Password must be at most ${AUTH_LIMITS.passwordMax} characters.`,
  weak: "Password must include uppercase, lowercase, and a number (no spaces)."
};

export const AUTH_ERROR_MESSAGES: Record<string, string> = {
  EMAIL_REQUIRED: "Email is required.",
  EMAIL_INVALID: "Please enter a valid email address.",
  EMAIL_TAKEN: "Email is already registered.",
  PASSWORD_REQUIRED: PASSWORD_ISSUE_MESSAGES.required,
  PASSWORD_SHORT: PASSWORD_ISSUE_MESSAGES.short,
  PASSWORD_LONG: PASSWORD_ISSUE_MESSAGES.long,
  PASSWORD_WEAK: PASSWORD_ISSUE_MESSAGES.weak,
  FULL_NAME_REQUIRED: "Full name is required.",
  FULL_NAME_INVALID: "Full name must be between 2 and 255 characters.",
  PHONE_INVALID: "Please enter a valid phone number.",
  PHONE_LONG: `Phone must be at most ${AUTH_LIMITS.phoneMax} characters.`
};
