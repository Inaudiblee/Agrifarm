"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Home,
  Languages,
  Loader2,
  LogOut,
  Menu,
  Moon,
  RefreshCw,
  ScrollText,
  Search,
  ShieldCheck,
  Sprout,
  Store,
  Sun,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { AccountMenu } from "@/components/account-menu";
import { AdminForecastWorkspace } from "@/components/admin/AdminForecastWorkspace";
import { LanguageSwitch } from "@/components/language-switch";
import { useLocale } from "@/components/locale-provider";
import { useTheme } from "@/components/theme-provider";
import { useToast } from "@/components/toast-provider";
import { getApiBase, parseApiError } from "@/lib/api";
import { clearAuthSession, getAuthToken, getAuthUser, type AuthUser } from "@/lib/auth-storage";
import { AGRIFARM_LOGO_SRC } from "@/lib/brand-assets";

type AdminUser = { id: string; email: string; fullName: string; role: string; status: string; createdAt: string };
type AdminStore = {
  id: string;
  name: string;
  status: string;
  createdAt: string;
  sellerProfile: { user: { fullName: string; email: string } };
};
type AdminOrder = {
  id: string;
  orderNumber: string;
  status: string;
  grandTotal: string | number;
  createdAt: string;
  buyer: { fullName: string; email: string };
  sellerOrders: Array<{ id: string; store: { name: string } }>;
};
type AuditLog = {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  createdAt: string;
  actor: { fullName: string; email: string } | null;
};
type TranslationLocaleValue = {
  defaultValue: string;
  value: string;
  isOverridden: boolean;
  updatedAt: string | null;
};
type TranslationRow = {
  key: string;
  label: string;
  values: Record<"en" | "fil", TranslationLocaleValue>;
};

type AdminSection = "overview" | "users" | "stores" | "orders" | "forecast" | "translations" | "audit";

const PAGE_SIZE = {
  users: 5,
  stores: 6,
  orders: 5,
  translations: 2,
  audit: 6,
} as const;

const money = (value: string | number) =>
  new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(Number(value));
const date = (value: string) =>
  new Intl.DateTimeFormat("en-PH", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
const fill = (template: string, values: Record<string, string | number>) =>
  Object.entries(values).reduce((text, [key, value]) => text.replaceAll(`{${key}}`, String(value)), template);

function matchesQuery(haystack: string, query: string) {
  if (!query.trim()) return true;
  return haystack.toLowerCase().includes(query.trim().toLowerCase());
}

function paginate<T>(items: T[], page: number, pageSize: number) {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    page: safePage,
    totalPages,
    total: items.length,
  };
}

function AdminTopNav({
  user,
  t,
  theme,
  onToggleTheme,
  aboutUsLabel,
  searchValue,
  onSearchChange,
  searchPlaceholder,
}: {
  user: AuthUser | null;
  t: ReturnType<typeof useLocale>["copy"]["adminPage"];
  theme: "day" | "night";
  onToggleTheme: () => void;
  aboutUsLabel: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
}) {
  return (
    <header className="buyer-top-nav">
      <Link href="/" className="buyer-top-brand" aria-label="AgriFarm home">
        <span className="buyer-brand-mark">
          <img src={AGRIFARM_LOGO_SRC} alt="" aria-hidden="true" />
        </span>
        <strong>AgriFarm</strong>
        <small>{t.center}</small>
      </Link>
      <label className="buyer-top-search">
        <input
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={searchPlaceholder}
          aria-label={searchPlaceholder}
        />
        <Search size={20} />
      </label>
      <nav aria-label="Admin quick links">
        <Link href="/">Home</Link>
        <Link href="/marketplace">Marketplace</Link>
        <Link href="/pasig">{aboutUsLabel}</Link>
      </nav>
      <div className="buyer-top-actions">
        <LanguageSwitch compact />
        <button
          type="button"
          className="buyer-theme-toggle"
          onClick={onToggleTheme}
          aria-label={theme === "night" ? "Switch to day mode" : "Switch to night mode"}
        >
          {theme === "night" ? <Sun size={19} /> : <Moon size={19} />}
        </button>
        <AccountMenu
          user={user ?? { id: "", email: "", fullName: t.account, phone: null, role: "ADMIN", status: "ACTIVE" }}
          accountLabel={t.account}
          dashboardHref="/admin"
          settingsHref="/settings"
          compact
        />
      </div>
    </header>
  );
}

