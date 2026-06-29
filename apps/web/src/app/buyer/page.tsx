"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ClipboardList,
  Home,
  Leaf,
  Loader2,
  LogOut,
  PackageSearch,
  RefreshCw,
  Search,
  ShoppingCart,
  Store,
  Trash2,
} from "lucide-react";
import { AccountMenu } from "@/components/account-menu";
import { useLocale } from "@/components/locale-provider";
import { useToast } from "@/components/toast-provider";
import { getApiBase, parseApiError } from "@/lib/api";
import { clearAuthSession, getAuthToken, getAuthUser, type AuthUser } from "@/lib/auth-storage";

type Product = {
  id: string;
  name: string;
  description: string | null;
  store: { name: string };
  variants: Array<{ id: string; name: string; unit: string; price: string | number; stockOnHand: number }>;
};
type Cart = {
  items: Array<{
    id: string;
    quantity: number;
    variant: { id: string; name: string; price: string | number; product: { name: string }; store: { name: string } };
  }>;
};
type Order = {
  id: string;
  orderNumber: string;
  status: string;
  grandTotal: string | number;
  createdAt: string;
  sellerOrders: Array<{
    id: string;
    status: string;
    store: { name: string };
    items: Array<{ id: string; productName: string; variantName: string; quantity: number; unit: string }>;
  }>;
};

const fill = (template: string, values: Record<string, string | number>) =>
  Object.entries(values).reduce((text, [key, value]) => text.replaceAll(`{${key}}`, String(value)), template);
const money = (value: string | number) => new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(Number(value));
const date = (value: string) => new Intl.DateTimeFormat("en-PH", { dateStyle: "medium" }).format(new Date(value));

