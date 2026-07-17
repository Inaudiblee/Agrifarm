"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarCheck2,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Home,
  Leaf,
  LogOut,
  MailCheck,
  MapPin,
  Menu,
  Moon,
  PackageCheck,
  Search,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Star,
  Sun,
  UserRound,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AccountMenu } from "@/components/account-menu";
import { CartMenu } from "@/components/cart-menu";
import { LanguageSwitch } from "@/components/language-switch";
import { useLocale } from "@/components/locale-provider";
import { useToast } from "@/components/toast-provider";
import { useTheme } from "@/components/theme-provider";
import { getApiBase, parseApiError, resolveMediaUrl } from "@/lib/api";
import { clearAuthSession, getAuthToken, getAuthUser, type AuthUser } from "@/lib/auth-storage";
import { AGRIFARM_LOGO_SRC } from "@/lib/brand-assets";

type Product = {
  id: string;
  name: string;
  description: string | null;
  store: { id?: string; name: string; slug?: string };
  variants: Array<{ id: string; name: string; unit: string; price: string | number; stockOnHand: number }>;
  images?: Array<{ id: string; url: string; altText: string | null; isPrimary?: boolean }>;
  _count?: { reviews?: number };
};

type Cart = {
  items: Array<{
    id: string;
    quantity: number;
    variant: {
      id: string;
      name: string;
      price: string | number;
      product: { name: string; images?: Array<{ url: string; altText?: string | null; isPrimary?: boolean | null }> };
      store: { name: string };
    };
  }>;
};

type Address = {
  id: string;
  label: string | null;
  recipientName: string;
  phone: string;
  street: string;
  barangay: string;
  city: string;
  province: string;
  postalCode: string | null;
  isDefault: boolean;
};

type Order = {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus?: string;
  grandTotal: string | number;
  depositAmount?: string | number;
  remainingBalance?: string | number;
  pickupScheduledAt?: string | null;
  expiresAt?: string | null;
  createdAt: string;
  shippingAddress?: Address | null;
  sellerOrders: Array<{
    id: string;
    status: string;
    store: { name: string };
    remainingBalance?: string | number;
    balancePaidAt?: string | null;
    items: Array<{ id: string; productName: string; variantName: string; quantity: number; unit: string; subtotal?: string | number }>;
  }>;
  payments?: Array<{ id: string; status: string; amount: string | number; method: string; paidAt?: string | null }>;
};

const money = (value: string | number | null | undefined) =>
  new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: Number(value ?? 0) % 1 === 0 ? 0 : 2 }).format(Number(value ?? 0));

const date = (value: string) => new Intl.DateTimeFormat("en-PH", { dateStyle: "medium" }).format(new Date(value));
const dateTime = (value: string) => new Intl.DateTimeFormat("en-PH", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Manila" }).format(new Date(value));
// Theme keys and types are managed by ThemeProvider

const statusLabel = (value: string) => value.toLowerCase().replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

function initials(name?: string | null) {
  const parts = (name ?? "Buyer").trim().split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase()).join("") || "B";
}

function cartProductImage(item: Cart["items"][number]) {
  const image = item.variant.product.images?.find((entry) => entry.isPrimary)?.url ?? item.variant.product.images?.[0]?.url;
  return image ? resolveMediaUrl(image) : "/assets/agrifarm/marketplace-basket.png";
}

async function readJson<T>(response: Response): Promise<T | null> {
  const text = await response.text();
  if (!text.trim()) return null;
  return JSON.parse(text) as T;
}

type BuyerView = "overview" | "profile" | "addresses" | "orders" | "wishlist" | "reviews" | "payment" | "settings";

function buyerViewFromPath(pathname: string): BuyerView {
  const segment = pathname.split("/").filter(Boolean)[1];
  if (segment === "profile") return "profile";
  if (segment === "addresses") return "addresses";
  if (segment === "orders") return "orders";
  if (segment === "wishlist") return "wishlist";
  if (segment === "reviews") return "reviews";
  if (segment === "payment-methods") return "payment";
  if (segment === "settings") return "settings";
  return "overview";
}

