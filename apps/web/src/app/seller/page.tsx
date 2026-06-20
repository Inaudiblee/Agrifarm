"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  Home,
  Leaf,
  LogOut,
  Loader2,
  MapPin,
  PackagePlus,
  PhilippinePeso,
  Plus,
  RefreshCw,
  ShieldCheck,
  ShoppingBag,
  Store,
  Truck,
} from "lucide-react";
import { useToast } from "@/components/toast-provider";
import { getApiBase, parseApiError } from "@/lib/api";
import { clearAuthSession, getAuthToken, getAuthUser, type AuthUser } from "@/lib/auth-storage";

type SellerProfile = {
  id: string;
  businessName: string;
  businessPermitNo: string | null;
  taxId: string | null;
  verifiedAt: string | null;
};

type Barangay = {
  id: string;
  name: string;
};

type ServiceArea = {
  id: string;
  barangayId: string;
  deliveryFee: string | number;
  minOrder: string | number | null;
  isActive: boolean;
  barangay: Barangay;
};

type SellerStore = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  status: "DRAFT" | "ACTIVE" | "SUSPENDED" | "CLOSED";
  serviceAreas: ServiceArea[];
};

type ProductVariant = {
  id: string;
  name: string;
  sku: string | null;
  unit: string;
  price: string | number;
  stockOnHand: number;
  lowStockThreshold: number;
  isActive: boolean;
};

type SellerProduct = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  status: "DRAFT" | "ACTIVE" | "OUT_OF_STOCK" | "ARCHIVED";
  store: Pick<SellerStore, "id" | "name" | "slug" | "status">;
  variants: ProductVariant[];
  _count?: { reviews: number };
};

type SellerOrder = {
  id: string;
  status: "PENDING" | "CONFIRMED" | "PREPARING" | "READY_FOR_PICKUP" | "OUT_FOR_DELIVERY" | "DELIVERED" | "CANCELLED";
  subtotal: string | number;
  deliveryFee: string | number;
  commissionFee: string | number;
  payoutAmount: string | number;
  createdAt: string;
  store: Pick<SellerStore, "id" | "name" | "slug" | "status">;
  items: Array<{
    id: string;
    productName: string;
    variantName: string;
    unit: string;
    quantity: number;
    unitPrice: string | number;
    subtotal: string | number;
  }>;
  order: {
    orderNumber: string;
    buyer?: { fullName: string; email: string };
    shippingAddress?: {
      recipientName: string;
      phone: string;
      street: string;
      barangay: string;
      city: string;
    };
  };
};

type SellerState = {
  profile: SellerProfile | null;
  stores: SellerStore[];
  products: SellerProduct[];
  orders: SellerOrder[];
  barangays: Barangay[];
};

const emptySellerState: SellerState = {
  profile: null,
  stores: [],
  products: [],
  orders: [],
  barangays: [],
};

