import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Agrifarm | Sariwang Ani, Madaling Bilhin",
  description: "Simpleng marketplace para sa bumibili at nagbebenta ng sariwang ani.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tl">
      <body>{children}</body>
    </html>
  );
}
