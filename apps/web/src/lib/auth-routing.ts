import type { AuthUser } from "@/lib/auth-storage";

export function getRoleHomeHref(user: Pick<AuthUser, "role"> | null | undefined) {
  if (user?.role === "SELLER") return "/seller";
  if (user?.role === "ADMIN") return "/admin";
  if (user?.role === "BUYER") return "/buyer";
  return "/";
}

export function isSeller(user: Pick<AuthUser, "role"> | null | undefined) {
  return user?.role === "SELLER";
}

export function getRoleLabel(user: Pick<AuthUser, "role"> | null | undefined) {
  if (user?.role === "SELLER") return "Seller account";
  if (user?.role === "ADMIN") return "Administrator";
  if (user?.role === "BUYER") return "Buyer account";
  return "Account";
}