function money(value: string | number | null | undefined) {
  const amount = Number(value ?? 0);
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(Number.isFinite(amount) ? amount : 0);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function fieldValue(form: FormData, name: string) {
  return String(form.get(name) ?? "").trim();
}

async function readJson<T>(response: Response): Promise<T | null> {
  const text = await response.text();
  if (!text.trim()) return null;
  return JSON.parse(text) as T;
}

function SellerSidebar({
  user,
  onRefresh,
}: {
  user: AuthUser | null;
  onRefresh: () => void;
}) {
  const router = useRouter();

  function logout() {
    clearAuthSession();
    router.replace("/");
  }

  return (
    <aside className="seller-sidebar" aria-label="Seller navigation">
      <Link href="/" className="seller-sidebar-brand" aria-label="AgriFarm landing page">
        <span className="seller-brand-mark">
          <Leaf size={22} />
        </span>
        <span>
          <small>Seller Center</small>
          <strong>AgriFarm</strong>
        </span>
      </Link>

      <nav className="seller-sidebar-nav">
        <a href="#overview" className="is-active">
          <Home size={18} /> Overview
        </a>
        <a href="#profile">
          <ShieldCheck size={18} /> Profile
        </a>
        <a href="#stores">
          <Store size={18} /> Storefront
        </a>
        <a href="#products">
          <ShoppingBag size={18} /> Products
        </a>
        <a href="#orders">
          <Truck size={18} /> Orders
        </a>
      </nav>

      <div className="seller-sidebar-actions">
        <button type="button" onClick={onRefresh}>
          <RefreshCw size={17} /> Refresh
        </button>
        <Link href="/">
          <Home size={17} /> Landing page
        </Link>
        <button type="button" onClick={logout}>
          <LogOut size={17} /> Sign out
        </button>
      </div>

      <div className="seller-sidebar-user">
        <span>{user?.fullName?.slice(0, 1) ?? "S"}</span>
        <div>
          <strong>{user?.fullName ?? "Seller"}</strong>
          <small>{user?.email ?? "seller account"}</small>
        </div>
      </div>
    </aside>
  );
}

export default function SellerPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [state, setState] = useState<SellerState>(emptySellerState);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedStoreId, setSelectedStoreId] = useState("");
  const [stockAdjustments, setStockAdjustments] = useState<Record<string, string>>({});

  const apiFetch = useCallback(
    async <T,>(path: string, init: RequestInit = {}) => {
      if (!token) {
        throw new Error("Please log in as a seller first.");
      }

      const response = await fetch(`${getApiBase()}${path}`, {
        ...init,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          ...(init.headers ?? {}),
        },
      });

      if (!response.ok) {
        throw new Error(await parseApiError(response));
      }

      return (await readJson<T>(response)) as T;
    },
    [token]
  );

  const loadDashboard = useCallback(async () => {
    if (!token || !user || user.role !== "SELLER") {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [profileResult, barangays] = await Promise.all([
        apiFetch<SellerProfile | null>("/api/sellers/me"),
        fetch(`${getApiBase()}/api/barangays`).then(async (response) => {
          if (!response.ok) return [];
          return (await readJson<Barangay[]>(response)) ?? [];
        }),
      ]);

      if (!profileResult) {
        setState({ ...emptySellerState, barangays });
        return;
      }

      const [stores, products, orders] = await Promise.all([
        apiFetch<SellerStore[]>("/api/stores/mine"),
        apiFetch<SellerProduct[]>("/api/products/mine"),
        apiFetch<SellerOrder[]>("/api/orders/seller"),
      ]);

      setState({ profile: profileResult, stores, products, orders, barangays });
      setSelectedStoreId((current) => current || stores[0]?.id || "");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to load seller dashboard.");
    } finally {
      setLoading(false);
    }
  }, [apiFetch, token, user]);

  useEffect(() => {
    const storedToken = getAuthToken();
    const storedUser = getAuthUser();
    setToken(storedToken);
    setUser(storedUser);

    if (!storedToken || !storedUser) {
      router.replace("/login");
    }
  }, [router]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const metrics = useMemo(() => {
    const variants = state.products.flatMap((product) => product.variants);
    const pendingOrders = state.orders.filter((order) => ["PENDING", "CONFIRMED", "PREPARING"].includes(order.status));
    const activeProducts = state.products.filter((product) => product.status === "ACTIVE");
    const lowStock = variants.filter((variant) => variant.stockOnHand <= variant.lowStockThreshold);
    const payout = state.orders
      .filter((order) => order.status !== "CANCELLED")
      .reduce((sum, order) => sum + Number(order.payoutAmount ?? 0), 0);

    return [
      { label: "Stores", value: state.stores.length, icon: Store, note: "Farm storefronts" },
      { label: "Active products", value: activeProducts.length, icon: ShoppingBag, note: "Visible to buyers" },
      { label: "Low stock", value: lowStock.length, icon: AlertTriangle, note: "Needs restock" },
      { label: "Open orders", value: pendingOrders.length, icon: ClipboardList, note: "Needs action" },
      { label: "Seller payout", value: money(payout), icon: PhilippinePeso, note: "Before withdrawals" },
    ];
  }, [state]);

  async function runAction(action: string, callback: () => Promise<void>) {
    setBusy(action);
    setError(null);

    try {
      await callback();
      await loadDashboard();
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Something went wrong.";
      setError(message);
      showToast({ type: "error", message });
    } finally {
      setBusy(null);
    }
  }

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    await runAction("profile", async () => {
      await apiFetch("/api/sellers/profile", {
        method: "POST",
        body: JSON.stringify({
          businessName: fieldValue(form, "businessName"),
          businessPermitNo: fieldValue(form, "businessPermitNo") || undefined,
          taxId: fieldValue(form, "taxId") || undefined,
        }),
      });
      showToast({ type: "success", message: "Seller profile saved." });
    });
  }

  async function createStore(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = fieldValue(form, "name");

    await runAction("store", async () => {
      await apiFetch("/api/stores", {
        method: "POST",
        body: JSON.stringify({
          name,
          slug: fieldValue(form, "slug") || slugify(name),
          description: fieldValue(form, "description") || undefined,
          status: fieldValue(form, "status") || "ACTIVE",
        }),
      });
      event.currentTarget.reset();
      showToast({ type: "success", message: "Store created." });
    });
  }

  async function addServiceAreas(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const storeId = fieldValue(form, "storeId");
    const barangays = fieldValue(form, "barangays")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    await runAction("areas", async () => {
      await apiFetch(`/api/stores/${storeId}/service-areas`, {
        method: "POST",
        body: JSON.stringify({
          barangays,
          deliveryFee: fieldValue(form, "deliveryFee") || "0",
          minOrder: fieldValue(form, "minOrder") || undefined,
        }),
      });
      event.currentTarget.reset();
      showToast({ type: "success", message: "Service areas updated." });
    });
  }

  async function createProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = fieldValue(form, "name");

    await runAction("product", async () => {
      await apiFetch("/api/products", {
        method: "POST",
        body: JSON.stringify({
          storeId: fieldValue(form, "storeId"),
          name,
          slug: fieldValue(form, "slug") || slugify(name),
          description: fieldValue(form, "description") || undefined,
          variantName: fieldValue(form, "variantName") || "Regular",
          sku: fieldValue(form, "sku") || undefined,
          unit: fieldValue(form, "unit") || "kg",
          price: fieldValue(form, "price"),
          stockOnHand: Number(fieldValue(form, "stockOnHand") || 0),
        }),
      });
      event.currentTarget.reset();
      showToast({ type: "success", message: "Product listed." });
    });
  }

  async function adjustStock(variantId: string) {
    const quantityDelta = Number(stockAdjustments[variantId] ?? 0);
    if (!Number.isInteger(quantityDelta) || quantityDelta === 0) {
      showToast({ type: "warning", message: "Enter a whole-number stock adjustment." });
      return;
    }

    await runAction(`stock-${variantId}`, async () => {
      await apiFetch(`/api/products/variants/${variantId}/stock-adjustments`, {
        method: "POST",
        body: JSON.stringify({ quantityDelta, notes: "Seller dashboard adjustment" }),
      });
      setStockAdjustments((current) => ({ ...current, [variantId]: "" }));
      showToast({ type: "success", message: "Stock updated." });
    });
  }

  async function updateOrderStatus(orderId: string, status: SellerOrder["status"]) {
    await runAction(`order-${orderId}`, async () => {
      await apiFetch(`/api/orders/seller/${orderId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      showToast({ type: "success", message: "Order status updated." });
    });
  }

  if (loading) {
    return (
      <div className="seller-shell">
        <SellerSidebar user={user} onRefresh={loadDashboard} />
        <main className="seller-loading">
          <Loader2 className="seller-spin" size={32} />
          <span>Loading seller workspace...</span>
        </main>
      </div>
    );
  }

  if (!user || user.role !== "SELLER") {
    return (
      <div className="seller-shell">
        <SellerSidebar user={user} onRefresh={loadDashboard} />
        <main className="seller-empty-state">
          <span className="seller-empty-icon">
            <Store size={36} />
          </span>
          <h1>Seller access required</h1>
          <p>Create or log in with a seller account to manage stores, products, stock, and orders.</p>
          <div className="seller-actions">
            <Link href="/register" className="seller-button primary">
              Create seller account
            </Link>
            <Link href="/" className="seller-button secondary">
              View landing page
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const hasProfile = Boolean(state.profile);
  const activeStore = state.stores.find((store) => store.id === selectedStoreId) ?? state.stores[0];

  return (
    <div className="seller-shell">
      <SellerSidebar user={user} onRefresh={loadDashboard} />
      <main className="seller-main" id="overview">
        <section className="seller-hero">
          <div>
            <span className="seller-eyebrow">
              <Leaf size={18} /> Seller workspace
            </span>
            <h1>Manage your AgriFarm store</h1>
            <p>
              Track your seller profile, storefront, service areas, products, stock, buyer orders, delivery status, and
              payout-ready sales from one place.
            </p>
          </div>
          <div className="seller-hero-actions">
            <Link href="/" className="seller-button primary">
              <Home size={17} /> Landing page
            </Link>
          </div>
        </section>

        {error ? (
          <div className="seller-alert" role="alert">
            <AlertTriangle size={18} />
            {error}
          </div>
        ) : null}

        <section className="seller-metrics" aria-label="Seller metrics">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <article key={metric.label} className="seller-metric-card">
                <span>
                  <Icon size={22} />
                </span>
                <strong>{metric.value}</strong>
                <p>{metric.label}</p>
                <small>{metric.note}</small>
              </article>
            );
          })}
        </section>

        <section className="seller-grid" id="profile">
          <article className="seller-panel">
            <div className="seller-panel-head">
              <span>
                <ShieldCheck size={20} /> Seller profile
              </span>
              {state.profile?.verifiedAt ? <small>Verified {formatDate(state.profile.verifiedAt)}</small> : <small>Required</small>}
            </div>
            <form onSubmit={saveProfile} className="seller-form">
              <label>
                Business name
                <input name="businessName" required defaultValue={state.profile?.businessName ?? user.fullName} />
              </label>
              <label>
                Business permit no.
                <input name="businessPermitNo" defaultValue={state.profile?.businessPermitNo ?? ""} />
              </label>
              <label>
                Tax ID
                <input name="taxId" defaultValue={state.profile?.taxId ?? ""} />
              </label>
              <button type="submit" className="seller-button primary" disabled={busy === "profile"}>
                Save seller profile
              </button>
            </form>
          </article>

          <article className="seller-panel" id="stores">
            <div className="seller-panel-head">
              <span>
                <Store size={20} /> Storefront
              </span>
              <small>{state.stores.length} stores</small>
            </div>
            {hasProfile ? (
              <form onSubmit={createStore} className="seller-form">
                <label>
                  Store name
                  <input name="name" required placeholder="Dela Cruz Family Farm" />
                </label>
                <label>
                  Slug
                  <input name="slug" placeholder="dela-cruz-family-farm" />
                </label>
                <label>
                  Description
                  <textarea name="description" rows={3} placeholder="Fresh vegetables harvested in Pasig partner farms." />
                </label>
                <label>
                  Status
                  <select name="status" defaultValue="ACTIVE">
                    <option value="ACTIVE">Active</option>
                    <option value="DRAFT">Draft</option>
                  </select>
                </label>
                <button type="submit" className="seller-button primary" disabled={busy === "store"}>
                  <Plus size={17} /> Create store
                </button>
              </form>
            ) : (
              <p className="seller-muted">Save your seller profile first, then create your first storefront.</p>
            )}
          </article>
        </section>

        <section className="seller-grid">
          <article className="seller-panel wide">
            <div className="seller-panel-head">
              <span>
                <MapPin size={20} /> Delivery service areas
              </span>
              <small>Pasig barangays</small>
            </div>
            {state.stores.length ? (
              <>
                <form onSubmit={addServiceAreas} className="seller-form service-area-form">
                  <label>
                    Store
                    <select name="storeId" value={selectedStoreId || activeStore?.id || ""} onChange={(event) => setSelectedStoreId(event.target.value)}>
                      {state.stores.map((store) => (
                        <option key={store.id} value={store.id}>
                          {store.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Barangays
                    <input
                      name="barangays"
                      required
                      placeholder={state.barangays.slice(0, 3).map((barangay) => barangay.name).join(", ") || "Kapitolyo, San Antonio"}
                    />
                  </label>
                  <label>
                    Delivery fee
                    <input name="deliveryFee" inputMode="decimal" placeholder="50" />
                  </label>
                  <label>
                    Min order
                    <input name="minOrder" inputMode="decimal" placeholder="300" />
                  </label>
                  <button type="submit" className="seller-button primary" disabled={busy === "areas"}>
                    Add areas
                  </button>
                </form>
                <div className="seller-chip-list">
                  {(activeStore?.serviceAreas ?? []).filter((area) => area.isActive).map((area) => (
                    <span key={area.id}>
                      {area.barangay.name} - {money(area.deliveryFee)}
                      {area.minOrder ? ` min ${money(area.minOrder)}` : ""}
                    </span>
                  ))}
                </div>
              </>
            ) : (
              <p className="seller-muted">Create a store to add barangay delivery coverage, fees, and minimum orders.</p>
            )}
          </article>

          <article className="seller-panel wide">
            <div className="seller-panel-head">
              <span>
                <PackagePlus size={20} /> Product listing
              </span>
              <small>Product + first variant</small>
            </div>
            {state.stores.length ? (
              <form onSubmit={createProduct} className="seller-form product-form">
                <label>
                  Store
                  <select name="storeId" defaultValue={activeStore?.id}>
                    {state.stores.map((store) => (
                      <option key={store.id} value={store.id}>
                        {store.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Product
                  <input name="name" required placeholder="Sariwang Pechay" />
                </label>
                <label>
                  Slug
                  <input name="slug" placeholder="sariwang-pechay" />
                </label>
                <label>
                  Variant
                  <input name="variantName" placeholder="Regular" />
                </label>
                <label>
                  SKU
                  <input name="sku" placeholder="PCHY-001" />
                </label>
                <label>
                  Unit
                  <input name="unit" placeholder="kg" />
                </label>
                <label>
                  Price
                  <input name="price" required inputMode="decimal" placeholder="120" />
                </label>
                <label>
                  Initial stock
                  <input name="stockOnHand" required inputMode="numeric" placeholder="25" />
                </label>
                <label className="product-description-field">
                  Description
                  <textarea name="description" rows={3} placeholder="Harvested fresh and packed with care." />
                </label>
                <button type="submit" className="seller-button primary" disabled={busy === "product"}>
                  Publish product
                </button>
              </form>
            ) : (
              <p className="seller-muted">Create a store before listing products and variants.</p>
            )}
          </article>
        </section>

        <section className="seller-panel wide" id="products">
          <div className="seller-panel-head">
            <span>
              <ShoppingBag size={20} /> Products, variants, and inventory
            </span>
            <small>{state.products.length} product records</small>
          </div>
          <div className="seller-table-list">
            {state.products.length ? (
              state.products.map((product) => (
                <article key={product.id} className="seller-product-row">
                  <div>
                    <strong>{product.name}</strong>
                    <small>
                      {product.store.name} - {product.status} - {product._count?.reviews ?? 0} reviews
                    </small>
                  </div>
                  <div className="seller-variant-list">
                    {product.variants.map((variant) => {
                      const low = variant.stockOnHand <= variant.lowStockThreshold;
                      return (
                        <div key={variant.id} className={`seller-variant-row${low ? " is-low" : ""}`}>
                          <span>
                            <strong>{variant.name}</strong>
                            <small>
                              {money(variant.price)} / {variant.unit} {variant.sku ? `- ${variant.sku}` : ""}
                            </small>
                          </span>
                          <span className="seller-stock-pill">{variant.stockOnHand} in stock</span>
                          <input
                            aria-label={`Adjust stock for ${product.name} ${variant.name}`}
                            value={stockAdjustments[variant.id] ?? ""}
                            onChange={(event) => setStockAdjustments((current) => ({ ...current, [variant.id]: event.target.value }))}
                            placeholder="+10 or -2"
                            inputMode="numeric"
                          />
                          <button type="button" className="seller-button secondary compact" onClick={() => adjustStock(variant.id)} disabled={busy === `stock-${variant.id}`}>
                            Adjust
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </article>
              ))
            ) : (
              <p className="seller-muted">No products yet. Add your first harvest listing above.</p>
            )}
          </div>
        </section>

        <section className="seller-panel wide" id="orders">
          <div className="seller-panel-head">
            <span>
              <Truck size={20} /> Seller orders and fulfillment
            </span>
            <small>{state.orders.length} seller orders</small>
          </div>
          <div className="seller-order-list">
            {state.orders.length ? (
              state.orders.map((order) => (
                <article key={order.id} className="seller-order-card">
                  <div className="seller-order-top">
                    <div>
                      <strong>{order.order.orderNumber}</strong>
                      <small>
                        {order.store.name} - {formatDate(order.createdAt)} - {order.status}
                      </small>
                    </div>
                    <span>{money(order.payoutAmount)}</span>
                  </div>
                  <div className="seller-order-body">
                    <p>
                      Buyer: {order.order.buyer?.fullName ?? "Buyer"} - Ship to {order.order.shippingAddress?.barangay ?? "address pending"}
                    </p>
                    <ul>
                      {order.items.map((item) => (
                        <li key={item.id}>
                          {item.quantity} {item.unit} {item.productName} ({item.variantName}) - {money(item.subtotal)}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="seller-status-actions">
                    {(["CONFIRMED", "PREPARING", "READY_FOR_PICKUP", "OUT_FOR_DELIVERY", "DELIVERED"] as SellerOrder["status"][]).map((status) => (
                      <button
                        key={status}
                        type="button"
                        className="seller-button secondary compact"
                        disabled={order.status === status || busy === `order-${order.id}`}
                        onClick={() => updateOrderStatus(order.id, status)}
                      >
                        {status.replace(/_/g, " ")}
                      </button>
                    ))}
                  </div>
                </article>
              ))
            ) : (
              <p className="seller-muted">No seller orders yet. New paid checkout groups will appear here by store.</p>
            )}
          </div>
        </section>

        <section className="seller-checklist">
          {[
            ["Seller profile", hasProfile],
            ["At least one active store", state.stores.some((store) => store.status === "ACTIVE")],
            ["Barangay delivery areas", state.stores.some((store) => store.serviceAreas.some((area) => area.isActive))],
            ["Published products", state.products.some((product) => product.status === "ACTIVE")],
            ["Stock tracked per variant", state.products.some((product) => product.variants.some((variant) => variant.stockOnHand > 0))],
          ].map(([label, done]) => (
            <div key={String(label)} className={done ? "is-done" : ""}>
              <CheckCircle2 size={18} />
              <span>{label}</span>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
