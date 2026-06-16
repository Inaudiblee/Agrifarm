import "./globals.css";
import type { Metadata } from "next";
import { AppProviders } from "@/components/app-providers";

export const metadata: Metadata = {
  title: "AgriFarm",
  description: "Multi-seller ecommerce platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
