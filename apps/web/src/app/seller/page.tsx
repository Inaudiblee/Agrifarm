"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  ClipboardList,
  Home,
  Leaf,
  LogOut,
  Loader2,
  MapPin,
  Menu,
  Moon,
  PackagePlus,
  PhilippinePeso,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  ShoppingBag,
  Store,
  Sun,
  Truck,
  X,
} from "lucide-react";
import { AccountMenu } from "@/components/account-menu";
import { LanguageSwitch } from "@/components/language-switch";
import { useLocale } from "@/components/locale-provider";
import { useToast } from "@/components/toast-provider";
import { useTheme } from "@/components/theme-provider";
import { getApiBase, parseApiError, resolveMediaUrl } from "@/lib/api";
import { clearAuthSession, getAuthToken, getAuthUser, type AuthUser } from "@/lib/auth-storage";
import { AGRIFARM_LOGO_SRC } from "@/lib/brand-assets";
import { suggestPasigCrops } from "@/lib/crop-catalog";

type SellerProfile = {
  id: string;
  businessName: string;
  gender: "MALE" | "FEMALE" | null;
  avatarKey: string | null;
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
  totalStock: number;
  availableStock: number;
  reservedStock: number;
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
  images: Array<{ id: string; url: string; altText: string | null; isPrimary: boolean }>;
  _count?: { reviews: number };
};

