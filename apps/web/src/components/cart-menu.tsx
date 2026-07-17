"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ShoppingCart } from "lucide-react";
import { getApiBase, parseApiError, resolveMediaUrl } from "@/lib/api";
import { getAuthToken } from "@/lib/auth-storage";

type CartItem = {
  id: string;
  quantity: number;
  variant: {
    id: string;
    name: string;
    price: string | number;
    product: {
      name: string;
      images?: Array<{ url: string; altText?: string | null; isPrimary?: boolean | null }>;
    };
    store: { name: string };
  };
};

type Cart = {
  items: CartItem[];
};

const fallbackImage = "/assets/agrifarm/marketplace-basket.png";

function money(value: string | number | null | undefined) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: Number(value ?? 0) % 1 === 0 ? 0 : 2,
  }).format(Number(value ?? 0));
}

function productImage(item: CartItem) {
  const image = item.variant.product.images?.find((entry) => entry.isPrimary)?.url ?? item.variant.product.images?.[0]?.url;
  return image ? resolveMediaUrl(image) : fallbackImage;
}

export function CartMenu({ compact = false }: { compact?: boolean }) {
  const [cart, setCart] = useState<Cart>({ items: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const token = typeof window !== "undefined" ? getAuthToken() : null;

  async function loadCart() {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${getApiBase()}/api/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(await parseApiError(response));
      const payload = (await response.json()) as Cart;
      setCart(payload ?? { items: [] });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to load cart.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadCart();
    const onCartUpdated = () => void loadCart();
    window.addEventListener("agrifarm-cart-updated", onCartUpdated);
    return () => window.removeEventListener("agrifarm-cart-updated", onCartUpdated);
    // token is intentionally captured from current browser auth state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const count = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  const total = useMemo(
    () => cart.items.reduce((sum, item) => sum + Number(item.variant.price) * item.quantity, 0),
    [cart.items]
  );

  if (!token) return null;

  return (
    <details className={`cart-menu${compact ? " is-compact" : ""}`}>
      <summary className="cart-menu-summary" aria-label={`${count} cart items`}>
        <ShoppingCart size={21} />
        {count ? <span>{count}</span> : null}
      </summary>
      <div className="cart-menu-popover" role="dialog" aria-label="Cart summary">
        <div className="cart-menu-head">
          <strong>My Cart</strong>
          <small>{count} item{count === 1 ? "" : "s"} - {money(total)}</small>
        </div>
        {loading ? <p className="cart-menu-note">Loading cart...</p> : null}
        {error ? <p className="cart-menu-note is-error">{error}</p> : null}
        {!loading && !error && cart.items.length === 0 ? <p className="cart-menu-note">Your cart is empty.</p> : null}
        {cart.items.length ? (
          <div className="cart-menu-list">
            {cart.items.map((item) => (
              <article key={item.id} className="cart-menu-item">
                <img src={productImage(item)} alt={item.variant.product.name} />
                <div>
                  <strong>{item.variant.product.name}</strong>
                  <small>{item.variant.store.name} - {item.variant.name}</small>
                  <em>{item.quantity} x {money(item.variant.price)}</em>
                </div>
                <span>{money(Number(item.variant.price) * item.quantity)}</span>
              </article>
            ))}
          </div>
        ) : null}
        <Link href="/buyer/wishlist" className="cart-menu-action">
          View cart
        </Link>
      </div>
    </details>
  );
}
