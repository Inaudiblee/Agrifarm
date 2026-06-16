import { getApiBase } from "@/lib/api";
import { normalizeEmail } from "@/lib/auth-rules";

export type CheckEmailResult = {
  available: boolean;
  email: string;
  valid: boolean;
};

export async function checkEmailAvailability(email: string): Promise<CheckEmailResult | null> {
  const normalized = normalizeEmail(email);
  if (!normalized) return null;

  try {
    const response = await fetch(
      `${getApiBase()}/api/auth/check-email?email=${encodeURIComponent(normalized)}`
    );
    if (!response.ok) return null;
    return (await response.json()) as CheckEmailResult;
  } catch {
    return null;
  }
}