function AdminMobileBar({
  onMenu,
  user,
  t,
  theme,
  onToggleTheme,
}: {
  onMenu: () => void;
  user: AuthUser | null;
  t: ReturnType<typeof useLocale>["copy"]["adminPage"];
  theme: "day" | "night";
  onToggleTheme: () => void;
}) {
  return (
    <div className="buyer-mobile-bar">
      <button type="button" onClick={onMenu} aria-label="Open admin navigation">
        <Menu size={22} />
      </button>
      <strong>{t.center}</strong>
      <div className="buyer-mobile-actions">
        <LanguageSwitch compact />
        <button
          type="button"
          className="buyer-theme-toggle"
          onClick={onToggleTheme}
          aria-label={theme === "night" ? "Switch to day" : "Switch to night"}
        >
          {theme === "night" ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
      <span>{user?.fullName?.slice(0, 1) ?? "A"}</span>
    </div>
  );
}

function AdminDrawer({ open, onClose, children }: { open: boolean; onClose: () => void; children: ReactNode }) {
  return (
    <div className={`buyer-drawer${open ? " is-open" : ""}`} aria-hidden={!open}>
      <button className="buyer-drawer-backdrop" type="button" onClick={onClose} aria-label="Close admin navigation" />
      <div className="buyer-drawer-panel" role="dialog" aria-modal="true" aria-label="Admin navigation">
        <button className="buyer-drawer-close" type="button" onClick={onClose} aria-label="Close admin navigation">
          <X size={20} />
        </button>
        {children}
      </div>
    </div>
  );
}

function AdminSidebar({
  user,
  t,
  common,
  activeItem,
  onRefresh,
  onLogout,
  onNavigate,
}: {
  user: AuthUser | null;
  t: ReturnType<typeof useLocale>["copy"]["adminPage"];
  common: ReturnType<typeof useLocale>["copy"]["common"];
  activeItem: AdminSection;
  onRefresh: () => void;
  onLogout: () => void;
  onNavigate: (itemId: AdminSection) => void;
}) {
  const items: Array<{ id: AdminSection; label: string; icon: typeof Home }> = [
    { id: "overview", label: t.overview, icon: Home },
    { id: "users", label: t.users, icon: Users },
    { id: "stores", label: t.stores, icon: Store },
    { id: "orders", label: t.orders, icon: ClipboardList },
    { id: "forecast", label: t.forecast, icon: Sprout },
    { id: "translations", label: t.language, icon: Languages },
    { id: "audit", label: t.auditTrail, icon: ScrollText },
  ];

  return (
    <aside className="seller-sidebar buyer-sidebar admin-sidebar" aria-label="Admin navigation">
      <Link href="/" className="seller-sidebar-brand" aria-label="AgriFarm landing page" onClick={() => onNavigate("overview")}>
        <span className="seller-brand-mark">
          <img src={AGRIFARM_LOGO_SRC} alt="" aria-hidden="true" />
        </span>
        <span>
          <small>{t.center}</small>
          <strong>AgriFarm</strong>
        </span>
      </Link>

      <div className="buyer-sidebar-profile">
        <span>{user?.fullName?.slice(0, 1) ?? "A"}</span>
        <div>
          <strong>{user?.fullName ?? t.account}</strong>
          <em>{t.account}</em>
          <small>
            <ShieldCheck size={13} /> {t.eyebrow}
          </small>
        </div>
      </div>

      <nav className="seller-sidebar-nav">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={activeItem === item.id ? "is-active" : ""}
              onClick={(event) => {
                event.preventDefault();
                onNavigate(item.id);
              }}
            >
              <Icon size={18} /> {item.label}
            </a>
          );
        })}
      </nav>

      <div className="seller-sidebar-actions">
        <button type="button" onClick={onRefresh}>
          <RefreshCw size={17} /> {common.refresh}
        </button>
        <button type="button" onClick={onLogout}>
          <LogOut size={17} /> {common.signOut}
        </button>
      </div>
    </aside>
  );
}

