import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Log In — AgriFarm",
  description: "Log in to your AgriFarm account.",
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