type SellerOrder = {
  id: string;
  status: "PENDING" | "RESERVED" | "COMPLETED" | "EXPIRED" | "CANCELLED";
  subtotal: string | number;
  deliveryFee: string | number;
  commissionFee: string | number;
  payoutAmount: string | number;
  remainingBalance: string | number;
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
    status: string;
    paymentStatus: string;
    pickupScheduledAt?: string | null;
    remainingBalance?: string | number;
    depositAmount?: string | number;
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

const farmerCharacters = {
  MALE: ["male-01", "male-02", "male-03", "male-04", "male-05"],
  FEMALE: ["female-01", "female-02", "female-03", "female-04", "female-05"],
} as const;

function farmerCharacterSrc(avatarKey: string | null | undefined) {
  return avatarKey ? `/assets/farmer-characters/${avatarKey}.png` : null;
}

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

const fill = (template: string, values: Record<string, string | number>) =>
  Object.entries(values).reduce((text, [key, value]) => text.replaceAll(`{${key}}`, String(value)), template);

async function readJson<T>(response: Response): Promise<T | null> {
  const text = await response.text();
  if (!text.trim()) return null;
  return JSON.parse(text) as T;
}

function SellerSidebar({
  user,
  profile,
  labels,
  common,
  activeItem,
  onRefresh,
  onLogout,
  onNavigate,
  customAvatar,
}: {
  user: AuthUser | null;
  profile: SellerProfile | null;
  labels: ReturnType<typeof useLocale>["copy"]["sellerPage"];
  common: ReturnType<typeof useLocale>["copy"]["common"];
  activeItem: string;
  onRefresh: () => void;
  onLogout: () => void;
  onNavigate: (itemId: string) => void;
  customAvatar: string | null;
}) {
  const items = [
    { id: "overview", href: "#overview", label: labels.overview, icon: Home },
    { id: "settings", href: "#settings", label: labels.settings, icon: ShieldCheck },
    { id: "products", href: "#products", label: labels.products, icon: ShoppingBag },
    { id: "orders", href: "#orders", label: labels.orders, icon: Truck },
  ];

  const avatarSrc = farmerCharacterSrc(profile?.avatarKey);

  return (
    <aside className="seller-sidebar buyer-sidebar" aria-label="Seller navigation">
      <Link href="/" className="seller-sidebar-brand" aria-label="AgriFarm landing page" onClick={() => onNavigate("overview")}>
        <span className="seller-brand-mark">
          <img src={AGRIFARM_LOGO_SRC} alt="" aria-hidden="true" />
        </span>
        <span>
          <small>{labels.center}</small>
          <strong>AgriFarm</strong>
        </span>
      </Link>

      <div className="buyer-sidebar-profile">
        <span className={(profile?.avatarKey || customAvatar) ? "has-character" : ""} style={{ position: "relative", overflow: "hidden" }}>
          {customAvatar ? (
            <img src={customAvatar} alt="Custom seller profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : profile?.avatarKey ? (
            <Image src={avatarSrc!} alt="Selected farmer character" fill sizes="62px" style={{ objectFit: "cover" }} />
          ) : (
            user?.fullName?.slice(0, 1) ?? "S"
          )}
        </span>
        <div>
          <strong>{user?.fullName ?? labels.account}</strong>
          <em>{labels.account}</em>
          <small><MapPin size={13} /> Pasig, Metro Manila</small>
        </div>
      </div>

      <nav className="seller-sidebar-nav">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <a
              key={item.id}
              href={item.href}
              className={activeItem === item.id ? "is-active" : ""}
              onClick={() => onNavigate(item.id)}
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

function SellerTopNav({
  user,
  t,
  theme,
  onToggleTheme,
  aboutUsLabel,
}: {
  user: AuthUser | null;
  t: ReturnType<typeof useLocale>["copy"]["sellerPage"];
  theme: "day" | "night";
  onToggleTheme: () => void;
  aboutUsLabel: string;
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
        <input placeholder="Search harvests, orders, and more..." aria-label="Search seller dashboard" />
        <Search size={20} />
      </label>
      <nav aria-label="Seller quick links">
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
          user={user ?? { id: "", email: "", fullName: t.account, phone: null, role: "SELLER", status: "ACTIVE" }}
          accountLabel={t.account}
          dashboardHref="/seller"
          settingsHref="/settings"
          compact
        />
      </div>
    </header>
  );
}

function SellerMobileBar({
  onMenu,
  user,
  t,
  theme,
  onToggleTheme,
}: {
  onMenu: () => void;
  user: AuthUser | null;
  t: ReturnType<typeof useLocale>["copy"]["sellerPage"];
  theme: "day" | "night";
  onToggleTheme: () => void;
}) {
  return (
    <div className="buyer-mobile-bar">
      <button type="button" onClick={onMenu} aria-label="Open seller navigation">
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
      <span>{user?.fullName?.slice(0, 1) ?? "S"}</span>
    </div>
  );
}

function SellerDrawer({ open, onClose, children }: { open: boolean; onClose: () => void; children: ReactNode }) {
  return (
    <div className={`buyer-drawer${open ? " is-open" : ""}`} aria-hidden={!open}>
      <button className="buyer-drawer-backdrop" type="button" onClick={onClose} aria-label="Close seller navigation" />
      <div className="buyer-drawer-panel" role="dialog" aria-modal="true" aria-label="Seller navigation">
        <button className="buyer-drawer-close" type="button" onClick={onClose} aria-label="Close seller navigation">
          <X size={20} />
        </button>
        {children}
      </div>
    </div>
  );
}

export default function SellerPage() {
  const router = useRouter();
  const { copy } = useLocale();
  const t = copy.sellerPage;
  const common = copy.common;
  const { showToast } = useToast();
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [state, setState] = useState<SellerState>(emptySellerState);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedStoreId, setSelectedStoreId] = useState("");
  const [selectedUrbanGarden, setSelectedUrbanGarden] = useState("Pinagbuhatan");
  const [stockAdjustments, setStockAdjustments] = useState<Record<string, string>>({});
  const [selectedGender, setSelectedGender] = useState<"MALE" | "FEMALE">("MALE");
  const [selectedAvatarKey, setSelectedAvatarKey] = useState("male-01");
  const [productName, setProductName] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const [activeSection, setActiveSection] = useState("overview");
  const [formStep, setFormStep] = useState(1);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [cropPrice, setCropPrice] = useState("");
  const [cropStock, setCropStock] = useState("");

  const customAvatarKey = user ? `agrifarm_seller_custom_avatar_${user.id}` : null;
  const [customAvatar, setCustomAvatar] = useState<string | null>(null);

  const [showSuggestions, setShowSuggestions] = useState(false);
  const nameFieldRef = useRef<HTMLLabelElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (nameFieldRef.current && !nameFieldRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (customAvatarKey) {
      setCustomAvatar(localStorage.getItem(customAvatarKey));
    }
  }, [customAvatarKey]);

  const handleCustomAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = 120;
          canvas.height = 120;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, 120, 120);
            const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
            if (customAvatarKey) {
              localStorage.setItem(customAvatarKey, dataUrl);
              setCustomAvatar(dataUrl);
              showToast({ type: "success", message: "Custom profile picture saved!" });
            }
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const removeCustomAvatar = () => {
    if (customAvatarKey) {
      localStorage.removeItem(customAvatarKey);
      setCustomAvatar(null);
      showToast({ type: "info", message: "Custom profile picture removed. Using character instead." });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setImagePreviewUrl(url);
    } else {
      setSelectedFile(null);
      setImagePreviewUrl(null);
    }
  };

  useEffect(() => {
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  useEffect(() => {
    if (state.barangays.length && !state.barangays.some((barangay) => barangay.name === selectedUrbanGarden)) {
      setSelectedUrbanGarden(state.barangays[0].name);
    }
  }, [state.barangays, selectedUrbanGarden]);

  const apiFetch = useCallback(
    async <T,>(path: string, init: RequestInit = {}) => {
      if (!token) {
        throw new Error(t.loginSellerFirst);
      }

      const response = await fetch(`${getApiBase()}${path}`, {
        ...init,
        headers: {
          ...(init.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
          Authorization: `Bearer ${token}`,
          ...(init.headers ?? {}),
        },
      });

      if (!response.ok) {
        throw new Error(await parseApiError(response));
      }

      return (await readJson<T>(response)) as T;
    },
    [token, t.loginSellerFirst]
  );

  const loadDashboard = useCallback(async () => {
    if (!token || !user || user.role !== "SELLER") {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [profileResult, barangays, products, orders] = await Promise.all([
        apiFetch<SellerProfile | null>("/api/sellers/me"),
        fetch(`${getApiBase()}/api/barangays`).then(async (response) => {
          if (!response.ok) return [];
          return (await readJson<Barangay[]>(response)) ?? [];
        }),
        apiFetch<SellerProduct[]>("/api/products/mine"),
        apiFetch<SellerOrder[]>("/api/orders/seller"),
      ]);

      const allowedBarangays = ["Manggahan", "Rosario", "Pinagbuhatan"];
      const filteredBarangays = barangays.filter((b) => allowedBarangays.includes(b.name));

      if (!profileResult) {
        setState({ ...emptySellerState, barangays: filteredBarangays });
        return;
      }

      const profileGender = profileResult.gender ?? "MALE";
      setSelectedGender(profileGender);
      setSelectedAvatarKey(profileResult.avatarKey ?? farmerCharacters[profileGender][0]);

      const stores = await apiFetch<SellerStore[]>("/api/stores/mine");

      setState({ profile: profileResult, stores, products, orders, barangays: filteredBarangays });
      setSelectedStoreId((current) => current || stores[0]?.id || "");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t.loadError);
    } finally {
      setLoading(false);
    }
  }, [apiFetch, token, user, t.loadError]);

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
    const pendingOrders = state.orders.filter((order) => order.status === "RESERVED");
    const activeProducts = state.products.filter((product) => product.status === "ACTIVE");
    const lowStock = variants.filter((variant) => variant.stockOnHand <= variant.lowStockThreshold);
    const payout = state.orders
      .filter((order) => order.status !== "CANCELLED")
      .reduce((sum, order) => sum + Number(order.payoutAmount ?? 0), 0);

    return [
      { label: t.metrics.stores, value: state.stores.length, icon: Store, note: t.metrics.storeNote },
      { label: t.metrics.activeProducts, value: activeProducts.length, icon: ShoppingBag, note: t.metrics.activeProductsNote },
      { label: t.metrics.lowStock, value: lowStock.length, icon: AlertTriangle, note: t.metrics.lowStockNote },
      { label: t.metrics.openOrders, value: pendingOrders.length, icon: ClipboardList, note: t.metrics.openOrdersNote },
      { label: t.metrics.payout, value: money(payout), icon: PhilippinePeso, note: t.metrics.payoutNote },
    ];
  }, [state, t.metrics]);

  const productSuggestions = useMemo(() => suggestPasigCrops(productName), [productName]);

  async function runAction(action: string, callback: () => Promise<void>) {
    setBusy(action);
    setError(null);

    try {
      await callback();
      await loadDashboard();
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : t.genericError;
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
          gender: selectedGender,
          avatarKey: selectedAvatarKey,
        }),
      });
      showToast({ type: "success", message: t.profileSaved });
    });
  }

  async function createStore(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
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
      formElement.reset();
      showToast({ type: "success", message: t.storeCreated });
    });
  }

  async function addServiceAreas(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
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
      formElement.reset();
      showToast({ type: "success", message: t.areasUpdated });
    });
  }

  async function createProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const name = fieldValue(form, "name");
    const selectedImage = form.get("image");
    const hasImageUpload = selectedImage instanceof File && selectedImage.size > 0;

    await runAction("product", async () => {
      const product = await apiFetch<{ id: string }>("/api/products", {
        method: "POST",
        body: JSON.stringify({
          storeId: fieldValue(form, "storeId") || undefined,
          urbanGardenName: fieldValue(form, "urbanGardenName") || selectedUrbanGarden,
          name,
          slug: fieldValue(form, "slug") || slugify(name),
          description: fieldValue(form, "description") || undefined,
          variantName: fieldValue(form, "variantName") || "Regular",
          sku: fieldValue(form, "sku") || undefined,
          unit: fieldValue(form, "unit") || "kg",
          price: fieldValue(form, "price"),
          stockOnHand: Number(fieldValue(form, "stockOnHand") || 0),
          imageWillBeUploaded: hasImageUpload,
        }),
      });
      if (hasImageUpload) {
        const upload = new FormData();
        upload.set("image", selectedImage);
        await apiFetch(`/api/products/${product.id}/images/upload`, { method: "POST", body: upload });
      }
      formElement.reset();
      setProductName("");
      setCropPrice("");
      setCropStock("");
      setFormStep(1);
      setSelectedFile(null);
      setImagePreviewUrl(null);
      showToast({ type: "success", message: hasImageUpload ? t.productWithPhoto : t.productWithCropPhoto });
    });
  }

  async function adjustStock(variantId: string) {
    const quantityDelta = Number(stockAdjustments[variantId] ?? 0);
    if (!Number.isInteger(quantityDelta) || quantityDelta === 0) {
      showToast({ type: "warning", message: t.stockAdjustmentWarning });
      return;
    }

    await runAction(`stock-${variantId}`, async () => {
      await apiFetch(`/api/products/variants/${variantId}/stock-adjustments`, {
        method: "POST",
        body: JSON.stringify({ quantityDelta, notes: "Seller dashboard adjustment" }),
      });
      setStockAdjustments((current) => ({ ...current, [variantId]: "" }));
      showToast({ type: "success", message: t.stockUpdated });
    });
  }

  async function updateOrderStatus(orderId: string, status: SellerOrder["status"]) {
    await runAction(`order-${orderId}`, async () => {
      await apiFetch(`/api/orders/seller/${orderId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      showToast({ type: "success", message: t.orderStatusUpdated });
    });
  }

  async function completeOrder(orderId: string) {
    const order = state.orders.find((entry) => entry.id === orderId);
    if (!window.confirm(`Complete this order and confirm that ${money(order?.remainingBalance ?? 0)} cash was received?`)) return;
    await runAction(`order-${orderId}`, async () => {
      await apiFetch(`/api/orders/seller/${orderId}/complete`, { method: "POST" });
      showToast({ type: "success", message: "Order completed and remaining cash payment recorded." });
    });
  }

  function loadDemoListing() {
    setSelectedUrbanGarden("Pinagbuhatan");
    setProductName("Pechay");
    setCropPrice("45");
    setCropStock("25");
    setSelectedFile(null);
    setImagePreviewUrl(null);
    setFormStep(2);
  }

  const logout = () => {
    clearAuthSession();
    router.replace("/");
  };

  const sidebar = (
    <SellerSidebar
      user={user}
      profile={state.profile}
      labels={t}
      common={common}
      activeItem={activeSection}
      onRefresh={loadDashboard}
      onLogout={logout}
      onNavigate={(sectionId) => {
        setActiveSection(sectionId);
        setDrawerOpen(false);
      }}
      customAvatar={customAvatar}
    />
  );

  if (loading) {
    return (
      <div className="buyer-profile-page" data-buyer-theme={theme}>
        <SellerTopNav user={user} t={t} theme={theme} onToggleTheme={toggleTheme} aboutUsLabel={copy.buyerPage.aboutUs} />
        <div className="seller-shell buyer-dashboard-shell">
          <div className="buyer-desktop-sidebar">{sidebar}</div>
          <main className="seller-main buyer-main">
            <SellerMobileBar onMenu={() => setDrawerOpen(true)} user={user} t={t} theme={theme} onToggleTheme={toggleTheme} />
            <div className="seller-loading" style={{ margin: "100px auto" }}>
              <Loader2 className="seller-spin" size={32} />
              <span>{t.loading}</span>
            </div>
          </main>
          <SellerDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
            {sidebar}
          </SellerDrawer>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "SELLER") {
    return (
      <div className="buyer-profile-page" data-buyer-theme={theme}>
        <SellerTopNav user={user} t={t} theme={theme} onToggleTheme={toggleTheme} aboutUsLabel={copy.buyerPage.aboutUs} />
        <div className="seller-shell buyer-dashboard-shell">
          <div className="buyer-desktop-sidebar">{sidebar}</div>
          <main className="seller-main buyer-main">
            <SellerMobileBar onMenu={() => setDrawerOpen(true)} user={user} t={t} theme={theme} onToggleTheme={toggleTheme} />
            <main className="seller-empty-state">
              <span className="seller-empty-icon">
                <Store size={36} />
              </span>
              <h1>{t.accessTitle}</h1>
              <p>{t.accessBody}</p>
              <div className="seller-actions">
                <Link href="/login" className="seller-button primary">
                  {user ? t.createSeller : "Log in"}
                </Link>
                <Link href="/" className="seller-button secondary">
                  {t.viewLanding}
                </Link>
              </div>
            </main>
          </main>
          <SellerDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
            {sidebar}
          </SellerDrawer>
        </div>
      </div>
    );
  }

  const hasProfile = Boolean(state.profile);
  const activeStore = state.stores.find((store) => store.id === selectedStoreId) ?? state.stores[0];

  return (
    <div className="buyer-profile-page" data-buyer-theme={theme}>
      <SellerTopNav user={user} t={t} theme={theme} onToggleTheme={toggleTheme} aboutUsLabel={copy.buyerPage.aboutUs} />
      <div className="seller-shell buyer-dashboard-shell">
        <div className="buyer-desktop-sidebar">{sidebar}</div>
        <main className="seller-main buyer-main">
          <SellerMobileBar onMenu={() => setDrawerOpen(true)} user={user} t={t} theme={theme} onToggleTheme={toggleTheme} />

          {error ? (
            <div className="seller-alert" role="alert">
              <AlertTriangle size={18} />
              {error}
            </div>
          ) : null}

          {activeSection === "overview" && (
            <>
              <section className="seller-hero">
                <div>
                  <span className="seller-eyebrow">
                    <Leaf size={18} /> {t.eyebrow}
                  </span>
                  <h1>{fill(t.heroTitle, { name: user.fullName.split(" ")[0] })}</h1>
                  <p>{t.heroBody}</p>
                </div>
                <div className="seller-hero-actions">
                  {customAvatar ? (
                    <span className="seller-character-hero">
                      <img
                        src={customAvatar}
                        alt={`${user.fullName}'s custom profile`}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    </span>
                  ) : state.profile?.avatarKey ? (
                    <span className="seller-character-hero">
                      <Image
                        src={farmerCharacterSrc(state.profile.avatarKey)!}
                        alt={`${user.fullName}'s farmer character`}
                        fill
                        sizes="76px"
                      />
                    </span>
                  ) : null}
                  <button type="button" className="seller-button primary" onClick={() => setActiveSection("products")}>
                    <PackagePlus size={18} /> {t.sellMyCrops}
                  </button>
                  <AccountMenu user={user} accountLabel={t.account} dashboardHref="/seller" settingsHref="/settings" compact />
                </div>
              </section>

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
            </>
          )}

          {activeSection === "settings" && (
            <section className="seller-grid" style={{ gridTemplateColumns: "1fr" }}>
              <article className="seller-panel" id="settings">
                <div className="seller-panel-head">
                  <span>
                    <ShieldCheck size={20} /> Seller profile
                  </span>
                  {state.profile?.verifiedAt ? <small>Verified {formatDate(state.profile.verifiedAt)}</small> : <small>Required</small>}
                </div>
                <form onSubmit={saveProfile} className="seller-form">
                  <label className="product-image-field" style={{ display: "grid", gap: "8px" }}>
                    Upload your own profile picture
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleCustomAvatarChange}
                      style={{ marginTop: "4px" }}
                    />
                    <small>JPG, PNG, or WebP. Custom picture takes priority over farmer characters.</small>
                  </label>
                  
                  {customAvatar ? (
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "4px", background: "rgba(0,0,0,0.03)", padding: "10px", borderRadius: "10px" }}>
                      <img src={customAvatar} alt="Profile preview" style={{ width: "60px", height: "60px", borderRadius: "50%", objectFit: "cover", border: "2px solid #087531" }} />
                      <button
                        type="button"
                        className="seller-button secondary compact"
                        onClick={removeCustomAvatar}
                      >
                        Remove Custom Picture
                      </button>
                    </div>
                  ) : null}

                  <fieldset className="seller-character-picker">
                    <legend>Your farmer character</legend>
                    <div className="seller-gender-toggle" aria-label="Farmer character gender">
                      {(["MALE", "FEMALE"] as const).map((gender) => (
                        <button
                          key={gender}
                          type="button"
                          className={selectedGender === gender ? "is-selected" : ""}
                          onClick={() => {
                            setSelectedGender(gender);
                            setSelectedAvatarKey(farmerCharacters[gender][0]);
                          }}
                        >
                          {gender === "MALE" ? "Male" : "Female"}
                        </button>
                      ))}
                    </div>
                    <div className="seller-character-grid">
                      {farmerCharacters[selectedGender].map((avatarKey, index) => (
                        <button
                          key={avatarKey}
                          type="button"
                          className={selectedAvatarKey === avatarKey ? "is-selected" : ""}
                          aria-pressed={selectedAvatarKey === avatarKey}
                          aria-label={`Choose ${selectedGender.toLowerCase()} farmer character ${index + 1}`}
                          onClick={() => setSelectedAvatarKey(avatarKey)}
                        >
                          <span className="seller-character-image">
                            <Image src={farmerCharacterSrc(avatarKey)!} alt="" fill sizes="100px" />
                          </span>
                          <span>Character {index + 1}</span>
                        </button>
                      ))}
                    </div>
                  </fieldset>
                  <label>
                    Business name
                    <input name="businessName" required defaultValue={state.profile?.businessName ?? user.fullName} />
                  </label>
                  <button type="submit" className="seller-button primary" disabled={busy === "profile"}>
                    Save seller profile
                  </button>
                </form>
              </article>
            </section>
          )}

          {activeSection === "products" && (
            <div style={{ display: "grid", gap: "20px" }}>
              <article className="seller-panel wide seller-sell-panel" id="sell-crops">
                <div className="seller-panel-head">
                  <span>
                    <PackagePlus size={20} /> Sell My Crops
                  </span>
                </div>

                <div className="seller-simple-steps" style={{ display: "flex", justifyContent: "space-between", gap: "10px", marginBottom: "20px" }}>
                  <div style={{ flex: 1, borderBottom: `4px solid ${formStep >= 1 ? "#087531" : "#e2e8f0"}`, paddingBottom: "8px", fontWeight: formStep === 1 ? "bold" : "normal", color: formStep === 1 ? "#087531" : "#64748b", fontSize: "0.85rem" }}>
                    <strong>1.</strong> Picture
                  </div>
                  <div style={{ flex: 1, borderBottom: `4px solid ${formStep >= 2 ? "#087531" : "#e2e8f0"}`, paddingBottom: "8px", fontWeight: formStep === 2 ? "bold" : "normal", color: formStep === 2 ? "#087531" : "#64748b", fontSize: "0.85rem" }}>
                    <strong>2.</strong> Crop & Garden
                  </div>
                  <div style={{ flex: 1, borderBottom: `4px solid ${formStep >= 3 ? "#087531" : "#e2e8f0"}`, paddingBottom: "8px", fontWeight: formStep === 3 ? "bold" : "normal", color: formStep === 3 ? "#087531" : "#64748b", fontSize: "0.85rem" }}>
                    <strong>3.</strong> Price & Stock
                  </div>
                  <div style={{ flex: 1, borderBottom: `4px solid ${formStep >= 4 ? "#087531" : "#e2e8f0"}`, paddingBottom: "8px", fontWeight: formStep === 4 ? "bold" : "normal", color: formStep === 4 ? "#087531" : "#64748b", fontSize: "0.85rem" }}>
                    <strong>4.</strong> Publish
                  </div>
                </div>

                <form onSubmit={createProduct} className="seller-form product-form" style={{ display: "block" }}>
                  {/* Step 1: Pick a Picture */}
                  <div style={{ display: formStep === 1 ? "grid" : "none", gap: "16px" }}>
                    <label className="product-image-field">
                      Product picture (optional)
                      <input name="image" type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageChange} style={{ marginTop: "8px" }} />
                      <small style={{ marginTop: "6px" }}>JPG, PNG, or WebP up to 5 MB. Leave empty to use the matching Agrifarm crop picture.</small>
                    </label>
                    {imagePreviewUrl ? (
                      <div style={{ position: "relative", width: "120px", height: "120px", borderRadius: "12px", overflow: "hidden", border: "1px solid #e2e8f0", background: "#f8fafc", marginTop: "10px" }}>
                        <img src={imagePreviewUrl} alt="Selected preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedFile(null);
                            setImagePreviewUrl(null);
                            const input = document.getElementsByName("image")[0] as HTMLInputElement;
                            if (input) input.value = "";
                          }}
                          style={{ position: "absolute", top: "4px", right: "4px", background: "rgba(0,0,0,0.6)", color: "#fff", border: "none", borderRadius: "50%", width: "24px", height: "24px", cursor: "pointer", display: "grid", placeItems: "center" }}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : null}
                    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "14px" }}>
                      <button type="button" className="seller-button primary" onClick={() => setFormStep(2)}>
                        Next
                      </button>
                    </div>
                  </div>

                  {/* Step 2: Crop & Urban Garden Selection */}
                  <div style={{ display: formStep === 2 ? "grid" : "none", gap: "16px" }}>
                    <label className="product-name-field" ref={nameFieldRef}>
                      What crop are you selling?
                      <input
                        name="name"
                        required={formStep === 2}
                        value={productName}
                        onChange={(event) => {
                          setProductName(event.target.value);
                          setShowSuggestions(true);
                        }}
                        onFocus={() => setShowSuggestions(true)}
                        placeholder="Example: Pechay"
                        autoComplete="off"
                        aria-describedby="crop-name-help"
                      />
                      <small id="crop-name-help">Choose a close match to use its ready-made product picture.</small>
                      {showSuggestions && productSuggestions.length && productName.trim() ? (
                        <span className="crop-suggestions">
                          <em>Did you mean?</em>
                          {productSuggestions.map((name) => (
                            <button
                              key={name}
                              type="button"
                              onClick={() => {
                                setProductName(name);
                                setShowSuggestions(false);
                              }}
                            >
                              {name}
                            </button>
                          ))}
                        </span>
                      ) : null}
                    </label>
                    <label style={{ display: "grid", gap: "8px" }}>
                      Which urban garden?
                      <select
                        name="urbanGardenName"
                        value={selectedUrbanGarden}
                        onChange={(event) => setSelectedUrbanGarden(event.target.value)}
                        style={{ minHeight: "42px", borderRadius: "10px", padding: "0 10px", background: "#fffaf0", border: "1px solid rgba(71,109,46,.32)" }}
                      >
                        {(state.barangays.length ? state.barangays : [{ id: "pinagbuhatan", name: "Pinagbuhatan" }]).map((barangay) => (
                          <option key={barangay.id} value={barangay.name}>
                            {barangay.name}
                          </option>
                        ))}
                      </select>
                      <small>The delivery service area will default to this same barangay.</small>
                    </label>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", marginTop: "14px" }}>
                      <button type="button" className="seller-button secondary" onClick={() => setFormStep(1)}>
                        Back
                      </button>
                      <button
                        type="button"
                        className="seller-button primary"
                        disabled={!productName.trim()}
                        onClick={() => setFormStep(3)}
                      >
                        Next
                      </button>
                    </div>
                  </div>

                  {/* Step 3: Pricing & Quantity */}
                  <div style={{ display: formStep === 3 ? "grid" : "none", gap: "16px" }}>
                    <label style={{ display: "grid", gap: "8px" }}>
                      How will you sell it?
                      <select name="unit" defaultValue="kg" style={{ minHeight: "42px", borderRadius: "10px", padding: "0 10px", background: "#fffaf0", border: "1px solid rgba(71,109,46,.32)" }}>
                        <option value="kg">Per kilo</option>
                        <option value="bundle">Per bundle / tali</option>
                        <option value="piece">Per piece</option>
                        <option value="sack">Per sack</option>
                        <option value="crate">Per crate</option>
                      </select>
                    </label>
                    <label>
                      Price in pesos
                      <input
                        name="price"
                        required={formStep === 3}
                        inputMode="decimal"
                        value={cropPrice}
                        onChange={(e) => setCropPrice(e.target.value)}
                        placeholder="Example: 45"
                        aria-describedby="crop-price-help"
                      />
                      <small id="crop-price-help">Enter the price for one unit.</small>
                    </label>
                    <label>
                      How many are ready?
                      <input
                        name="stockOnHand"
                        required={formStep === 3}
                        inputMode="numeric"
                        value={cropStock}
                        onChange={(e) => setCropStock(e.target.value)}
                        placeholder="Example: 25"
                      />
                    </label>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", marginTop: "14px" }}>
                      <button type="button" className="seller-button secondary" onClick={() => setFormStep(2)}>
                        Back
                      </button>
                      <button
                        type="button"
                        className="seller-button primary"
                        disabled={!cropPrice.trim() || !cropStock.trim()}
                        onClick={() => setFormStep(4)}
                      >
                        Next
                      </button>
                    </div>
                  </div>

                  {/* Step 4: Description & Publish */}
                  <div style={{ display: formStep === 4 ? "grid" : "none", gap: "16px" }}>
                    <label className="product-description-field">
                      Tell buyers about your harvest (optional)
                      <textarea name="description" rows={3} placeholder="Example: Harvested this morning and packed with care." />
                    </label>
                    <div style={{ padding: "16px", background: "rgba(8,117,49,0.06)", borderRadius: "12px", border: "1px solid rgba(8,117,49,0.12)", fontSize: "0.9rem", color: "#1e293b", display: "grid", gap: "8px" }}>
                      <strong>Listing Confirmation:</strong>
                      <p style={{ margin: 0, lineHeight: "1.45" }}>
                        You are listing <strong>{productName}</strong> at <strong>{money(Number(cropPrice))}</strong> per unit with <strong>{cropStock}</strong> unit(s) available. Please confirm these details are correct before publishing.
                      </p>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", marginTop: "14px" }}>
                      <button type="button" className="seller-button secondary" onClick={() => setFormStep(3)}>
                        Back
                      </button>
                      <button type="submit" className="seller-button primary" disabled={busy === "product"}>
                        <PackagePlus size={18} /> {busy === "product" ? "Listing crop..." : "List My Crop for Sale"}
                      </button>
                    </div>
                  </div>
                </form>
              </article>

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
                        <div className="seller-product-summary">
                          {product.images[0]?.url ? (
                            <img
                              className="seller-product-thumb"
                              src={resolveMediaUrl(product.images[0].url)}
                              alt={product.images[0].altText ?? product.name}
                            />
                          ) : null}
                          <span>
                            <strong>{product.name}</strong>
                            <small>
                              {product.store.name} - {product.status} - {product._count?.reviews ?? 0} reviews
                            </small>
                          </span>
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
                                <span className="seller-stock-breakdown">
                                  <small>Total <strong>{variant.totalStock}</strong></small>
                                  <small>Available <strong>{variant.availableStock}</strong></small>
                                  <small>Reserved <strong>{variant.reservedStock}</strong></small>
                                </span>
                                <input
                                  aria-label={`Adjust stock for ${product.name} ${variant.name}`}
                                  value={stockAdjustments[variant.id] ?? ""}
                                  onChange={(event) =>
                                    setStockAdjustments((current) => ({ ...current, [variant.id]: event.target.value }))
                                  }
                                  placeholder="+10 or -2"
                                  inputMode="numeric"
                                />
                                <button
                                  type="button"
                                  className="seller-button secondary compact"
                                  onClick={() => adjustStock(variant.id)}
                                  disabled={busy === `stock-${variant.id}`}
                                >
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
            </div>
          )}

          {activeSection === "orders" && (
            <section className="seller-panel wide" id="orders">
              <div className="seller-panel-head">
                <span>
                  <Truck size={20} /> Reserved orders and pickup
                </span>
                <small>{state.orders.length} seller orders</small>
              </div>
              <div className="seller-order-list">
                {state.orders.length ? (
                  state.orders.map((order) => (
                    <article key={order.id} className={`seller-order-card seller-pickup-card is-${order.status.toLowerCase()}`}>
                      <div className="seller-order-top seller-pickup-top">
                        <div>
                          <small>Reservation {order.order.orderNumber}</small>
                          <strong>{order.order.pickupScheduledAt ? new Intl.DateTimeFormat("en-PH", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Manila" }).format(new Date(order.order.pickupScheduledAt)) : "Pickup schedule pending"}</strong>
                        </div>
                        <span className={`seller-order-state is-${order.status.toLowerCase()}`}>{order.status.replace(/_/g, " ")}</span>
                      </div>
                      <div className="seller-order-body">
                        <div className="seller-reservation-meta">
                          <span><small>Buyer</small><strong>{order.order.buyer?.fullName ?? "Buyer"}</strong></span>
                          <span><small>GCash deposit</small><strong>{order.order.paymentStatus === "PAID" ? "50% paid" : "Payment pending"}</strong></span>
                          <span><small>Collect in cash</small><strong>{money(order.remainingBalance)}</strong></span>
                        </div>
                        <ul className="seller-pickup-products">
                          {order.items.map((item) => (
                            <li key={item.id}>
                              <span><strong>{item.productName}</strong><small>{item.variantName}</small></span>
                              <span>{item.quantity} {item.unit}</span>
                              <strong>{money(item.subtotal)}</strong>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="seller-status-actions">
                        {order.status === "RESERVED" ? <><p>After checking the buyer and receiving the cash balance, complete the order.</p><button type="button" className="seller-button primary compact" disabled={busy === `order-${order.id}`} onClick={() => void completeOrder(order.id)}>
                          {busy === `order-${order.id}` ? "Completing..." : "Complete order"}
                        </button></> : <p>This reservation is {order.status.toLowerCase()}.</p>}
                      </div>
                    </article>
                  ))
                ) : (
                  <p className="seller-muted">No reservations yet. Paid pickup reservations will appear here.</p>
                )}
              </div>
            </section>
          )}
        </main>
        <SellerDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
          {sidebar}
        </SellerDrawer>
      </div>
      <footer className="buyer-site-footer">
        <span>{copy.buyerPage.footer}</span>
      </footer>
    </div>
  );
}