function PaginationBar({
  page,
  totalPages,
  total,
  labels,
  onChange,
}: {
  page: number;
  totalPages: number;
  total: number;
  labels: ReturnType<typeof useLocale>["copy"]["adminPage"];
  onChange: (page: number) => void;
}) {
  if (total === 0) return null;

  return (
    <div className="admin-pagination" role="navigation" aria-label="Pagination">
      <small>{fill(labels.pageOf, { page, pages: totalPages, total })}</small>
      <div className="admin-pagination-controls">
        <button type="button" className="seller-button secondary compact" disabled={page <= 1} onClick={() => onChange(page - 1)}>
          <ChevronLeft size={16} /> {labels.previous}
        </button>
        <button
          type="button"
          className="seller-button secondary compact"
          disabled={page >= totalPages}
          onClick={() => onChange(page + 1)}
        >
          {labels.next} <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

function EmptyBlock({ message }: { message: string }) {
  return (
    <div className="admin-empty-block">
      <p>{message}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  return <em className={`admin-status-badge status-${status.toLowerCase()}`}>{status}</em>;
}

export default function AdminPage() {
  const router = useRouter();
  const { copy } = useLocale();
  const t = copy.adminPage;
  const common = copy.common;
  const { showToast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stores, setStores] = useState<AdminStore[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [translations, setTranslations] = useState<TranslationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<AdminSection>("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [buyerPage, setBuyerPage] = useState(1);
  const [sellerPage, setSellerPage] = useState(1);
  const [storePage, setStorePage] = useState(1);
  const [orderPage, setOrderPage] = useState(1);
  const [translationPage, setTranslationPage] = useState(1);
  const [auditPage, setAuditPage] = useState(1);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  const api = useCallback(
    async <T,>(path: string, init: RequestInit = {}) => {
      const response = await fetch(`${getApiBase()}${path}`, {
        ...init,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          ...(init.headers ?? {}),
        },
      });
      if (!response.ok) throw new Error(await parseApiError(response));
      return response.json() as Promise<T>;
    },
    [token]
  );

  const load = useCallback(async () => {
    if (!token || user?.role !== "ADMIN") {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const [nextUsers, nextStores, nextOrders, nextLogs, nextTranslations] = await Promise.all([
        api<AdminUser[]>("/api/admin/users"),
        api<AdminStore[]>("/api/admin/stores"),
        api<AdminOrder[]>("/api/admin/orders"),
        api<AuditLog[]>("/api/admin/audit-logs"),
        api<TranslationRow[]>("/api/admin/translations"),
      ]);
      setUsers(nextUsers);
      setStores(nextStores);
      setOrders(nextOrders);
      setLogs(nextLogs);
      setTranslations(nextTranslations);
      setLastRefreshed(new Date());
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
    const media = window.matchMedia("(max-width: 900px)");
    const syncOverflow = () => {
      document.body.style.overflow = media.matches || drawerOpen ? (drawerOpen ? "hidden" : "") : "hidden";
    };
    syncOverflow();
    media.addEventListener("change", syncOverflow);
    return () => {
      media.removeEventListener("change", syncOverflow);
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  useEffect(() => {
    setSearchQuery("");
    setBuyerPage(1);
    setSellerPage(1);
    setStorePage(1);
    setOrderPage(1);
    setTranslationPage(1);
    setAuditPage(1);
  }, [activeSection]);

  useEffect(() => {
    setBuyerPage(1);
    setSellerPage(1);
    setStorePage(1);
    setOrderPage(1);
    setTranslationPage(1);
    setAuditPage(1);
  }, [searchQuery]);

  const marketplaceUsers = useMemo(() => users.filter((item) => item.role !== "ADMIN"), [users]);
  const allBuyers = useMemo(() => marketplaceUsers.filter((item) => item.role === "BUYER"), [marketplaceUsers]);
  const allSellers = useMemo(() => marketplaceUsers.filter((item) => item.role === "SELLER"), [marketplaceUsers]);
  const buyers = useMemo(
    () => allBuyers.filter((item) => matchesQuery(`${item.fullName} ${item.email} ${item.status}`, searchQuery)),
    [allBuyers, searchQuery]
  );
  const sellers = useMemo(
    () => allSellers.filter((item) => matchesQuery(`${item.fullName} ${item.email} ${item.status}`, searchQuery)),
    [allSellers, searchQuery]
  );
  const filteredStores = useMemo(
    () =>
      stores.filter((store) =>
        matchesQuery(
          `${store.name} ${store.status} ${store.sellerProfile.user.fullName} ${store.sellerProfile.user.email}`,
          searchQuery
        )
      ),
    [stores, searchQuery]
  );
  const filteredOrders = useMemo(
    () =>
      orders.filter((order) =>
        matchesQuery(
          `${order.orderNumber} ${order.status} ${order.buyer.fullName} ${order.buyer.email} ${order.sellerOrders
            .map((part) => part.store.name)
            .join(" ")}`,
          searchQuery
        )
      ),
    [orders, searchQuery]
  );
  const filteredTranslations = useMemo(
    () =>
      translations.filter((row) =>
        matchesQuery(`${row.key} ${row.label} ${row.values.en.value} ${row.values.fil.value}`, searchQuery)
      ),
    [translations, searchQuery]
  );
  const filteredLogs = useMemo(
    () =>
      logs.filter((log) =>
        matchesQuery(
          `${log.action} ${log.entityType} ${log.entityId ?? ""} ${log.actor?.fullName ?? ""} ${log.actor?.email ?? ""}`,
          searchQuery
        )
      ),
    [logs, searchQuery]
  );

  const buyerSlice = paginate(buyers, buyerPage, PAGE_SIZE.users);
  const sellerSlice = paginate(sellers, sellerPage, PAGE_SIZE.users);
  const storeSlice = paginate(filteredStores, storePage, PAGE_SIZE.stores);
  const orderSlice = paginate(filteredOrders, orderPage, PAGE_SIZE.orders);
  const translationSlice = paginate(filteredTranslations, translationPage, PAGE_SIZE.translations);
  const auditSlice = paginate(filteredLogs, auditPage, PAGE_SIZE.audit);

  const metrics = useMemo(() => {
    const activeBuyers = allBuyers.filter((item) => item.status === "ACTIVE").length;
    const activeSellers = allSellers.filter((item) => item.status === "ACTIVE").length;
    const activeStores = stores.filter((item) => item.status === "ACTIVE").length;
    const orderValue = orders.reduce((sum, item) => sum + Number(item.grandTotal), 0);
    return [
      {
        label: t.buyers,
        value: allBuyers.length,
        note: fill(t.active, { count: activeBuyers }),
        icon: UserRound,
      },
      {
        label: t.sellers,
        value: allSellers.length,
        note: fill(t.active, { count: activeSellers }),
        icon: Users,
      },
      {
        label: t.stores,
        value: stores.length,
        note: fill(t.active, { count: activeStores }),
        icon: Store,
      },
      {
        label: t.orders,
        value: orders.length,
        note: fill(t.value, { value: money(orderValue) }),
        icon: ClipboardList,
      },
    ];
  }, [allBuyers, allSellers, stores, orders, t]);

  async function update(path: string, status: string, key: string) {
    setBusy(key);
    try {
      await api(path, { method: "PATCH", body: JSON.stringify({ status }) });
      showToast({ type: "success", message: t.statusUpdated });
      await load();
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : t.updateFailed;
      setError(message);
      showToast({ type: "error", message });
    } finally {
      setBusy(null);
    }
  }

  async function updateTranslation(key: string, locale: "en" | "fil", value: string) {
    const busyKey = `${key}:${locale}`;
    setBusy(busyKey);
    try {
      await api(`/api/admin/translations/${encodeURIComponent(key)}`, {
        method: "PATCH",
        body: JSON.stringify({ locale, value }),
      });
      showToast({ type: "success", message: t.translationUpdated });
      await load();
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : t.translationFailed;
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

  const searchPlaceholder =
    activeSection === "users"
      ? t.searchUsers
      : activeSection === "stores"
        ? t.searchStores
        : activeSection === "orders"
          ? t.searchOrders
          : activeSection === "forecast"
            ? t.searchForecast
            : activeSection === "translations"
              ? t.searchLanguage
              : activeSection === "audit"
                ? t.searchAudit
                : t.searchOverview;

  const sidebar = (
    <AdminSidebar
      user={user}
      t={t}
      common={common}
      activeItem={activeSection}
      onRefresh={load}
      onLogout={logout}
      onNavigate={(sectionId) => {
        setActiveSection(sectionId);
        setDrawerOpen(false);
      }}
    />
  );

  const shell = (content: ReactNode) => (
    <div className="buyer-profile-page admin-fit-page" data-buyer-theme={theme}>
      <AdminTopNav
        user={user}
        t={t}
        theme={theme}
        onToggleTheme={toggleTheme}
        aboutUsLabel={copy.buyerPage.aboutUs}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder={searchPlaceholder}
      />
      <div className="seller-shell buyer-dashboard-shell admin-fit-shell">
        <div className="buyer-desktop-sidebar">{sidebar}</div>
        <main className="seller-main buyer-main admin-main admin-fit-main">
          <AdminMobileBar onMenu={() => setDrawerOpen(true)} user={user} t={t} theme={theme} onToggleTheme={toggleTheme} />
          {content}
        </main>
        <AdminDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
          {sidebar}
        </AdminDrawer>
      </div>
    </div>
  );

  if (loading) {
    return shell(
      <div className="seller-loading admin-loading">
        <Loader2 className="seller-spin" size={32} />
        <span>{t.loading}</span>
      </div>
    );
  }

  if (!user || user.role !== "ADMIN") {
    return shell(
      <div className="seller-empty-state admin-empty-state">
        <ShieldCheck size={42} />
        <h1>{t.accessTitle}</h1>
        <p>{t.accessBody}</p>
        <Link className="seller-button primary" href="/login">
          {t.accessCta}
        </Link>
      </div>
    );
  }

  return shell(
    <>
      {error ? (
        <div className="seller-alert" role="alert">
          {error}
        </div>
      ) : null}

      {activeSection === "overview" && (
        <div className="admin-section-view">
          <section className="seller-hero admin-hero">
            <div>
              <span className="seller-eyebrow">
                <ShieldCheck size={18} /> {t.eyebrow}
              </span>
              <h1>{t.heroTitle}</h1>
              <p>{t.heroBody}</p>
              {lastRefreshed ? (
                <small className="admin-refreshed">
                  {fill(t.lastRefreshed, { time: date(lastRefreshed.toISOString()) })}
                </small>
              ) : null}
            </div>
            <div className="seller-hero-actions">
              <button type="button" className="seller-button primary" onClick={() => setActiveSection("users")}>
                <Users size={18} /> {t.manageUsers}
              </button>
              <button type="button" className="seller-button secondary" onClick={() => void load()}>
                <RefreshCw size={18} /> {common.refresh}
              </button>
            </div>
          </section>

          <section className="seller-metrics admin-metrics" aria-label="Admin metrics">
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

          <section className="admin-overview-grid">
            <article className="seller-panel">
              <div className="seller-panel-head">
                <span>
                  <ScrollText size={20} /> {t.latestActivity}
                </span>
                <button type="button" className="admin-inline-link" onClick={() => setActiveSection("audit")}>
                  {t.viewAll}
                </button>
              </div>
              <div className="admin-fit-list">
                {logs.slice(0, 4).map((log) => (
                  <div className="seller-product-row" key={log.id}>
                    <div>
                      <strong>
                        {log.action} · {log.entityType}
                      </strong>
                      <small>
                        {log.actor?.fullName ?? t.system} · {date(log.createdAt)}
                      </small>
                    </div>
                    <StatusBadge status={log.entityType} />
                  </div>
                ))}
                {logs.length === 0 ? <EmptyBlock message={t.noActivity} /> : null}
              </div>
            </article>

            <article className="seller-panel">
              <div className="seller-panel-head">
                <span>
                  <ClipboardList size={20} /> {t.quickActions}
                </span>
                <small>{t.workspaceReady}</small>
              </div>
              <div className="admin-quick-actions">
                <button type="button" className="seller-button secondary" onClick={() => setActiveSection("stores")}>
                  <Store size={17} /> {t.storeModeration}
                </button>
                <button type="button" className="seller-button secondary" onClick={() => setActiveSection("orders")}>
                  <ClipboardList size={17} /> {t.marketplaceOrders}
                </button>
                <button type="button" className="seller-button secondary" onClick={() => setActiveSection("forecast")}>
                  <Sprout size={17} /> {t.forecast}
                </button>
                <button type="button" className="seller-button secondary" onClick={() => setActiveSection("translations")}>
                  <Languages size={17} /> {t.languageEditor}
                </button>
                <button type="button" className="seller-button secondary" onClick={() => setActiveSection("audit")}>
                  <ScrollText size={17} /> {t.auditTrail}
                </button>
              </div>
            </article>
          </section>
        </div>
      )}

      {activeSection === "users" && (
        <div className="admin-section-view">
          <section className="seller-panel admin-section-panel">
            <div className="seller-panel-head">
              <span>
                <Users size={20} /> {t.userManagement}
              </span>
              <small>{fill(t.accountCount, { count: marketplaceUsers.length })}</small>
            </div>
            <p className="seller-muted admin-section-help">{t.usersHelp}</p>
            <div className="admin-users-split">
              <div className="admin-user-column">
                <div className="admin-column-head">
                  <strong>
                    <UserRound size={16} /> {t.buyers}
                  </strong>
                  <small>{buyers.length}</small>
                </div>
                <div className="admin-fit-list">
                  {buyerSlice.items.map((item) => (
                    <div className="seller-product-row" key={item.id}>
                      <div>
                        <strong>{item.fullName}</strong>
                        <small>
                          {item.email} · {date(item.createdAt)}
                        </small>
                      </div>
                      <div className="admin-row-controls">
                        <StatusBadge status={item.status} />
                        <select
                          className="role-status-select"
                          aria-label={`Status for ${item.fullName}`}
                          value={item.status}
                          disabled={busy === item.id}
                          onChange={(event) => update(`/api/admin/users/${item.id}/status`, event.target.value, item.id)}
                        >
                          <option>ACTIVE</option>
                          <option>SUSPENDED</option>
                          <option>DELETED</option>
                        </select>
                      </div>
                    </div>
                  ))}
                  {buyerSlice.total === 0 ? <EmptyBlock message={t.noBuyers} /> : null}
                </div>
                <PaginationBar
                  page={buyerSlice.page}
                  totalPages={buyerSlice.totalPages}
                  total={buyerSlice.total}
                  labels={t}
                  onChange={setBuyerPage}
                />
              </div>

              <div className="admin-user-column">
                <div className="admin-column-head">
                  <strong>
                    <Store size={16} /> {t.sellers}
                  </strong>
                  <small>{sellers.length}</small>
                </div>
                <div className="admin-fit-list">
                  {sellerSlice.items.map((item) => (
                    <div className="seller-product-row" key={item.id}>
                      <div>
                        <strong>{item.fullName}</strong>
                        <small>
                          {item.email} · {date(item.createdAt)}
                        </small>
                      </div>
                      <div className="admin-row-controls">
                        <StatusBadge status={item.status} />
                        <select
                          className="role-status-select"
                          aria-label={`Status for ${item.fullName}`}
                          value={item.status}
                          disabled={busy === item.id}
                          onChange={(event) => update(`/api/admin/users/${item.id}/status`, event.target.value, item.id)}
                        >
                          <option>ACTIVE</option>
                          <option>SUSPENDED</option>
                          <option>DELETED</option>
                        </select>
                      </div>
                    </div>
                  ))}
                  {sellerSlice.total === 0 ? <EmptyBlock message={t.noSellers} /> : null}
                </div>
                <PaginationBar
                  page={sellerSlice.page}
                  totalPages={sellerSlice.totalPages}
                  total={sellerSlice.total}
                  labels={t}
                  onChange={setSellerPage}
                />
              </div>
            </div>
          </section>
        </div>
      )}

      {activeSection === "stores" && (
        <div className="admin-section-view">
          <section className="seller-panel admin-section-panel">
            <div className="seller-panel-head">
              <span>
                <Store size={20} /> {t.storeModeration}
              </span>
              <small>{fill(t.storeCount, { count: filteredStores.length })}</small>
            </div>
            <div className="admin-fit-list is-tall">
              {storeSlice.items.map((store) => (
                <div className="seller-product-row" key={store.id}>
                  <div>
                    <strong>{store.name}</strong>
                    <small>
                      {store.sellerProfile.user.fullName} · {store.sellerProfile.user.email} · {date(store.createdAt)}
                    </small>
                  </div>
                  <div className="admin-row-controls">
                    <StatusBadge status={store.status} />
                    <select
                      className="role-status-select"
                      aria-label={`Status for ${store.name}`}
                      value={store.status}
                      disabled={busy === store.id}
                      onChange={(event) => update(`/api/admin/stores/${store.id}/status`, event.target.value, store.id)}
                    >
                      <option>DRAFT</option>
                      <option>PENDING_REVIEW</option>
                      <option>ACTIVE</option>
                      <option>SUSPENDED</option>
                      <option>CLOSED</option>
                    </select>
                  </div>
                </div>
              ))}
              {storeSlice.total === 0 ? <EmptyBlock message={t.noStores} /> : null}
            </div>
            <PaginationBar
              page={storeSlice.page}
              totalPages={storeSlice.totalPages}
              total={storeSlice.total}
              labels={t}
              onChange={setStorePage}
            />
          </section>
        </div>
      )}

      {activeSection === "orders" && (
        <div className="admin-section-view">
          <section className="seller-panel admin-section-panel">
            <div className="seller-panel-head">
              <span>
                <ClipboardList size={20} /> {t.marketplaceOrders}
              </span>
              <small>{fill(t.orderCount, { count: filteredOrders.length })}</small>
            </div>
            <div className="admin-fit-list is-tall">
              {orderSlice.items.map((order) => (
                <article className="seller-order-card" key={order.id}>
                  <div className="seller-order-top">
                    <div>
                      <strong>{order.orderNumber}</strong>
                      <small>
                        {order.buyer.fullName} · {date(order.createdAt)}
                      </small>
                    </div>
                    <div className="admin-order-meta">
                      <StatusBadge status={order.status} />
                      <span>{money(order.grandTotal)}</span>
                    </div>
                  </div>
                  <div className="seller-order-body">
                    <p>{order.sellerOrders.map((part) => part.store.name).join(", ") || t.noStoreLinked}</p>
                  </div>
                </article>
              ))}
              {orderSlice.total === 0 ? <EmptyBlock message={t.noOrders} /> : null}
            </div>
            <PaginationBar
              page={orderSlice.page}
              totalPages={orderSlice.totalPages}
              total={orderSlice.total}
              labels={t}
              onChange={setOrderPage}
            />
          </section>
        </div>
      )}

      {activeSection === "forecast" && (
        <div className="admin-section-view is-forecast">
          <AdminForecastWorkspace token={token} />
        </div>
      )}

      {activeSection === "translations" && (
        <div className="admin-section-view">
          <section className="seller-panel admin-section-panel">
            <div className="seller-panel-head">
              <span>
                <Languages size={20} /> {t.languageEditor}
              </span>
              <small>{fill(t.developerKeys, { count: filteredTranslations.length })}</small>
            </div>
            <p className="seller-muted admin-section-help">{t.languageHelp}</p>
            <div className="admin-fit-list is-tall translation-editor-list">
              {translationSlice.items.map((row) => (
                <TranslationEditor key={row.key} row={row} busy={busy} labels={t} common={common} onSave={updateTranslation} />
              ))}
              {translationSlice.total === 0 ? <EmptyBlock message={t.noTranslations} /> : null}
            </div>
            <PaginationBar
              page={translationSlice.page}
              totalPages={translationSlice.totalPages}
              total={translationSlice.total}
              labels={t}
              onChange={setTranslationPage}
            />
          </section>
        </div>
      )}

      {activeSection === "audit" && (
        <div className="admin-section-view">
          <section className="seller-panel admin-section-panel">
            <div className="seller-panel-head">
              <span>
                <ScrollText size={20} /> {t.auditTrail}
              </span>
              <small>{fill(t.latest, { count: filteredLogs.length })}</small>
            </div>
            <div className="admin-fit-list is-tall">
              {auditSlice.items.map((log) => (
                <div className="seller-product-row" key={log.id}>
                  <div>
                    <strong>
                      {log.action} · {log.entityType}
                    </strong>
                    <small>
                      {log.actor?.fullName ?? t.system} · {date(log.createdAt)}
                    </small>
                  </div>
                  <span className="role-id">{log.entityId ?? "-"}</span>
                </div>
              ))}
              {auditSlice.total === 0 ? <EmptyBlock message={t.noActivity} /> : null}
            </div>
            <PaginationBar
              page={auditSlice.page}
              totalPages={auditSlice.totalPages}
              total={auditSlice.total}
              labels={t}
              onChange={setAuditPage}
            />
          </section>
        </div>
      )}
    </>
  );
}

function TranslationEditor({
  row,
  busy,
  labels,
  common,
  onSave,
}: {
  row: TranslationRow;
  busy: string | null;
  labels: ReturnType<typeof useLocale>["copy"]["adminPage"];
  common: ReturnType<typeof useLocale>["copy"]["common"];
  onSave: (key: string, locale: "en" | "fil", value: string) => void;
}) {
  function submit(locale: "en" | "fil", event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = new FormData(event.currentTarget).get("value");
    if (typeof value === "string") onSave(row.key, locale, value);
  }

  return (
    <article className="translation-editor-card">
      <div className="translation-editor-meta">
        <strong>{row.label}</strong>
        <code>{row.key}</code>
      </div>
      <div className="translation-editor-fields">
        {(["en", "fil"] as const).map((locale) => (
          <form key={locale} onSubmit={(event) => submit(locale, event)}>
            <label>
              <span>{locale === "en" ? labels.english : labels.filipino}</span>
              <textarea name="value" defaultValue={row.values[locale].value} rows={2} />
            </label>
            <small>{row.values[locale].isOverridden ? labels.adminOverride : labels.developerDefault}</small>
            <button className="seller-button" type="submit" disabled={busy === `${row.key}:${locale}`}>
              {busy === `${row.key}:${locale}` ? common.saving : common.save}
            </button>
          </form>
        ))}
      </div>
    </article>
  );
}
