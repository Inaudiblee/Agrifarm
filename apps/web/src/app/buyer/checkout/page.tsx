"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Banknote, CalendarDays, Check, ChevronRight, Clock3, CreditCard, LockKeyhole, Moon, ShoppingBasket, Sun } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { getApiBase, parseApiError, resolveMediaUrl } from "@/lib/api";
import { getAuthToken } from "@/lib/auth-storage";
import { AGRIFARM_LOGO_SRC } from "@/lib/brand-assets";

type CartItem = {
  id: string;
  quantity: number;
  variant: {
    name: string;
    id: string;
    price: string | number;
    product: {
      name: string;
      images?: Array<{ url: string; altText?: string | null; isPrimary?: boolean | null }>;
    };
    store: { name: string };
  };
};

type Cart = { items: CartItem[] };
const BUY_NOW_STORAGE_KEY = "agrifarm_buy_now_checkout";

function money(value: string | number | null | undefined) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: Number(value ?? 0) % 1 === 0 ? 0 : 2,
  }).format(Number(value ?? 0));
}

function imageFor(item: CartItem) {
  const image = item.variant.product.images?.find((entry) => entry.isPrimary)?.url ?? item.variant.product.images?.[0]?.url;
  return image ? resolveMediaUrl(image) : "/assets/agrifarm/marketplace-basket.png";
}

