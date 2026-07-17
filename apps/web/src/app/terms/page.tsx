import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service - AgriFarm",
  description: "AgriFarm Terms of Service for buyers, sellers, and urban garden representatives.",
};

const sections = [
  {
    title: "Purpose of AgriFarm",
    body: "AgriFarm connects Pasig buyers with accredited urban gardens, helping residents discover fresh produce, place orders, and support local food systems.",
  },
  {
    title: "User Responsibilities",
    body: "Users must provide accurate account information, use the marketplace lawfully, respect other users, and avoid fraudulent, abusive, or misleading activity.",
  },
  {
    title: "Account Security",
    body: "Users are responsible for keeping passwords private and for notifying AgriFarm if they suspect unauthorized account access.",
  },
  {
    title: "Marketplace Rules",
    body: "Listings, profiles, orders, and messages must be accurate, respectful, and related to legitimate urban garden products or AgriFarm services.",
  },
  {
    title: "Orders & Payments",
    body: "Order availability, prices, payment status, and delivery or pickup details may depend on garden stock, seller confirmation, and payment provider processing.",
  },
  {
    title: "Cancellation Policy",
    body: "Orders may be cancelled before fulfillment begins. Once preparation or delivery is underway, cancellation options may be limited by seller and logistics status.",
  },
  {
    title: "Seller Verification",
    body: "Urban garden representatives and sellers may need to pass account, garden, and product verification before receiving seller access or publishing marketplace listings.",
  },
  {
    title: "Limitation of Liability",
    body: "AgriFarm aims to provide reliable marketplace tools, but it is not liable for indirect losses, unavailable stock, third-party service interruptions, or user-provided inaccuracies.",
  },
  {
    title: "Changes to Terms",
    body: "AgriFarm may update these terms as the platform, marketplace rules, or legal requirements change. Continued use means accepting the latest terms.",
  },
];

export default function TermsPage() {
  return (
    <main className="legal-page">
      <nav className="legal-nav">
        <Link href="/">AgriFarm</Link>
        <span>
          <Link href="/privacy">Privacy Policy</Link>
          <Link href="/register">Register</Link>
        </span>
      </nav>
      <section className="legal-hero">
        <p>AgriFarm legal</p>
        <h1>Terms of Service</h1>
        <span>Last updated: July 3, 2026</span>
      </section>
      <section className="legal-content">
        {sections.map((section) => (
          <article key={section.title}>
            <h2>{section.title}</h2>
            <p>{section.body}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
