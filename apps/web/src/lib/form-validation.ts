import type { NotifyMessageKey } from "@/lib/toast";
import {
  AUTH_LIMITS,
  getLoginPasswordIssue,
  getRegisterPasswordIssue,
  isValidEmail,
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
  firstName: string,
  lastName: string,
  email: string,
  password: string,
  confirmPassword: string,
  acceptedTerms: boolean
): NotifyMessageKey | null {
  const trimmedFirstName = firstName.trim().replace(/\s+/g, " ");
  const trimmedLastName = lastName.trim().replace(/\s+/g, " ");
  const fullName = `${trimmedFirstName} ${trimmedLastName}`.trim();
  const trimmedEmail = email.trim();

  if (!trimmedFirstName) return "firstNameRequired";
  if (!trimmedLastName) return "lastNameRequired";
  if (fullName.length < AUTH_LIMITS.fullNameMin) return "fullNameShort";
  if (fullName.length > AUTH_LIMITS.fullNameMax) return "fullNameLong";
  if (!trimmedEmail) return "emailRequired";
  if (trimmedEmail.length > AUTH_LIMITS.emailMax) return "emailTooLong";
  if (!isValidEmail(trimmedEmail)) return "emailInvalid";
  if (!normalizeEmail(trimmedEmail).endsWith("@gmail.com")) return "emailGmailRequired";

  const passwordIssue = getRegisterPasswordIssue(password);
  if (passwordIssue) return passwordIssue;
  if (password !== confirmPassword) return "passwordMismatch";
  if (!acceptedTerms) return "termsRequired";

  return null;
}

export { normalizeEmail, isValidEmail };
