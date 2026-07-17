import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy - AgriFarm",
  description: "AgriFarm Privacy Policy and Data Privacy Act of 2012 notice.",
};

const sections = [
  {
    title: "What information is collected",
    body: "AgriFarm may collect account details such as name, email address, mobile number, role, order history, addresses needed for fulfillment, marketplace activity, and support messages.",
  },
  {
    title: "Why it's collected",
    body: "Information is collected to create accounts, authenticate users, process orders, send order updates, support buyer and seller workflows, improve marketplace reliability, and meet legal or safety obligations.",
  },
  {
    title: "How it's protected",
    body: "AgriFarm uses access controls, password hashing, secure authentication practices, audit records, and operational safeguards to reduce unauthorized access or misuse.",
  },
  {
    title: "Who can access it",
    body: "Authorized AgriFarm administrators, relevant sellers for order fulfillment, service providers needed to operate the platform, and legally authorized parties may access only the information needed for their purpose.",
  },
  {
    title: "Compliance with the Data Privacy Act of 2012 (RA 10173)",
    body: "AgriFarm is designed to respect data subject rights under RA 10173, including transparency, legitimate purpose, proportionality, reasonable security, and appropriate handling of personal information.",
  },
  {
    title: "Contact information",
    body: "For privacy questions, account data requests, or concerns, contact the AgriFarm administrator through the official support channel listed in the application or project documentation.",
  },
];

export default function PrivacyPage() {
  return (
    <main className="legal-page">
      <nav className="legal-nav">
        <Link href="/">AgriFarm</Link>
        <span>
          <Link href="/terms">Terms of Service</Link>
          <Link href="/register">Register</Link>
        </span>
      </nav>
      <section className="legal-hero">
        <p>AgriFarm legal</p>
        <h1>Privacy Policy</h1>
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
