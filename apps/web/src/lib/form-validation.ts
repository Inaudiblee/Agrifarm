import type { NotifyMessageKey } from "@/lib/toast";
import {
  AUTH_LIMITS,
  getLoginPasswordIssue,
  getRegisterPasswordIssue,
  isValidEmail,
  isValidPhone,
  normalizeEmail,
} from "@/lib/auth-rules";

export function validateLogin(email: string, password: string): NotifyMessageKey | null {
  const trimmedEmail = email.trim();

  if (!trimmedEmail) return "emailRequired";
  if (trimmedEmail.length > AUTH_LIMITS.emailMax) return "emailTooLong";
  if (!isValidEmail(trimmedEmail)) return "emailInvalid";

  const passwordIssue = getLoginPasswordIssue(password);
  if (passwordIssue) return passwordIssue;

  return null;
}

export function validateRegister(
  fullName: string,
  email: string,
  password: string,
  phone?: string
): NotifyMessageKey | null {
  const trimmedName = fullName.trim().replace(/\s+/g, " ");
  const trimmedEmail = email.trim();

  if (!trimmedName) return "fullNameRequired";
  if (trimmedName.length < AUTH_LIMITS.fullNameMin) return "fullNameShort";
  if (trimmedName.length > AUTH_LIMITS.fullNameMax) return "fullNameLong";
  if (!trimmedEmail) return "emailRequired";
  if (trimmedEmail.length > AUTH_LIMITS.emailMax) return "emailTooLong";
  if (!isValidEmail(trimmedEmail)) return "emailInvalid";

  const passwordIssue = getRegisterPasswordIssue(password);
  if (passwordIssue) return passwordIssue;

  if (phone && !isValidPhone(phone)) return "phoneInvalid";

  return null;
}

export { normalizeEmail, isValidEmail };