export default function BuyerPage() {
  const router = useRouter();
  const { copy } = useLocale();
  const t = copy.buyerPage;
  const common = copy.common;
  const { showToast } = useToast();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<Cart>({ items: [] });
  const [orders, setOrders] = useState<Order[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const api = useCallback(
    async <T,>(path: string, init: RequestInit = {}) => {
      const response = await fetch(`${getApiBase()}${path}`, {
        ...init,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(init.headers ?? {}),
        },
      });
      if (!response.ok) throw new Error(await parseApiError(response));
      return response.json() as Promise<T>;
    },
    [token]
  );

  const load = useCallback(async () => {
    if (!token || user?.role !== "BUYER") {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [nextProducts, nextCart, nextOrders] = await Promise.all([
        api<Product[]>("/api/products"),
        api<Cart>("/api/cart"),
        api<Order[]>("/api/orders"),
      ]);
      setProducts(nextProducts);
      setCart(nextCart);
      setOrders(nextOrders);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t.loadError);
    } finally {
      setLoading(false);
    }
  }, [api, token, user, t.loadError]);

  useEffect(() => {
    const storedToken = getAuthToken();
    const storedUser = getAuthUser();
    setToken(storedToken);
    setUser(storedUser);
    if (!storedToken || !storedUser) router.replace("/login");
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

  const visibleProducts = useMemo(
    () => products.filter((product) => `${product.name} ${product.store.name}`.toLowerCase().includes(query.toLowerCase())),
    [products, query]
  );
  const cartTotal = cart.items.reduce((sum, item) => sum + Number(item.variant.price) * item.quantity, 0);

  async function action(key: string, work: () => Promise<void>, success: string) {
    setBusy(key);
    setError(null);
    try {
      await work();
      showToast({ type: "success", message: success });
      await load();
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : t.genericError;
      setError(message);
      showToast({ type: "error", message });
    } finally {
      setBusy(null);
    }
  }

  const logout = () => {
    clearAuthSession();
    router.replace("/");
  };

  if (loading) {
    return (
      <div className="seller-shell">
        <BuyerSidebar user={user} t={t} common={common} onRefresh={load} onLogout={logout} />
        <main className="seller-loading">
          <Loader2 className="seller-spin" /> {t.loading}
        </main>
      </div>
    );
  }

  if (!user || user.role !== "BUYER") {
    return (
      <div className="seller-shell">
        <BuyerSidebar user={user} t={t} common={common} onRefresh={load} onLogout={logout} />
        <main className="seller-empty-state">
          <ShoppingCart size={42} />
          <h1>{t.accessTitle}</h1>
          <p>{t.accessBody}</p>
          <Link className="seller-button primary" href="/login">
            {t.accessCta}
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="seller-shell">
      <BuyerSidebar user={user} t={t} common={common} onRefresh={load} onLogout={logout} />
      <main className="seller-main" id="overview">
        <section className="seller-hero">
          <div>
            <span className="seller-eyebrow">
              <Leaf size={18} /> {t.eyebrow}
            </span>
            <h1>{fill(t.heroTitle, { name: user.fullName.split(" ")[0] })}</h1>
            <p>{t.heroBody}</p>
          </div>
          <AccountMenu user={user} accountLabel={t.account} dashboardHref="/buyer" settingsHref="/settings" compact />
        </section>

        {error ? <div className="seller-alert">{error}</div> : null}

        <section className="seller-metrics">
          <article className="seller-metric-card">
            <span>
              <Store size={22} />
            </span>
            <strong>{products.length}</strong>
            <p>{t.availableProducts}</p>
            <small>{t.fromLocalFarms}</small>
          </article>
          <article className="seller-metric-card">
            <span>
              <ShoppingCart size={22} />
            </span>
            <strong>{cart.items.length}</strong>
            <p>{t.basketItems}</p>
            <small>{money(cartTotal)}</small>
          </article>
          <article className="seller-metric-card">
            <span>
              <ClipboardList size={22} />
            </span>
            <strong>{orders.length}</strong>
            <p>{t.yourOrders}</p>
            <small>{t.completeHistory}</small>
          </article>
        </section>

        <section className="seller-panel wide" id="marketplace">
          <div className="seller-panel-head">
            <span>
              <PackageSearch size={20} /> {t.marketplace}
            </span>
            <small>{fill(t.results, { count: visibleProducts.length })}</small>
          </div>
          <label className="role-search">
            <Search size={18} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t.searchPlaceholder} />
          </label>
          <div className="seller-table-list">
            {visibleProducts.map((product) => (
              <article className="seller-product-row" key={product.id}>
                <div>
                  <strong>{product.name}</strong>
                  <small>{product.store.name}</small>
                  <p>{product.description ?? t.freshProduceFallback}</p>
                </div>
                <div className="role-row-actions">
                  {product.variants.map((variant) => (
                    <button
                      key={variant.id}
                      className="seller-button primary compact"
                      disabled={!variant.stockOnHand || busy === variant.id}
                      onClick={() =>
                        action(
                          variant.id,
                          () => api("/api/cart/items", { method: "POST", body: JSON.stringify({ variantId: variant.id, quantity: 1 }) }).then(() => undefined),
                          fill(t.addedToBasket, { product: product.name })
                        )
                      }
                    >
                      {variant.name} - {money(variant.price)}/{variant.unit}
                    </button>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="seller-grid">
          <article className="seller-panel" id="cart">
            <div className="seller-panel-head">
              <span>
                <ShoppingCart size={20} /> {t.yourBasket}
              </span>
              <small>{money(cartTotal)}</small>
            </div>
            <div className="seller-table-list">
              {cart.items.length ? (
                cart.items.map((item) => (
                  <div className="seller-product-row" key={item.id}>
                    <div>
                      <strong>{item.variant.product.name}</strong>
                      <small>
                        {item.variant.store.name} - {item.quantity} x {money(item.variant.price)}
                      </small>
                    </div>
                    <button
                      className="seller-button secondary compact"
                      onClick={() => action(`remove-${item.id}`, () => api(`/api/cart/items/${item.id}`, { method: "DELETE" }).then(() => undefined), t.itemRemoved)}
                    >
                      <Trash2 size={16} /> {common.remove}
                    </button>
                  </div>
                ))
              ) : (
                <p>{t.emptyBasket}</p>
              )}
            </div>
          </article>

          <article className="seller-panel" id="orders">
            <div className="seller-panel-head">
              <span>
                <ClipboardList size={20} /> {t.orderHistory}
              </span>
              <small>{fill(t.orderCount, { count: orders.length })}</small>
            </div>
            <div className="seller-order-list">
              {orders.length ? (
                orders.map((order) => (
                  <article className="seller-order-card" key={order.id}>
                    <div className="seller-order-top">
                      <div>
                        <strong>{order.orderNumber}</strong>
                        <small>
                          {date(order.createdAt)} - {order.status}
                        </small>
                      </div>
                      <span>{money(order.grandTotal)}</span>
                    </div>
                    <div className="seller-order-body">
                      <ul>
                        {order.sellerOrders.map((part) => (
                          <li key={part.id}>
                            {part.store.name}: {part.items.map((item) => `${item.quantity} ${item.unit} ${item.productName}`).join(", ")}
                          </li>
                        ))}
                      </ul>
                    </div>
                    {["PENDING", "CONFIRMED"].includes(order.status) ? (
                      <button
                        className="seller-button secondary compact"
                        disabled={busy === order.id}
                        onClick={() => action(order.id, () => api(`/api/orders/${order.id}/cancel`, { method: "POST" }).then(() => undefined), t.orderCancelled)}
                      >
                        {t.cancelOrder}
                      </button>
                    ) : null}
                  </article>
                ))
              ) : (
                <p>{t.emptyOrders}</p>
              )}
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}

function BuyerSidebar({
  user,
  t,
  common,
  onRefresh,
  onLogout,
}: {
  user: AuthUser | null;
  t: ReturnType<typeof useLocale>["copy"]["buyerPage"];
  common: ReturnType<typeof useLocale>["copy"]["common"];
  onRefresh: () => void;
  onLogout: () => void;
}) {
  return (
    <aside className="seller-sidebar">
      <Link href="/" className="seller-sidebar-brand">
        <span className="seller-brand-mark">
          <Leaf size={22} />
        </span>
        <span>
          <small>{t.center}</small>
          <strong>AgriFarm</strong>
        </span>
      </Link>
      <nav className="seller-sidebar-nav">
        <a className="is-active" href="#overview">
          <Home size={18} /> {t.overview}
        </a>
        <a href="#marketplace">
          <Store size={18} /> {t.marketplace}
        </a>
        <a href="#cart">
          <ShoppingCart size={18} /> {t.basket}
        </a>
        <a href="#orders">
          <ClipboardList size={18} /> {t.orders}
        </a>
      </nav>
      <div className="seller-sidebar-actions">
        <button onClick={onRefresh}>
          <RefreshCw size={17} /> {common.refresh}
        </button>
        <Link href="/">
          <Home size={17} /> {common.landingPage}
        </Link>
        <button onClick={onLogout}>
          <LogOut size={17} /> {common.signOut}
        </button>
      </div>
      <div className="seller-sidebar-user">
        <span>{user?.fullName?.[0] ?? "B"}</span>
        <div>
          <strong>{user?.fullName ?? t.account}</strong>
          <small>{user?.email ?? t.account}</small>
        </div>
      </div>
    </aside>
  );
}