export default function BuyerPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { copy } = useLocale();
  const t = copy.buyerPage;
  const { showToast } = useToast();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<Cart>({ items: [] });
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const activeView = buyerViewFromPath(pathname);

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
      return (await readJson<T>(response)) as T;
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
      const [nextProducts, nextCart, nextOrders, nextAddresses] = await Promise.all([
        api<Product[]>("/api/products"),
        api<Cart>("/api/cart"),
        api<Order[]>("/api/orders"),
        api<Address[]>("/api/users/me/addresses"),
      ]);
      setProducts(nextProducts ?? []);
      setCart(nextCart ?? { items: [] });
      setOrders(nextOrders ?? []);
      setAddresses(nextAddresses ?? []);
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

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  const defaultAddress = useMemo(() => addresses.find((address) => address.isDefault) ?? addresses[0] ?? null, [addresses]);
  const deliveredOrders = useMemo(() => orders.filter((order) => order.status === "DELIVERED" || order.sellerOrders.some((part) => part.status === "DELIVERED")), [orders]);
  const recentOrders = orders.slice(0, 4);
  const cartTotal = cart.items.reduce((sum, item) => sum + Number(item.variant.price) * item.quantity, 0);
  const reviewCount = products.reduce((sum, product) => sum + (product._count?.reviews ?? 0), 0);
  const memberSince = user?.id ? t.activeBuyer : t.member;
  const pageHead = {
    overview: [t.pageHeads.overview.title, t.pageHeads.overview.body],
    profile: [t.pageHeads.profile.title, t.pageHeads.profile.body],
    addresses: [t.pageHeads.addresses.title, t.pageHeads.addresses.body],
    orders: [t.pageHeads.orders.title, t.pageHeads.orders.body],
    wishlist: [t.pageHeads.wishlist.title, t.pageHeads.wishlist.body],
    reviews: [t.pageHeads.reviews.title, t.pageHeads.reviews.body],
    payment: [t.pageHeads.payment.title, t.pageHeads.payment.body],
    settings: [t.pageHeads.settings.title, t.pageHeads.settings.body],
  } satisfies Record<BuyerView, [string, string]>;



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

  const sidebar = (
    <BuyerSidebar
      user={user}
      activeItem={activeView}
      onLogout={logout}
      onNavigate={() => {
        setDrawerOpen(false);
      }}
    />
  );

  if (loading) {
    return (
      <div className="buyer-profile-page" data-buyer-theme={theme}>
        <BuyerTopNav user={user} cartCount={cart.items.length} t={t} theme={theme} onToggleTheme={toggleTheme} />
        <div className="seller-shell buyer-dashboard-shell">
          <div className="buyer-desktop-sidebar">{sidebar}</div>
          <main className="seller-main buyer-main">
            <BuyerMobileBar onMenu={() => setDrawerOpen(true)} user={user} t={t} theme={theme} onToggleTheme={toggleTheme} />
            <DashboardSkeleton t={t} />
          </main>
          <BuyerDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
            {sidebar}
          </BuyerDrawer>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "BUYER") {
    return (
      <div className="buyer-profile-page" data-buyer-theme={theme}>
        <BuyerTopNav user={user} cartCount={0} t={t} theme={theme} onToggleTheme={toggleTheme} />
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
    <div className="buyer-profile-page" data-buyer-theme={theme}>
      <BuyerTopNav user={user} cartCount={cart.items.length} t={t} theme={theme} onToggleTheme={toggleTheme} />
      <div className="seller-shell buyer-dashboard-shell">
        <div className="buyer-desktop-sidebar">{sidebar}</div>
        <main className="seller-main buyer-main" id="overview">
          <BuyerMobileBar onMenu={() => setDrawerOpen(true)} user={user} t={t} theme={theme} onToggleTheme={toggleTheme} />

          <section className="buyer-page-head">
            <div>
              <h1>{pageHead[activeView][0]}</h1>
              <p>{pageHead[activeView][1]}</p>
            </div>
          </section>

          {error ? (
            <div className="seller-alert" role="alert">
              <AlertTriangle size={18} />
              {error}
            </div>
          ) : null}

          <BuyerViewContent
            view={activeView}
            user={user}
            orders={orders}
            recentOrders={recentOrders}
            deliveredOrders={deliveredOrders}
            products={products}
            cart={cart}
            defaultAddress={defaultAddress}
            reviewCount={reviewCount}
            memberSince={memberSince}
            busy={busy}
            t={t}
            cancelOrder={(orderId) => action(orderId, () => api(`/api/orders/${orderId}/cancel`, { method: "POST" }).then(() => undefined), t.orderCancelled)}
          />
        </main>
        <BuyerDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
          {sidebar}
        </BuyerDrawer>
      </div>
      <footer className="buyer-site-footer">
        <span>{t.footer}</span>
        <strong>{t.basketSummary.replace("{count}", String(cart.items.length)).replace("{total}", money(cartTotal))}</strong>
      </footer>
    </div>
  );
}

function BuyerTopNav({
  user,
  cartCount,
  t,
  theme,
  onToggleTheme,
}: {
  user: AuthUser | null;
  cartCount: number;
  t: ReturnType<typeof useLocale>["copy"]["buyerPage"];
  theme: "day" | "night";
  onToggleTheme: () => void;
}) {
  return (
    <header className="buyer-top-nav">
      <Link href="/" className="buyer-top-brand" aria-label="AgriFarm home">
        <span className="buyer-brand-mark"><img src={AGRIFARM_LOGO_SRC} alt="" aria-hidden="true" /></span>
        <strong>AgriFarm</strong>
        <small>{t.brandTagline}</small>
      </Link>
      <label className="buyer-top-search">
        <input placeholder={t.topSearchPlaceholder} aria-label={t.topSearchAria} />
        <Search size={20} />
      </label>
      <nav aria-label="Buyer quick links">
        <Link href="/farmers">{t.explore}</Link>
        <Link href="/marketplace">{t.marketplace}</Link>
        <Link href="/pasig">{t.aboutUs}</Link>
      </nav>
      <div className="buyer-top-actions">
        <LanguageSwitch compact />
        <button type="button" className="buyer-theme-toggle" onClick={onToggleTheme} aria-label={theme === "night" ? t.switchToDay : t.switchToNight}>
          {theme === "night" ? <Sun size={19} /> : <Moon size={19} />}
        </button>
        <CartMenu compact />
        <AccountMenu user={user ?? { id: "", email: "", fullName: t.buyerFallback, phone: null, role: "BUYER", status: "ACTIVE" }} accountLabel={t.account} dashboardHref="/buyer" settingsHref="/settings" compact />
      </div>
    </header>
  );
}

function BuyerMobileBar({
  onMenu,
  user,
  t,
  theme,
  onToggleTheme,
}: {
  onMenu: () => void;
  user: AuthUser | null;
  t: ReturnType<typeof useLocale>["copy"]["buyerPage"];
  theme: "day" | "night";
  onToggleTheme: () => void;
}) {
  return (
    <div className="buyer-mobile-bar">
      <button type="button" onClick={onMenu} aria-label={t.openNavigation}>
        <Menu size={22} />
      </button>
      <strong>{t.mobileTitle}</strong>
      <div className="buyer-mobile-actions">
        <LanguageSwitch compact />
        <button type="button" className="buyer-theme-toggle" onClick={onToggleTheme} aria-label={theme === "night" ? t.switchToDay : t.switchToNight}>
          {theme === "night" ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
      <span>{initials(user?.fullName)}</span>
    </div>
  );
}

function BuyerDrawer({ open, onClose, children }: { open: boolean; onClose: () => void; children: ReactNode }) {
  return (
    <div className={`buyer-drawer${open ? " is-open" : ""}`} aria-hidden={!open}>
      <button className="buyer-drawer-backdrop" type="button" onClick={onClose} aria-label="Close buyer navigation" />
      <div className="buyer-drawer-panel" role="dialog" aria-modal="true" aria-label="Buyer navigation">
        <button className="buyer-drawer-close" type="button" onClick={onClose} aria-label="Close buyer navigation">
          <X size={20} />
        </button>
        {children}
      </div>
    </div>
  );
}

function BuyerSidebar({
  user,
  activeItem,
  onLogout,
  onNavigate,
}: {
  user: AuthUser | null;
  activeItem: BuyerView;
  onLogout: () => void;
  onNavigate: (itemId: BuyerView) => void;
}) {
  const { copy } = useLocale();
  const t = copy.buyerPage;
  const items: Array<{ id: BuyerView; href: string; label: string; icon: LucideIcon }> = [
    { id: "overview", href: "/buyer", label: t.overview, icon: Home },
    { id: "profile", href: "/buyer/profile", label: t.myProfile, icon: UserRound },
    { id: "addresses", href: "/buyer/addresses", label: t.addresses, icon: MapPin },
    { id: "orders", href: "/buyer/orders", label: t.myOrders, icon: ClipboardList },
    { id: "wishlist", href: "/buyer/wishlist", label: t.wishlist, icon: ShoppingCart },
    { id: "reviews", href: "/buyer/reviews", label: t.reviews, icon: Star },
    { id: "payment", href: "/buyer/payment-methods", label: t.paymentMethods, icon: ShoppingCart },
    { id: "settings", href: "/buyer/settings", label: t.settings, icon: Settings },
  ];

  return (
    <aside className="seller-sidebar buyer-sidebar" aria-label="Buyer navigation">
      <Link href="/" className="seller-sidebar-brand" aria-label="AgriFarm landing page" onClick={() => onNavigate("overview")}>
        <span className="seller-brand-mark"><img src={AGRIFARM_LOGO_SRC} alt="" aria-hidden="true" /></span>
        <span><small>{t.center}</small><strong>AgriFarm</strong></span>
      </Link>
      <div className="buyer-sidebar-profile">
        <span>{initials(user?.fullName)}</span>
        <strong>{user?.fullName ?? t.account}</strong>
        <em>{t.buyer}</em>
        <small><MapPin size={13} /> Pasig, Metro Manila</small>
      </div>
      <nav className="seller-sidebar-nav">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.label} href={item.href} className={activeItem === item.id ? "is-active" : ""} onClick={() => onNavigate(item.id)}>
              <Icon size={18} /> {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="seller-sidebar-actions">
        <button type="button" onClick={onLogout}><LogOut size={17} /> {t.logout}</button>
      </div>
    </aside>
  );
}

function BuyerViewContent({
  view,
  user,
  orders,
  recentOrders,
  deliveredOrders,
  products,
  cart,
  defaultAddress,
  reviewCount,
  memberSince,
  busy,
  t,
  cancelOrder,
}: {
  view: BuyerView;
  user: AuthUser;
  orders: Order[];
  recentOrders: Order[];
  deliveredOrders: Order[];
  products: Product[];
  cart: Cart;
  defaultAddress: Address | null;
  reviewCount: number;
  memberSince: string;
  busy: string | null;
  t: ReturnType<typeof useLocale>["copy"]["buyerPage"];
  cancelOrder: (orderId: string) => void;
}) {
  const [previewImage, setPreviewImage] = useState<{ src: string; alt: string } | null>(null);
  const profileHero = (
    <section className="buyer-profile-hero" id="profile">
      <div className="buyer-profile-avatar" aria-hidden="true">{initials(user.fullName)}</div>
      <div className="buyer-profile-copy">
        <h2>{user.fullName}</h2>
        <div className="buyer-verified-list">
          <span><MailCheck size={16} /> {user.email} <em>{t.verified}</em></span>
          <span><ShieldCheck size={16} /> {user.phone ?? t.phoneNotAdded} <em>{user.phone ? t.verified : t.pending}</em></span>
          <span><Leaf size={16} /> {memberSince}</span>
        </div>
      </div>
      <Link className="seller-button secondary buyer-edit-button" href="/settings">
        <UserRound size={18} /> {t.editProfile}
      </Link>
    </section>
  );

  if (view === "profile") {
    return (
      <>
        {profileHero}
        <section className="buyer-dashboard-grid compact">
          <article className="seller-panel">
            <div className="seller-panel-head"><span><MailCheck size={20} /> {t.emailVerification}</span><small>{t.verified}</small></div>
            <div className="buyer-verification-card">
              <CheckCircle2 size={34} />
              <div><strong>{t.emailReadyTitle}</strong><p>{t.emailReadyBody.replace("{email}", user.email)}</p></div>
            </div>
          </article>
          <article className="seller-panel">
            <div className="seller-panel-head"><span><UserRound size={20} /> {t.accountDetails}</span><Link href="/settings">{t.edit}</Link></div>
            <div className="buyer-address-card">
              <strong>{user.fullName}</strong>
              <p>{user.email}</p>
              <small>{user.phone ?? t.noPhoneAdded}</small>
            </div>
          </article>
        </section>
      </>
    );
  }

  if (view === "addresses") {
    return (
      <section className="seller-panel wide" id="addresses">
        <div className="seller-panel-head"><span><MapPin size={20} /> {t.addresses}</span><Link href="/settings">{t.manageAddresses}</Link></div>
        {defaultAddress ? (
          <div className="buyer-address-card">
            <span className="buyer-badge">{defaultAddress.label ?? t.default}</span>
            <strong>{defaultAddress.recipientName}</strong>
            <p>{[defaultAddress.street, defaultAddress.barangay, defaultAddress.city, defaultAddress.province, defaultAddress.postalCode].filter(Boolean).join(", ")}</p>
            <small>{defaultAddress.phone}</small>
          </div>
        ) : (
          <EmptyBlock icon={MapPin} title={t.noAddressTitle} body={t.noAddressBody} actionHref="/settings" actionLabel={t.addAddress} />
        )}
      </section>
    );
  }

  if (view === "orders") {
    return (
      <section className="seller-panel wide buyer-all-orders-panel" id="orders">
        <div className="seller-panel-head"><span><ClipboardList size={20} /> {t.myOrders}</span><small>{t.orderCount.replace("{count}", String(orders.length))}</small></div>
        <OrderList orders={orders} busy={busy} emptyText={t.emptyOrders} cancelLabel={t.cancelOrder} onCancel={cancelOrder} />
      </section>
    );
  }

  if (view === "wishlist") {
    return (
      <>
        <section className="seller-panel wide buyer-all-orders-panel buyer-cart-panel" id="cart">
          <div className="seller-panel-head">
            <span><ShoppingCart size={20} /> {t.wishlist}</span>
            <small>{t.basketSummary.replace("{count}", String(cart.items.length)).replace("{total}", money(cart.items.reduce((sum, item) => sum + Number(item.variant.price) * item.quantity, 0)))}</small>
          </div>
          {cart.items.length ? (
            <>
              <div className="seller-order-list buyer-cart-list">
                {cart.items.map((item) => {
                  const imageSrc = cartProductImage(item);
                  return (
                  <article className="seller-order-card buyer-cart-card" key={item.id}>
                    <div className="seller-order-top">
                      <div className="buyer-cart-product-summary">
                        <button
                          type="button"
                          className="buyer-cart-thumb-button"
                          onClick={() => setPreviewImage({ src: imageSrc, alt: item.variant.product.name })}
                          aria-label={`View ${item.variant.product.name} image`}
                        >
                          <img src={imageSrc} alt={item.variant.product.name} />
                        </button>
                        <span>
                          <strong>{item.variant.product.name}</strong>
                          <small>{item.variant.store.name} - {item.variant.name}</small>
                        </span>
                      </div>
                      <span>{money(Number(item.variant.price) * item.quantity)}</span>
                    </div>
                    <div className="seller-order-body">
                      <p>{item.quantity} item{item.quantity === 1 ? "" : "s"} - {money(item.variant.price)} each</p>
                    </div>
                  </article>
                  );
                })}
              </div>
              <div className="buyer-cart-reserve-bar">
                <div>
                  <small>{cart.items.reduce((sum, item) => sum + item.quantity, 0)} total item{cart.items.reduce((sum, item) => sum + item.quantity, 0) === 1 ? "" : "s"}</small>
                  <strong>{money(cart.items.reduce((sum, item) => sum + Number(item.variant.price) * item.quantity, 0))}</strong>
                  <span>Choose your pickup schedule on the next page.</span>
                </div>
                <Link href="/buyer/checkout" onClick={() => sessionStorage.removeItem("agrifarm_buy_now_checkout")}>
                  <CalendarCheck2 size={19} /> Reserve now
                </Link>
              </div>
            </>
          ) : (
            <EmptyBlock icon={ShoppingCart} title={t.emptyWishlistTitle} body={t.emptyWishlistBody} actionHref="/marketplace" actionLabel={t.browseMarketplace} />
          )}
        </section>
        {previewImage ? (
          <div className="buyer-image-modal" role="dialog" aria-modal="true" aria-label={previewImage.alt}>
            <button className="buyer-image-modal-backdrop" type="button" onClick={() => setPreviewImage(null)} aria-label="Close image preview" />
            <div className="buyer-image-modal-panel">
              <button className="buyer-image-modal-close" type="button" onClick={() => setPreviewImage(null)} aria-label="Close image preview">
                <X size={20} />
              </button>
              <img src={previewImage.src} alt={previewImage.alt} />
              <strong>{previewImage.alt}</strong>
            </div>
          </div>
        ) : null}
      </>
    );
  }
  if (view === "reviews") return <EmptyBlock icon={Star} title={t.reviewsSoonTitle} body={t.reviewsSoonBody.replace("{count}", String(reviewCount))} />;
  if (view === "payment") return <EmptyBlock icon={ShoppingCart} title={t.paymentMethods} body={t.paymentBody} />;
  if (view === "settings") return <EmptyBlock icon={Settings} title={t.accountSettings} body={t.settingsBody} actionHref="/settings" actionLabel={t.openSettings} />;

  return (
    <>
      {profileHero}
      <section className="seller-metrics buyer-metrics" aria-label="Buyer statistics">
        {[
          { label: t.totalOrders, value: orders.length, note: t.lifetimeSpend.replace("{total}", money(orders.reduce((sum, order) => sum + Number(order.grandTotal), 0))), icon: ClipboardList },
          { label: t.deliveredOrders, value: deliveredOrders.length, note: t.completedDeliveries, icon: PackageCheck },
          { label: t.availablePicks, value: products.length, note: t.freshProductsInMarketplace, icon: Leaf },
        ].map((metric) => {
          const Icon = metric.icon;
          return <article className="seller-metric-card" key={metric.label}><span><Icon size={22} /></span><strong>{metric.value}</strong><p>{metric.label}</p><small>{metric.note}</small></article>;
        })}
      </section>
      <section className="buyer-dashboard-grid buyer-overview-grid compact">
        <article className="seller-panel buyer-orders-card">
          <div className="seller-panel-head"><span><ClipboardList size={20} /> {t.recentOrders}</span><Link href="/buyer/orders">{t.viewAll} <ChevronRight size={15} /></Link></div>
          <div className="buyer-order-list">{recentOrders.length ? recentOrders.slice(0, 3).map((order) => <RecentOrder key={order.id} order={order} t={t} />) : <EmptyBlock icon={ClipboardList} title={t.noOrdersTitle} body={t.emptyOrders} />}</div>
        </article>
      </section>
    </>
  );
}

function OrderList({ orders, busy, emptyText, cancelLabel, onCancel }: { orders: Order[]; busy: string | null; emptyText: string; cancelLabel: string; onCancel: (orderId: string) => void }) {
  if (!orders.length) return <p className="seller-muted">{emptyText}</p>;
  return (
    <div className="seller-order-list">
      {orders.map((order) => (
        <article className={`seller-order-card buyer-reservation-card is-${order.status.toLowerCase()}`} key={order.id}>
          <div className="seller-order-top buyer-reservation-top">
            <div><small>Reservation {order.orderNumber}</small><strong>{order.pickupScheduledAt ? dateTime(order.pickupScheduledAt) : "Pickup schedule pending"}</strong></div>
            <em className={`buyer-status is-${order.status.toLowerCase()}`}>{statusLabel(order.status)}</em>
          </div>
          <div className="seller-order-body">
            <div className="buyer-reservation-products">
              {order.sellerOrders.flatMap((part) => part.items.map((item) => <div key={item.id}>
                <span><strong>{item.productName}</strong><small>{part.store.name} · {item.variantName}</small></span>
                <span>{item.quantity} {item.unit}</span>
                <strong>{money(item.subtotal)}</strong>
              </div>))}
            </div>
            {order.pickupScheduledAt ? <div className="buyer-reservation-details">
              <span><small>Order total</small><strong>{money(order.grandTotal)}</strong></span>
              <span><small>GCash deposit</small><strong>{money(order.depositAmount)} · {statusLabel(order.paymentStatus ?? "PENDING")}</strong></span>
              <span><small>Bring on pickup</small><strong>{money(order.remainingBalance)} cash</strong></span>
            </div> : null}
          </div>
          {["PENDING_PAYMENT", "RESERVED"].includes(order.status) ? <div className="buyer-reservation-actions">
            <p>{order.status === "RESERVED" ? "Your produce is being held for the pickup time above." : "Complete the GCash deposit to confirm this reservation."}</p>
            <button className="seller-button secondary compact" disabled={busy === order.id} onClick={() => {
              if (window.confirm("Cancel this reservation? Reserved produce will be released back to the seller.")) onCancel(order.id);
            }}>{busy === order.id ? "Cancelling..." : cancelLabel}</button>
          </div> : null}
        </article>
      ))}
    </div>
  );
}

function RecentOrder({ order, t }: { order: Order; t: ReturnType<typeof useLocale>["copy"]["buyerPage"] }) {
  const firstPart = order.sellerOrders[0];
  const firstItem = firstPart?.items[0];
  return (
    <article className="buyer-recent-order">
      <div className="buyer-order-thumb"><Leaf size={24} /></div>
      <div>
        <strong>{firstItem?.productName ?? order.orderNumber}</strong>
        <small>{firstPart?.store.name ?? t.localGarden} - {date(order.createdAt)}</small>
      </div>
      <span>{money(order.grandTotal)}</span>
      <em className={`buyer-status is-${order.status.toLowerCase()}`}>{statusLabel(order.status)}</em>
    </article>
  );
}

function EmptyBlock({ icon: Icon, title, body, actionHref, actionLabel }: { icon: LucideIcon; title: string; body: string; actionHref?: string; actionLabel?: string }) {
  return (
    <div className="buyer-empty-block">
      <Icon size={30} />
      <strong>{title}</strong>
      <p>{body}</p>
      {actionHref && actionLabel ? <Link href={actionHref} className="seller-button secondary compact">{actionLabel}</Link> : null}
    </div>
  );
}

function DashboardSkeleton({ t }: { t: ReturnType<typeof useLocale>["copy"]["buyerPage"] }) {
  return (
    <div className="buyer-skeleton-wrap" aria-label={t.loading}>
      <div className="buyer-skeleton hero" />
      <div className="buyer-skeleton-row">
        <div className="buyer-skeleton" />
        <div className="buyer-skeleton" />
        <div className="buyer-skeleton" />
        <div className="buyer-skeleton" />
      </div>
      <div className="buyer-skeleton-grid">
        <div className="buyer-skeleton tall" />
        <div className="buyer-skeleton tall" />
      </div>
    </div>
  );
}
