import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up — AgriFarm",
  description: "Create a free AgriFarm buyer or seller account.",
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
