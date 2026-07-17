"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CheckCircle2, ClipboardList } from "lucide-react";
import { useTheme } from "@/components/theme-provider";

export default function CheckoutSuccessPage() {
  const [reference, setReference] = useState("Pending");
  const { theme } = useTheme();
  useEffect(() => setReference(new URLSearchParams(window.location.search).get("ref") ?? "Pending"), []);
  return (
    <main className="checkout-result-page" data-checkout-theme={theme}>
      <section className="checkout-result-card">
        <span className="checkout-result-icon"><CheckCircle2 size={34} /></span>
        <small>Payment received</small>
        <h1>Your reservation is being confirmed</h1>
        <p>PayMongo is confirming your GCash deposit. Your pickup details and payment status will appear in My Orders.</p>
        <code>Reference: {reference}</code>
        <Link href="/buyer/orders"><ClipboardList size={18} /> View my orders</Link>
      </section>
    </main>
  );
}
