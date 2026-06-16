import type { AuthUser } from "@/lib/auth-storage";

export function getRoleHomeHref(user: Pick<AuthUser, "role"> | null | undefined) {
  return user?.role === "SELLER" ? "/seller" : "/";
}

export function isSeller(user: Pick<AuthUser, "role"> | null | undefined) {
  return user?.role === "SELLER";
}