export default function CheckoutPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [cart, setCart] = useState<Cart>({ items: [] });
  const [isBuyNow, setIsBuyNow] = useState(false);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pickupDate, setPickupDate] = useState("");
  const [pickupTime, setPickupTime] = useState("12:00");

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    async function load() {
      try {
        const buyNowItem = sessionStorage.getItem(BUY_NOW_STORAGE_KEY);
        if (buyNowItem) {
          setCart({ items: [JSON.parse(buyNowItem) as CartItem] });
          setIsBuyNow(true);
          setLoading(false);
          return;
        }

        const response = await fetch(`${getApiBase()}/api/cart`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error(await parseApiError(response));
        setCart((await response.json()) as Cart);
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "Unable to load checkout.");
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [router]);

  const total = useMemo(
    () => cart.items.reduce((sum, item) => sum + Number(item.variant.price) * item.quantity, 0),
    [cart.items]
  );
  const totalItems = useMemo(() => cart.items.reduce((sum, item) => sum + item.quantity, 0), [cart.items]);
  const deposit = Math.round(total * 50) / 100;
  const remaining = Math.round((total - deposit) * 100) / 100;
  const pickupLimits = useMemo(() => {
    const format = (offset: number) => {
      const manila = new Date(Date.now() + 8 * 60 * 60 * 1000 + offset * 86_400_000);
      return `${manila.getUTCFullYear()}-${String(manila.getUTCMonth() + 1).padStart(2, "0")}-${String(manila.getUTCDate()).padStart(2, "0")}`;
    };
    return { min: format(1), max: format(2) };
  }, []);

  useEffect(() => {
    setPickupDate((current) => current || pickupLimits.min);
  }, [pickupLimits.min]);

  async function placeOrder() {
    const token = getAuthToken();
    if (!token) {
      router.replace("/login");
      return;
    }
    setPlacing(true);
    setError(null);
    try {
      if (!pickupDate || !pickupTime) throw new Error("Choose your pickup date and time.");
      const response = await fetch(`${getApiBase()}/api/payments/paymongo/checkout-session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          pickupAt: `${pickupDate}T${pickupTime}`,
          ...(isBuyNow ? { items: cart.items.map((item) => ({ variantId: item.variant.id, quantity: item.quantity })) } : {}),
        }),
      });
      if (!response.ok) throw new Error(await parseApiError(response));
      const payload = (await response.json()) as { checkoutUrl?: string };
      if (!payload.checkoutUrl) throw new Error("PayMongo checkout URL was not returned.");
      window.location.href = payload.checkoutUrl;
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to place order.");
      setPlacing(false);
    }
  }

  return (
    <main className="checkout-page" data-checkout-theme={theme}>
      <header className="checkout-topbar">
        <Link href="/marketplace" className="checkout-brand" aria-label="AgriFarm marketplace">
          <img src={AGRIFARM_LOGO_SRC} alt="" />
          <span><strong>AgriFarm</strong><small>Pickup reservation</small></span>
        </Link>
        <button type="button" className="checkout-theme-toggle" onClick={toggleTheme} aria-label={`Switch to ${theme === "day" ? "night" : "day"} mode`}>
          {theme === "day" ? <Moon size={19} /> : <Sun size={19} />}
        </button>
      </header>
      <section className="checkout-shell">
        <Link className="checkout-back" href={isBuyNow ? "/marketplace" : "/buyer/wishlist"}><ArrowLeft size={18} /> {isBuyNow ? "Back to marketplace" : "Back to my cart"}</Link>
        <div className="checkout-head">
          <div>
            <span className="checkout-eyebrow">Fresh produce reservation</span>
            <h1>Reserve your pickup</h1>
            <p>Check your produce, choose a convenient pickup time, then pay half to hold your order.</p>
          </div>
        </div>
        <ol className="checkout-steps" aria-label="Reservation steps">
          <li className="is-done"><span><Check size={15} /></span><strong>Review produce</strong></li>
          <li className="is-active"><span>2</span><strong>Choose pickup</strong></li>
          <li><span>3</span><strong>Pay deposit</strong></li>
        </ol>
        {loading ? <p className="checkout-note" aria-live="polite">Loading your produce...</p> : null}
        {error ? <p className="checkout-note is-error" role="alert">{error}</p> : null}
        {!loading && !error && cart.items.length === 0 ? <p className="checkout-note">Your cart is empty.</p> : null}
        {cart.items.length ? (
          <div className="checkout-grid">
            <div className="checkout-main-column">
              <section className="checkout-items" aria-labelledby="checkout-products-title">
                <div className="checkout-section-title">
                  <span><ShoppingBasket size={20} /><strong id="checkout-products-title">Your produce</strong></span>
                  <small>{totalItems} item{totalItems === 1 ? "" : "s"}</small>
                </div>
                {cart.items.map((item) => (
                  <article key={item.id} className="checkout-item">
                    <img src={imageFor(item)} alt={item.variant.product.name} />
                    <div>
                      <strong>{item.variant.product.name}</strong>
                      <small>{item.variant.store.name} · {item.variant.name}</small>
                      <span>Quantity: {item.quantity} · {money(item.variant.price)} each</span>
                    </div>
                    <em>{money(Number(item.variant.price) * item.quantity)}</em>
                  </article>
                ))}
              </section>
              <section className="checkout-pickup-card" aria-labelledby="pickup-title">
                <div className="checkout-section-title">
                  <span><CalendarDays size={20} /><strong id="pickup-title">When will you pick it up?</strong></span>
                  <small>Next 1–2 days</small>
                </div>
                <div className="checkout-schedule-fields">
                  <label>
                    <span>Pickup date</span>
                    <input type="date" min={pickupLimits.min} max={pickupLimits.max} value={pickupDate} onChange={(event) => setPickupDate(event.target.value)} required />
                  </label>
                  <label>
                    <span>Pickup time</span>
                    <select value={pickupTime} onChange={(event) => setPickupTime(event.target.value)} required>
                      {Array.from({ length: 11 }, (_, index) => {
                        const totalMinutes = 12 * 60 + index * 30;
                        const hour = Math.floor(totalMinutes / 60);
                        const minute = totalMinutes % 60;
                        const value = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
                        const label = `${hour > 12 ? hour - 12 : hour}:${String(minute).padStart(2, "0")} PM`;
                        return <option value={value} key={value}>{label}</option>;
                      })}
                    </select>
                  </label>
                </div>
                <p className="checkout-pickup-note"><Clock3 size={17} /> Pickup is available from 12:00 PM to 5:00 PM.</p>
              </section>
            </div>
            <aside className="checkout-summary" aria-label="Payment details">
              <div className="checkout-summary-head"><span>Payment summary</span><small>PHP</small></div>
              <div className="checkout-payment-method">
                <span><CreditCard size={19} /></span>
                <div>
                  <strong>Pay 50% now with GCash</strong>
                  <small>This deposit holds your produce.</small>
                </div>
              </div>
              <div className="checkout-totals">
                <div><span>Order total</span><strong>{money(total)}</strong></div>
                <div><span>Pay at pickup</span><strong>{money(remaining)}</strong></div>
                <div className="is-grand"><span>Deposit due now</span><strong>{money(deposit)}</strong></div>
              </div>
              <div className="checkout-payment-method is-cash">
                <span><Banknote size={19} /></span>
                <div>
                  <strong>Remaining 50%: Cash on Pickup</strong>
                  <small>Give the seller {money(remaining)} when you collect the order.</small>
                </div>
              </div>
              <button type="button" disabled={placing || totalItems === 0 || !pickupDate || !pickupTime} onClick={() => void placeOrder()}>
                <span>{placing ? "Opening GCash..." : `Pay ${money(deposit)} and reserve`}</span>
                {placing ? null : <ChevronRight size={20} />}
              </button>
              <p className="checkout-secure-note"><LockKeyhole size={15} /> Secure payment handled by PayMongo</p>
            </aside>
          </div>
        ) : null}
      </section>
    </main>
  );
}
