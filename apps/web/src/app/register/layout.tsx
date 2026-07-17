import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register - AgriFarm",
  description: "Create a free AgriFarm buyer account to discover and order fresh produce from accredited urban gardens in Pasig.",
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
