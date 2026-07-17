"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, XCircle } from "lucide-react";
import { useTheme } from "@/components/theme-provider";

export default function CheckoutFailedPage() {
  const [reference, setReference] = useState("Pending");
  const { theme } = useTheme();
  useEffect(() => setReference(new URLSearchParams(window.location.search).get("ref") ?? "Pending"), []);
  return (
    <main className="checkout-result-page is-failed" data-checkout-theme={theme}>
      <section className="checkout-result-card">
        <span className="checkout-result-icon"><XCircle size={34} /></span>
        <small>Payment not completed</small>
        <h1>Your produce was not reserved</h1>
        <p>No deposit was recorded. Return to checkout when you are ready to try the GCash payment again.</p>
        <code>Reference: {reference}</code>
        <Link href="/buyer/checkout"><ArrowLeft size={18} /> Return to checkout</Link>
      </section>
    </main>
  );
}
