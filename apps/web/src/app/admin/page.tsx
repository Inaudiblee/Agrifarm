"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useCallback, useEffect, useState } from "react";
import {
  ClipboardList,
  Home,
  Languages,
  Leaf,
  Loader2,
  LogOut,
  RefreshCw,
  ScrollText,
  ShieldCheck,
  Store,
  Users,
} from "lucide-react";
import { AccountMenu } from "@/components/account-menu";
import { useLocale } from "@/components/locale-provider";
import { useToast } from "@/components/toast-provider";
import { getApiBase, parseApiError } from "@/lib/api";
import { clearAuthSession, getAuthToken, getAuthUser, type AuthUser } from "@/lib/auth-storage";

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

const money = (value: string | number) =>
  new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(Number(value));
const date = (value: string) =>
  new Intl.DateTimeFormat("en-PH", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
const fill = (template: string, values: Record<string, string | number>) =>
  Object.entries(values).reduce((text, [key, value]) => text.replaceAll(`{${key}}`, String(value)), template);

export default function AdminPage() {
  const router = useRouter();
  const { copy } = useLocale();
  const t = copy.adminPage;
  const common = copy.common;
  const { showToast } = useToast();
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

  if (loading) {
    return (
      <div className="seller-shell">
        <AdminSidebar user={user} t={t} common={common} onRefresh={load} onLogout={logout} />
        <main className="seller-loading">
          <Loader2 className="seller-spin" /> {t.loading}
        </main>
      </div>
    );
  }

  if (!user || user.role !== "ADMIN") {
    return (
      <div className="seller-shell">
        <AdminSidebar user={user} t={t} common={common} onRefresh={load} onLogout={logout} />
        <main className="seller-empty-state">
          <ShieldCheck size={42} />
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
      <AdminSidebar user={user} t={t} common={common} onRefresh={load} onLogout={logout} />
      <main className="seller-main" id="overview">
        <section className="seller-hero">
          <div>
            <span className="seller-eyebrow">
              <ShieldCheck size={18} /> {t.eyebrow}
            </span>
            <h1>{t.heroTitle}</h1>
            <p>{t.heroBody}</p>
          </div>
          <AccountMenu user={user} accountLabel={t.account} dashboardHref="/admin" settingsHref="/settings" compact />
        </section>

        {error ? <div className="seller-alert">{error}</div> : null}

        <section className="seller-metrics">
          <article className="seller-metric-card">
            <span>
              <Users size={22} />
            </span>
            <strong>{users.length}</strong>
            <p>{t.users}</p>
            <small>{fill(t.active, { count: users.filter((item) => item.status === "ACTIVE").length })}</small>
          </article>
          <article className="seller-metric-card">
            <span>
              <Store size={22} />
            </span>
            <strong>{stores.length}</strong>
            <p>{t.stores}</p>
            <small>{fill(t.active, { count: stores.filter((item) => item.status === "ACTIVE").length })}</small>
          </article>
          <article className="seller-metric-card">
            <span>
              <ClipboardList size={22} />
            </span>
            <strong>{orders.length}</strong>
            <p>{t.orders}</p>
            <small>{fill(t.value, { value: money(orders.reduce((sum, item) => sum + Number(item.grandTotal), 0)) })}</small>
          </article>
          <article className="seller-metric-card">
            <span>
              <ScrollText size={22} />
            </span>
            <strong>{logs.length}</strong>
            <p>{t.auditTrail}</p>
            <small>{t.latestActivity}</small>
          </article>
        </section>

        <section className="seller-grid">
          <article className="seller-panel" id="users">
            <div className="seller-panel-head">
              <span>
                <Users size={20} /> {t.userManagement}
              </span>
              <small>{fill(t.accountCount, { count: users.length })}</small>
            </div>
            <div className="seller-table-list">
              {users.map((item) => (
                <div className="seller-product-row" key={item.id}>
                  <div>
                    <strong>{item.fullName}</strong>
                    <small>
                      {item.email} - {item.role}
                    </small>
                  </div>
                  <select
                    className="role-status-select"
                    aria-label={`Status for ${item.fullName}`}
                    value={item.status}
                    disabled={busy === item.id || item.id === user.id}
                    onChange={(event) => update(`/api/admin/users/${item.id}/status`, event.target.value, item.id)}
                  >
                    <option>ACTIVE</option>
                    <option>SUSPENDED</option>
                    <option>DELETED</option>
                  </select>
                </div>
              ))}
            </div>
          </article>

          <article className="seller-panel" id="stores">
            <div className="seller-panel-head">
              <span>
                <Store size={20} /> {t.storeModeration}
              </span>
              <small>{fill(t.storeCount, { count: stores.length })}</small>
            </div>
            <div className="seller-table-list">
              {stores.map((store) => (
                <div className="seller-product-row" key={store.id}>
                  <div>
                    <strong>{store.name}</strong>
                    <small>
                      {store.sellerProfile.user.fullName} - {store.sellerProfile.user.email}
                    </small>
                  </div>
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
              ))}
            </div>
          </article>
        </section>

        <section className="seller-panel wide" id="orders">
          <div className="seller-panel-head">
            <span>
              <ClipboardList size={20} /> {t.marketplaceOrders}
            </span>
            <small>{fill(t.orderCount, { count: orders.length })}</small>
          </div>
          <div className="seller-order-list">
            {orders.map((order) => (
              <article className="seller-order-card" key={order.id}>
                <div className="seller-order-top">
                  <div>
                    <strong>{order.orderNumber}</strong>
                    <small>
                      {order.buyer.fullName} - {date(order.createdAt)} - {order.status}
                    </small>
                  </div>
                  <span>{money(order.grandTotal)}</span>
                </div>
                <div className="seller-order-body">
                  <p>{order.sellerOrders.map((part) => part.store.name).join(", ")}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="seller-panel wide" id="translations">
          <div className="seller-panel-head">
            <span>
              <Languages size={20} /> Language editor
            </span>
            <small>{fill(t.developerKeys, { count: translations.length })}</small>
          </div>
          <p className="seller-muted">
            {t.languageHelp}
          </p>
          <div className="translation-editor-list">
            {translations.map((row) => (
              <TranslationEditor key={row.key} row={row} busy={busy} labels={t} common={common} onSave={updateTranslation} />
            ))}
          </div>
        </section>

        <section className="seller-panel wide" id="audit">
          <div className="seller-panel-head">
            <span>
              <ScrollText size={20} /> {t.auditTrail}
            </span>
            <small>{fill(t.latest, { count: logs.length })}</small>
          </div>
          <div className="seller-table-list">
            {logs.map((log) => (
              <div className="seller-product-row" key={log.id}>
                <div>
                  <strong>
                    {log.action} - {log.entityType}
                  </strong>
                  <small>
                    {log.actor?.fullName ?? t.system} - {date(log.createdAt)}
                  </small>
                </div>
                <span className="role-id">{log.entityId ?? "-"}</span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
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

function AdminSidebar({
  user,
  t,
  common,
  onRefresh,
  onLogout,
}: {
  user: AuthUser | null;
  t: ReturnType<typeof useLocale>["copy"]["adminPage"];
  common: ReturnType<typeof useLocale>["copy"]["common"];
  onRefresh: () => void;
  onLogout: () => void;
}) {
  return (
    <aside className="seller-sidebar">
      <Link href="/" className="seller-sidebar-brand">
        <span className="seller-brand-mark">
          <ShieldCheck size={22} />
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
        <a href="#users">
          <Users size={18} /> {t.users}
        </a>
        <a href="#stores">
          <Store size={18} /> {t.stores}
        </a>
        <a href="#orders">
          <ClipboardList size={18} /> {t.orders}
        </a>
        <a href="#translations">
          <Languages size={18} /> {t.language}
        </a>
        <a href="#audit">
          <ScrollText size={18} /> {t.auditTrail}
        </a>
      </nav>
      <div className="seller-sidebar-actions">
        <button onClick={onRefresh}>
          <RefreshCw size={17} /> {common.refresh}
        </button>
        <Link href="/">
          <Leaf size={17} /> {common.landingPage}
        </Link>
        <button onClick={onLogout}>
          <LogOut size={17} /> {common.signOut}
        </button>
      </div>
      <div className="seller-sidebar-user">
        <span>{user?.fullName?.[0] ?? "A"}</span>
        <div>
          <strong>{user?.fullName ?? t.account}</strong>
          <small>{user?.email ?? t.account}</small>
        </div>
      </div>
    </aside>
  );
}
