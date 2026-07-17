"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ArrowRight,
  BarChart3,
  ChefHat,
  MapPin,
  Moon,
  Search,
  ShieldCheck,
  ShoppingBasket,
  ShoppingCart,
  Sun,
  UsersRound,
  X,
} from "lucide-react";
import { LanguageSwitch } from "@/components/language-switch";
import { useLocale } from "@/components/locale-provider";
import { useTheme } from "@/components/theme-provider";
import { getApiBase, parseApiError, resolveMediaUrl } from "@/lib/api";
import { AccountMenu } from "@/components/account-menu";
import { CartMenu } from "@/components/cart-menu";
import { getAuthToken, getAuthUser, type AuthUser } from "@/lib/auth-storage";
import { getRoleHomeHref, getRoleLabel } from "@/lib/auth-routing";
import { AGRIFARM_LOGO_SRC } from "@/lib/brand-assets";

const asset = (name: string) => `/assets/agrifarm/${name}`;

type Product = {
  id: string;
  name: string;
  description?: string | null;
  store?: { name?: string | null; slug?: string | null } | null;
  variants?: Array<{ id: string; price: string | number; unit?: string | null; stockOnHand?: number | null }>;
  images?: Array<{ url: string; altText?: string | null; isPrimary?: boolean | null }>;
};

type SampleProduct = {
  id: string;
  name: string;
  price: string;
  unit: string;
  store: string;
  image: string;
};

type StoreRecord = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  sellerProfile?: { businessName?: string | null; verifiedAt?: string | null; gender?: string | null } | null;
  serviceAreas?: Array<{ barangay?: { name?: string | null } | null; deliveryFee?: string | null }>;
  _count?: { products?: number | null };
};

type SampleFarmer = {
  id: string;
  name: string;
  barangay: string;
  products: number;
  image: string;
};

const copy = {
  en: {
    nav: {
      marketplace: "Marketplace",
      farmers: "Urban Gardens",
      recipes: "Recipes",
      forecast: "Forecast",
      pasig: "Explore Pasig",
      login: "Log in",
      register: "Sign up",
    },
    marketplace: {
      eyebrow: "Guest marketplace",
      title: "Browse fresh Pasig harvests before you log in.",
      body: "See produce, prices, and the farm behind each item. Create an account only when you are ready to order.",
      search: "Search products",
      empty: "No active products yet. Sample seasonal picks are shown below.",
      fallbackStore: "Local AgriFarm seller",
      fallbackUnit: "bundle",
      cta: "Log in to buy",
      sampleTitle: "Seasonal buyer picks",
    },
    farmers: {
      eyebrow: "Urban garden highlights",
      title: "See the barangay gardens you can explore in Pasig.",
      body: "Browse highlighted urban gardens, discover their barangays, and preview harvests before you log in.",
      empty: "No active urban garden highlights yet. Featured community examples are shown below.",
      verified: "Verified garden",
      products: "products",
      area: "Visit in",
      cta: "Browse harvests",
    },
    recipes: {
      eyebrow: "Delicious Filipino food",
      title: "Plan meals from what Pasig urban gardens can harvest.",
      body: "Use recipe ideas to decide what to buy, with estimated cooking cost for family meals.",
      cost: "Estimated cook cost",
      bestWith: "Best with",
      cta: "Shop ingredients",
    },
    forecast: {
      eyebrow: "Smart forecast",
      title: "Understand seasonality before buying or planting.",
      body: "Guest users can preview demand and weather signals. Detailed seller planning can come after login.",
      confidence: "Confidence",
      demand: "Demand signal",
      cta: "Browse produce",
    },
    pasig: {
      eyebrow: "Explore Pasig",
      title: "Find the barangays where AgriFarm can grow.",
      body: "Start with a friendly map view of farms, delivery routes, and community food points.",
      cta: "See urban gardens",
      farmers: "urban gardens in this barangay",
      selected: "Selected barangay",
      hint: "Tap a pin to see how many urban gardens are connected there.",
      fallback: "Sample community count",
    },
  },
  fil: {
    nav: {
      marketplace: "Pamilihan",
      farmers: "Urban Gardens",
      recipes: "Mga Putahe",
      forecast: "Pagtataya",
      pasig: "Tuklasin ang Pasig",
      login: "Mag log in",
      register: "Mag sign up",
    },
    marketplace: {
      eyebrow: "Pamilihan para sa guest",
      title: "Tingnan muna ang sariwang ani sa Pasig bago mag log in.",
      body: "Makita ang produkto, presyo, at farm sa likod ng bawat ani. Gumawa lang ng account kapag handa nang umorder.",
      search: "Maghanap ng produkto",
      empty: "Wala pang active products. Ipinapakita muna ang sample seasonal picks.",
      fallbackStore: "Lokal na AgriFarm seller",
      fallbackUnit: "tali",
      cta: "Mag log in para bumili",
      sampleTitle: "Seasonal picks para sa mamimili",
    },
    farmers: {
      eyebrow: "Mga tampok na urban garden",
      title: "Tingnan ang mga garden sa barangay na puwede ninyong tuklasin sa Pasig.",
      body: "I-browse ang mga tampok na urban garden, tuklasin ang kanilang barangay, at silipin ang ani bago mag log in.",
      empty: "Wala pang active urban garden highlights. Ipinapakita muna ang featured community examples.",
      verified: "Verified garden",
      products: "produkto",
      area: "Bisitahin sa",
      cta: "Tingnan ang ani",
    },
    recipes: {
      eyebrow: "Masasarap na pagkaing Pilipino",
      title: "Magplano ng ulam mula sa ani ng urban gardens sa Pasig.",
      body: "Gamitin ang recipe ideas para malaman kung ano ang bibilhin, kasama ang tinatayang gastos sa pagluluto.",
      cost: "Tinatayang gastos sa pagluluto",
      bestWith: "Pinakamainam gamit ang",
      cta: "Mamili ng sangkap",
    },
    forecast: {
      eyebrow: "Matalinong pagtataya",
      title: "Unawain ang panahon at demand bago bumili o magtanim.",
      body: "Makikita ng guest ang demand at weather signals. Mas detalyadong seller planning pagkatapos mag log in.",
      confidence: "Kumpiyansa",
      demand: "Demand signal",
      cta: "Tingnan ang ani",
    },
    pasig: {
      eyebrow: "Tuklasin ang Pasig",
      title: "Hanapin ang barangays kung saan pwedeng lumago ang AgriFarm.",
      body: "Magsimula sa friendly map view ng farms, delivery routes, at community food points.",
      cta: "Tingnan ang urban gardens",
      farmers: "urban gardens sa barangay na ito",
      selected: "Napiling barangay",
      hint: "Pindutin ang pin para makita kung ilang urban gardens ang konektado roon.",
      fallback: "Sample community count",
    },
  },
} as const;

const samples: SampleProduct[] = [
  {
    id: "sample-kangkong",
    name: "Fresh Kangkong",
    price: "PHP 35",
    unit: "bundle",
    store: "Maria's Garden",
    image: asset("marketplace-basket.png"),
  },
  {
    id: "sample-pechay",
    name: "Pechay Harvest",
    price: "PHP 45",
    unit: "kg",
    store: "Rooftop Greens PH",
    image: asset("recipe-ginisang-pechay.png"),
  },
  {
    id: "sample-talong",
    name: "Talong Basket",
    price: "PHP 60",
    unit: "kg",
    store: "Pasig Urban Farm",
    image: asset("recipe-tortang-talong.png"),
  },
  {
    id: "sample-pinakbet",
    name: "Pinakbet Bundle",
    price: "PHP 180",
    unit: "set",
    store: "Rosario Growers",
    image: asset("recipe-pinakbet.png"),
  },
];

const sampleFarmers: SampleFarmer[] = [
  {
    id: "maria",
    name: "Maria's Garden",
    barangay: "Barangay Rosario",
    products: 12,
    image: asset("maria-rooftop-story2.png"),
  },
  {
    id: "rooftop",
    name: "Rooftop Greens PH",
    barangay: "Barangay Kapitolyo",
    products: 9,
    image: asset("maria-rooftop-story2.png"),
  },
  {
    id: "pasig",
    name: "Pasig Urban Farm",
    barangay: "Barangay Caniogan",
    products: 15,
    image: asset("maria-rooftop-story2.png"),
  },
];

const recipes = [
  {
    name: "Ginisang Pechay",
    body: {
      en: "Warm, quick, and easy for rainy evenings.",
      fil: "Mainit, mabilis, at madali para sa maulang gabi.",
    },
    cost: "PHP 95-PHP 130",
    crops: "Pechay, garlic, onion",
    image: asset("recipe-ginisang-pechay.png"),
  },
  {
    name: "Pinakbet",
    body: {
      en: "A familiar vegetable dish for mixed seasonal harvest.",
      fil: "Pamilyar na gulay dish para sa mixed seasonal harvest.",
    },
    cost: "PHP 160-PHP 220",
    crops: "Talong, okra, squash, sitaw",
    image: asset("recipe-pinakbet.png"),
  },
  {
    name: "Tortang Talong",
    body: {
      en: "Simple ulam with affordable ingredients.",
      fil: "Simpleng ulam gamit ang abot-kayang sangkap.",
    },
    cost: "PHP 120-PHP 170",
    crops: "Talong, egg, tomato",
    image: asset("recipe-tortang-talong.png"),
  },
];

const forecasts = [
  { crop: "Kangkong", demand: "High", confidence: "86%", note: "Rainy evenings increase leafy green demand." },
  { crop: "Talong", demand: "Stable", confidence: "78%", note: "Good for dinner recipes and bundle planning." },
  { crop: "Pechay", demand: "Rising", confidence: "82%", note: "Budget-friendly meals trend upward during wet weeks." },
];

const pasigPoints = [
  { name: "Rosario", left: "68%", top: "36%", farmers: 6, labelDx: -18, labelDy: -8 },
  { name: "Dela Paz", left: "74%", top: "15%", farmers: 3, labelDx: 22, labelDy: -8 },
  { name: "Manggahan", left: "91%", top: "40%", farmers: 3, labelDx: 36, labelDy: 2 },
  { name: "Pinagbuhatan", left: "79%", top: "74%", farmers: 3, labelDx: -16, labelDy: -8 },
  { name: "Bagong Ilog", left: "23%", top: "56%", farmers: 2, labelDx: -16, labelDy: -10 },
  { name: "Caniogan", left: "49%", top: "42%", farmers: 2, labelDx: -16, labelDy: -18 },
  { name: "Kalawaan", left: "61%", top: "77%", farmers: 2, labelDx: 8, labelDy: -8 },
  { name: "Kapitolyo", left: "35%", top: "49%", farmers: 2, labelDx: -24, labelDy: -8 },
  { name: "Maybunga", left: "73%", top: "52%", farmers: 2, labelDx: 24, labelDy: -16 },
  { name: "Palatiw", left: "57%", top: "62%", farmers: 2, labelDx: 34, labelDy: 0 },
  { name: "Pineda", left: "27%", top: "68%", farmers: 2, labelDx: -18, labelDy: -4 },
  { name: "San Miguel", left: "54%", top: "48%", farmers: 2, labelDx: 4, labelDy: -28 },
  { name: "San Nicolas", left: "47%", top: "62%", farmers: 2, labelDx: -8, labelDy: 8 },
  { name: "Santolan", left: "64%", top: "23%", farmers: 2, labelDx: -38, labelDy: -2 },
  { name: "Sta. Lucia", left: "82%", top: "27%", farmers: 2, labelDx: 28, labelDy: -5 },
  { name: "Sto. Tomas", left: "69%", top: "59%", farmers: 2, labelDx: 32, labelDy: 4 },
  { name: "Ugong", left: "55%", top: "20%", farmers: 2, labelDx: -18, labelDy: -15 },
  { name: "Bagong Katipunan", left: "41%", top: "64%", farmers: 1, labelDx: -38, labelDy: -13 },
  { name: "Bambang", left: "47%", top: "69%", farmers: 1, labelDx: -10, labelDy: 2 },
  { name: "Buting", left: "20%", top: "75%", farmers: 1, labelDx: -6, labelDy: -8 },
  { name: "Kapasigan", left: "49%", top: "64%", farmers: 1, labelDx: -42, labelDy: 2 },
  { name: "Malinao", left: "41%", top: "55%", farmers: 1, labelDx: -34, labelDy: -6 },
  { name: "Oranbo", left: "27%", top: "37%", farmers: 1, labelDx: 0, labelDy: -6 },
  { name: "Sagad", left: "50%", top: "58%", farmers: 1, labelDx: -4, labelDy: -26 },
  { name: "San Antonio", left: "36%", top: "23%", farmers: 1, labelDx: -22, labelDy: -12 },
  { name: "San Joaquin", left: "40%", top: "80%", farmers: 1, labelDx: 4, labelDy: -8 },
  { name: "San Jose", left: "46%", top: "54%", farmers: 1, labelDx: -30, labelDy: -22 },
  { name: "Sta. Cruz", left: "61%", top: "56%", farmers: 1, labelDx: 38, labelDy: -20 },
  { name: "Sta. Rosa", left: "65%", top: "45%", farmers: 1, labelDx: 34, labelDy: -22 },
  { name: "Sumilang", left: "90%", top: "64%", farmers: 1, labelDx: 34, labelDy: -8 },
] as const;

function usePublicData<T>(path: string) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch(`${getApiBase()}${path}`);
        if (!response.ok) return;
        const payload = (await response.json()) as T[];
        if (!cancelled) setData(Array.isArray(payload) ? payload : []);
      } catch {
        // Public pages remain useful with curated fallback cards when the API is offline.
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [path]);

  return { data, loading };
}

function Shell({ children }: { children: ReactNode }) {
  const { locale } = useLocale();
  const { theme, setTheme } = useTheme();
  const [user, setUser] = useState<AuthUser | null>(null);
  const t = copy[locale];
  const isNight = theme === "night";

  useEffect(() => {
    const token = getAuthToken();
    const storedUser = getAuthUser();
    setUser(token && storedUser ? storedUser : null);
  }, []);

  return (
    <main
      data-public-theme={isNight ? "night" : "morning"}
      className={`public-discovery-shell min-h-screen transition-colors duration-500 ${isNight ? "bg-[#111a15] text-[#fff8e8]" : "bg-[#fff9ec] text-[#17250f]"}`}
    >
      <header
        className={`sticky top-0 z-40 border-b backdrop-blur-xl transition-colors duration-500 ${
          isNight ? "border-white/10 bg-[#101914]/88" : "border-[#eadfca] bg-[#fff9ec]/88"
        }`}
      >
        <nav className="mx-auto flex h-20 max-w-[1320px] items-center justify-between gap-4 px-5 sm:px-8">
          <Link href="/" className="flex items-center gap-3" aria-label="AgriFarm home">
            <span
              className={`grid h-12 w-12 place-items-center overflow-hidden rounded-full shadow-sm ring-1 ${
                isNight ? "bg-white/10 ring-white/15" : "bg-[#ecf5dc] ring-[#145c2a]/10"
              }`}
            >
              <img className="h-[88%] w-[76%] object-contain" src={AGRIFARM_LOGO_SRC} alt="" aria-hidden="true" />
            </span>
            <span className="leading-tight">
              <strong className={`block text-2xl font-black ${isNight ? "text-[#f7f0d7]" : "text-[#0d5426]"}`}>AgriFarm</strong>
              <small className={`hidden text-xs font-bold sm:block ${isNight ? "text-[#d7c99d]" : "text-[#33452a]"}`}>From our farms, for our future.</small>
            </span>
          </Link>
          <div className={`hidden items-center gap-7 text-sm font-bold lg:flex ${isNight ? "text-[#f5ead0]" : "text-[#1f2b18]"}`}>
            <Link href="/marketplace">{t.nav.marketplace}</Link>
            <Link href="/farmers">{t.nav.farmers}</Link>
            <Link href="/recipes">{t.nav.recipes}</Link>
            <Link href="/forecast">{t.nav.forecast}</Link>
            <Link href="/pasig">{t.nav.pasig}</Link>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageSwitch compact />
            <button
              type="button"
              onClick={() => setTheme(isNight ? "day" : "night")}
              className={`grid h-11 w-11 place-items-center rounded-2xl text-sm font-black ring-1 transition ${
                isNight ? "bg-[#f6d27a] text-[#182114] ring-[#f6d27a]/35" : "bg-white/80 text-[#17250f] ring-black/5 hover:bg-[#edf5d9]"
              }`}
              aria-label={isNight ? "Switch to morning mode" : "Switch to night mode"}
              aria-pressed={isNight}
            >
              {isNight ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            {user ? (
              <>
                <CartMenu compact />
                <AccountMenu
                  user={user}
                  accountLabel={getRoleLabel(user)}
                  dashboardHref={getRoleHomeHref(user)}
                  settingsHref="/settings"
                  dashboardLabel="Profile"
                  showSettings={false}
                  compact
                />
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className={`hidden h-11 items-center rounded-2xl px-5 text-sm font-black ring-1 md:inline-flex ${
                    isNight ? "bg-white/12 text-[#fff8e8] ring-white/12" : "bg-white/80 text-[#17250f] ring-black/5"
                  }`}
                >
                  {t.nav.login}
                </Link>
                <Link href="/register" className="inline-flex h-11 items-center rounded-2xl bg-[#145c2a] px-5 text-sm font-black text-white shadow-lg shadow-[#145c2a]/20">
                  {t.nav.register}
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>
      {children}
    </main>
  );
}

function PageHeader({
  eyebrow,
  title,
  body,
  icon,
  actions,
}: {
  eyebrow: string;
  title: string;
  body: string;
  icon: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <section className="public-page-header mx-auto grid max-w-[1320px] gap-5 px-5 py-8 sm:px-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
      <div>
        <span className="public-eyebrow inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-2 text-xs font-black uppercase tracking-[0.14em] text-[#365320] ring-1 ring-[#7d6033]/10">
          {icon} {eyebrow}
        </span>
        <h1 className="public-title mt-4 max-w-4xl text-3xl font-black leading-tight text-[#143b18] sm:text-4xl">{title}</h1>
        <p className="public-subtitle mt-3 max-w-3xl text-base font-semibold leading-7 text-[#4a4635]">{body}</p>
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-3 lg:justify-end">{actions}</div> : null}
    </section>
  );
}

function SearchBox({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder: string }) {
  return (
    <label className="public-search flex min-h-12 min-w-[min(100%,320px)] flex-1 items-center gap-3 rounded-2xl bg-white px-4 shadow-sm ring-1 ring-[#7d6033]/12">
      <Search size={19} className="public-search-icon text-[#246733]" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="public-search-input h-11 min-w-0 flex-1 bg-transparent text-sm font-bold text-[#17250f] outline-none placeholder:text-[#786d57]"
      />
    </label>
  );
}

function FilterChip({ active, children, onClick }: { active: boolean; children: ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`public-filter-chip min-h-10 rounded-full px-4 text-sm font-black ring-1 transition ${
        active ? "bg-[#145c2a] text-white ring-[#145c2a]" : "bg-white/76 text-[#29471a] ring-[#7d6033]/12 hover:bg-[#edf5d9]"
      }`}
    >
      {children}
    </button>
  );
}

function money(value?: string | number) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return "PHP 0";
  return `PHP ${numeric.toLocaleString("en-PH", { maximumFractionDigits: 0 })}`;
}

function productImage(product: Product) {
  const image = product.images?.find((item) => item.isPrimary)?.url ?? product.images?.[0]?.url;
  return image ? resolveMediaUrl(image) : asset("marketplace-basket.png");
}

function isProduct(item: Product | SampleProduct): item is Product {
  return "variants" in item;
}

function isStoreRecord(store: StoreRecord | SampleFarmer): store is StoreRecord {
  return "slug" in store;
}

const BUY_NOW_STORAGE_KEY = "agrifarm_buy_now_checkout";

export function MarketplacePage() {
  const router = useRouter();
  const { locale } = useLocale();
  const t = copy[locale].marketplace;
  const { data: products, loading } = usePublicData<Product>("/api/products");
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [busyVariant, setBusyVariant] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [purchase, setPurchase] = useState<{
    product: Product;
    variant: NonNullable<Product["variants"]>[number];
    intent: "cart" | "buy";
  } | null>(null);
  const [quantity, setQuantity] = useState(1);
  const sourceProducts: Array<Product | SampleProduct> = products.length ? products : samples;
  const visibleProducts = useMemo(() => {
    const needle = query.toLowerCase();
    return sourceProducts.filter((product) => {
      const isLive = isProduct(product);
      const haystack = `${product.name} ${isLive ? product.description ?? "" : ""} ${isLive ? product.store?.name ?? "" : product.store}`.toLowerCase();
      const matchesQuery = haystack.includes(needle);
      const matchesFilter =
        filter === "all" ||
        product.name.toLowerCase().includes(filter) ||
        (isLive ? product.description?.toLowerCase().includes(filter) : product.store.toLowerCase().includes(filter));
      return matchesQuery && matchesFilter;
    });
  }, [filter, query, sourceProducts]);

  useEffect(() => {
    const storedToken = getAuthToken();
    const storedUser = getAuthUser();
    setToken(storedToken);
    setUser(storedToken && storedUser ? storedUser : null);
  }, []);

  function openPurchaseModal(product: Product, variant: NonNullable<Product["variants"]>[number], intent: "cart" | "buy") {
    setQuantity(1);
    setNotice(null);
    setPurchase({ product, variant, intent });
  }

  async function addToCart(productName: string, variantId: string, nextQuantity: number, redirectTo?: string) {
    if (!token) return;
    setBusyVariant(variantId);
    setNotice(null);
    try {
      const response = await fetch(`${getApiBase()}/api/cart/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ variantId, quantity: nextQuantity }),
      });
      if (!response.ok) throw new Error(await parseApiError(response));
      setNotice(`${productName} added to cart.`);
      window.dispatchEvent(new Event("agrifarm-cart-updated"));
      setPurchase(null);
      if (redirectTo) router.push(redirectTo);
    } catch (caught) {
      setNotice(caught instanceof Error ? caught.message : "Unable to add item to cart.");
    } finally {
      setBusyVariant(null);
    }
  }

  function buyNowDirect() {
    if (!purchase) return;
    const image = productImage(purchase.product);
    sessionStorage.setItem(
      BUY_NOW_STORAGE_KEY,
      JSON.stringify({
        id: `buy-now-${purchase.variant.id}`,
        quantity,
        variant: {
          id: purchase.variant.id,
          name: purchase.variant.unit ?? "Default",
          price: purchase.variant.price,
          product: {
            name: purchase.product.name,
            images: [{ url: image, altText: purchase.product.name, isPrimary: true }],
          },
          store: { name: purchase.product.store?.name ?? t.fallbackStore },
        },
      })
    );
    setPurchase(null);
    router.push("/buyer/checkout?mode=buy-now");
  }

  return (
    <Shell>
      <PageHeader
        eyebrow={t.eyebrow}
        title={t.title}
        body={t.body}
        icon={<ShoppingBasket size={15} />}
        actions={
          <>
            <span className="public-count-pill rounded-full bg-white/70 px-4 py-2 text-sm font-black text-[#365320] ring-1 ring-[#7d6033]/10">
              {visibleProducts.length} products
            </span>
            {user ? (
              <Link href="/buyer/wishlist" className="inline-flex min-h-11 items-center gap-2 rounded-2xl bg-[#145c2a] px-5 text-sm font-black text-white">
                <ShoppingCart size={16} /> View cart
              </Link>
            ) : (
              <Link href="/login" className="inline-flex min-h-11 items-center rounded-2xl bg-[#145c2a] px-5 text-sm font-black text-white">
                {t.cta}
              </Link>
            )}
          </>
        }
      />
      <section className="mx-auto max-w-[1320px] px-5 pb-16 sm:px-8">
        <div className="public-toolbar mb-6 rounded-[24px] bg-[#fffdf7] p-4 shadow-lg shadow-[#604117]/8 ring-1 ring-[#7d6033]/12">
          <div className="flex flex-wrap items-center gap-3">
            <SearchBox value={query} onChange={setQuery} placeholder={t.search} />
            <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>All</FilterChip>
            <FilterChip active={filter === "pechay"} onClick={() => setFilter("pechay")}>Pechay</FilterChip>
            <FilterChip active={filter === "talong"} onClick={() => setFilter("talong")}>Talong</FilterChip>
            <FilterChip active={filter === "bundle"} onClick={() => setFilter("bundle")}>Bundles</FilterChip>
          </div>
        </div>
        {!loading && products.length === 0 ? <p className="mb-5 font-bold text-[#5b513d]">{t.empty}</p> : null}
        {notice ? <p className="public-cart-notice mb-5 rounded-2xl bg-[#edf5d9] px-4 py-3 text-sm font-black text-[#1f4d25] ring-1 ring-[#145c2a]/10">{notice}</p> : null}
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {visibleProducts.map((item) => {
            const isLive = isProduct(item);
            const variant = isLive ? item.variants?.[0] : undefined;
            const price = isLive ? money(variant?.price) : item.price;
            const unit = isLive ? variant?.unit ?? t.fallbackUnit : item.unit;
            const storeName = isLive ? item.store?.name ?? t.fallbackStore : item.store;
            const outOfStock = Number(variant?.stockOnHand ?? 0) <= 0;
            return (
              <article key={item.id} className="public-card overflow-hidden rounded-3xl bg-[#fffdf7] shadow-lg shadow-[#604117]/8 ring-1 ring-[#7d6033]/14">
                <div className="public-card-media h-48 bg-[#f3ead3]">
                  <img src={isLive ? productImage(item) : item.image} alt="" className="h-full w-full object-contain p-5" />
                </div>
                <div className="p-5">
                  <h2 className="public-card-title text-xl font-black text-[#17250f]">{item.name}</h2>
                  <p className="public-card-meta mt-1 text-sm font-bold text-[#5a513d]">{storeName}</p>
                  <div className="mt-5 grid gap-3">
                    <strong className="public-price-pill rounded-2xl bg-[#edf5d9] px-4 py-2 text-sm font-black text-[#1f4d25]">
                      {price} / {unit}
                    </strong>
                    {user && isLive && variant?.id ? (
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          disabled={busyVariant === variant.id || outOfStock}
                          onClick={() => openPurchaseModal(item, variant, "cart")}
                          className="inline-flex h-11 items-center justify-center rounded-2xl bg-[#145c2a] px-3 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-55"
                        >
                          Add to cart
                        </button>
                        <button
                          type="button"
                          disabled={busyVariant === variant.id || outOfStock}
                          onClick={() => openPurchaseModal(item, variant, "buy")}
                          className="inline-flex h-11 items-center justify-center rounded-2xl bg-[#f6d27a] px-3 text-sm font-black text-[#17250f] disabled:cursor-not-allowed disabled:opacity-55"
                        >
                          Reserve now
                        </button>
                      </div>
                    ) : user ? (
                      <button
                        type="button"
                        disabled
                        className="inline-flex h-11 cursor-not-allowed items-center rounded-2xl bg-[#145c2a] px-4 text-sm font-black text-white opacity-55"
                      >
                        Sample only
                      </button>
                    ) : (
                      <Link href="/login" className="inline-flex h-11 items-center rounded-2xl bg-[#145c2a] px-4 text-sm font-black text-white">
                        {t.cta}
                      </Link>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
      {purchase ? (
        <div className="marketplace-buy-modal" role="dialog" aria-modal="true" aria-label={`${purchase.product.name} quantity`}>
          <button className="marketplace-buy-backdrop" type="button" onClick={() => setPurchase(null)} aria-label="Close product modal" />
          <div className="marketplace-buy-panel">
            <button className="marketplace-buy-close" type="button" onClick={() => setPurchase(null)} aria-label="Close product window">
              <X size={19} />
            </button>
            <img src={productImage(purchase.product)} alt={purchase.product.name} />
            <div className="marketplace-buy-copy">
              <span>{purchase.intent === "buy" ? "Reserve for pickup" : "Add to your cart"}</span>
              <h2>{purchase.product.name}</h2>
              <p>{money(purchase.variant.price)} per {purchase.variant.unit ?? t.fallbackUnit}</p>
              <dl>
                <div><dt>Available after selection</dt><dd>{Math.max(0, Number(purchase.variant.stockOnHand ?? 0) - quantity)}</dd></div>
                <div><dt>Your quantity</dt><dd>{quantity} {purchase.variant.unit ?? "bundle"}{quantity === 1 ? "" : "s"}</dd></div>
                <div><dt>Order total</dt><dd>{money(Number(purchase.variant.price) * quantity)}</dd></div>
              </dl>
              <div className="marketplace-buy-stepper">
                <button type="button" onClick={() => setQuantity((current) => Math.max(1, current - 1))} aria-label="Decrease quantity">-</button>
                <strong>{quantity}</strong>
                <button
                  type="button"
                  onClick={() => setQuantity((current) => Math.min(Number(purchase.variant.stockOnHand ?? 1), current + 1))}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
              <div className={`marketplace-buy-actions is-${purchase.intent}`}>
                <button
                  type="button"
                  disabled={busyVariant === purchase.variant.id}
                  onClick={() => void addToCart(purchase.product.name, purchase.variant.id, quantity, "/buyer/wishlist")}
                >
                  Add to cart
                </button>
                <button
                  type="button"
                  disabled={busyVariant === purchase.variant.id}
                  onClick={buyNowDirect}
                >
                  Reserve now
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </Shell>
  );
}

export function FarmersPage() {
  const { locale } = useLocale();
  const t = copy[locale].farmers;
  const { data: stores, loading } = usePublicData<StoreRecord>("/api/stores");
  const [query, setQuery] = useState("");
  const [areaFilter, setAreaFilter] = useState("all");
  const sourceStores: Array<StoreRecord | SampleFarmer> = stores.length ? stores : sampleFarmers;
  const visibleStores = useMemo(() => {
    const needle = query.toLowerCase();
    return sourceStores.filter((store) => {
      const isLive = isStoreRecord(store);
      const area = isLive ? store.serviceAreas?.[0]?.barangay?.name ?? "Pasig City" : store.barangay;
      const haystack = `${store.name} ${area}`.toLowerCase();
      const matchesQuery = haystack.includes(needle);
      const matchesArea = areaFilter === "all" || area.toLowerCase().includes(areaFilter);
      return matchesQuery && matchesArea;
    });
  }, [areaFilter, query, sourceStores]);

  return (
    <Shell>
      <PageHeader
        eyebrow={t.eyebrow}
        title={t.title}
        body={t.body}
        icon={<UsersRound size={15} />}
        actions={
          <span className="public-count-pill rounded-full bg-white/70 px-4 py-2 text-sm font-black text-[#365320] ring-1 ring-[#7d6033]/10">
            {visibleStores.length} gardens
          </span>
        }
      />
      <section className="mx-auto max-w-[1320px] px-5 pb-16 sm:px-8">
        <div className="public-toolbar mb-6 rounded-[24px] bg-[#fffdf7] p-4 shadow-lg shadow-[#604117]/8 ring-1 ring-[#7d6033]/12">
          <div className="flex flex-wrap items-center gap-3">
            <SearchBox value={query} onChange={setQuery} placeholder="Search gardens or barangays" />
            <FilterChip active={areaFilter === "all"} onClick={() => setAreaFilter("all")}>All areas</FilterChip>
            <FilterChip active={areaFilter === "rosario"} onClick={() => setAreaFilter("rosario")}>Rosario</FilterChip>
            <FilterChip active={areaFilter === "kapitolyo"} onClick={() => setAreaFilter("kapitolyo")}>Kapitolyo</FilterChip>
            <FilterChip active={areaFilter === "caniogan"} onClick={() => setAreaFilter("caniogan")}>Caniogan</FilterChip>
          </div>
        </div>
        {!loading && stores.length === 0 ? <p className="mb-5 font-bold text-[#5b513d]">{t.empty}</p> : null}
        <div className="grid gap-6 lg:grid-cols-3">
          {visibleStores.map((store, index) => {
            const isLive = isStoreRecord(store);
            const area = isLive ? store.serviceAreas?.[0]?.barangay?.name ?? "Pasig City" : store.barangay;
            const productCount = isLive ? store._count?.products ?? 0 : store.products;
            return (
              <article key={store.id} className="public-card overflow-hidden rounded-[32px] bg-[#fffdf7] shadow-xl shadow-[#604117]/10 ring-1 ring-[#7d6033]/14">
                <div className="public-card-media h-44 bg-[#edf0d8]">
                  <img
                    src={isLive ? [asset("maria-harvest-basket.png"), asset("farmer-watering.png"), asset("hero-pasig-rooftop-farm.png")][index % 3] : store.image}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <span className="public-status-pill inline-flex items-center gap-2 rounded-full bg-[#edf5d9] px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-[#245b2a]">
                    <ShieldCheck size={14} /> {t.verified}
                  </span>
                  <h2 className="public-card-title mt-4 text-2xl font-black text-[#17250f]">{store.name}</h2>
                  <p className="public-card-meta mt-3 flex items-center gap-2 text-sm font-bold text-[#5a513d]">
                    <MapPin size={16} className="text-[#246733]" /> {t.area}: {area}
                  </p>
                  <p className="public-card-meta mt-2 text-sm font-bold text-[#5a513d]">
                    {productCount} {t.products}
                  </p>
                  <Link href="/marketplace" className="mt-6 inline-flex h-12 items-center gap-2 rounded-2xl bg-[#145c2a] px-5 text-sm font-black text-white">
                    {t.cta} <ArrowRight size={16} />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </Shell>
  );
}

export function RecipesPage() {
  const { locale } = useLocale();
  const t = copy[locale].recipes;
  const [query, setQuery] = useState("");
  const visibleRecipes = useMemo(() => {
    const needle = query.toLowerCase();
    return recipes.filter((recipe) => `${recipe.name} ${recipe.crops} ${recipe.body[locale]}`.toLowerCase().includes(needle));
  }, [locale, query]);

  return (
    <Shell>
      <PageHeader
        eyebrow={t.eyebrow}
        title={t.title}
        body={t.body}
        icon={<ChefHat size={15} />}
        actions={<span className="public-count-pill rounded-full bg-white/70 px-4 py-2 text-sm font-black text-[#365320] ring-1 ring-[#7d6033]/10">{visibleRecipes.length} recipes</span>}
      />
      <section className="mx-auto max-w-[1320px] px-5 pb-16 sm:px-8">
        <div className="public-toolbar mb-6 rounded-[24px] bg-[#fffdf7] p-4 shadow-lg shadow-[#604117]/8 ring-1 ring-[#7d6033]/12">
          <SearchBox value={query} onChange={setQuery} placeholder="Search recipes or ingredients" />
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
        {visibleRecipes.map((recipe) => (
          <article key={recipe.name} className="public-card rounded-[24px] bg-[#fffdf7] p-5 shadow-xl shadow-[#604117]/10 ring-1 ring-[#7d6033]/14">
            <div className="public-card-media h-40 rounded-2xl bg-[#f3ead3]">
              <img src={recipe.image} alt="" className="h-full w-full object-contain p-4" />
            </div>
            <h2 className="public-card-title mt-5 text-2xl font-black text-[#17250f]">{recipe.name}</h2>
            <p className="public-card-meta mt-2 text-sm font-semibold leading-6 text-[#4a4635]">{recipe.body[locale]}</p>
            <div className="public-price-block mt-5 rounded-3xl bg-[#edf5d9] p-4">
              <span className="public-card-meta text-xs font-black uppercase tracking-[0.14em] text-[#5a6235]">{t.cost}</span>
              <strong className="public-price-text mt-1 block text-2xl font-black text-[#1f4d25]">{recipe.cost}</strong>
            </div>
            <p className="public-accent-text mt-4 text-sm font-black text-[#245b2a]">
              {t.bestWith}: {recipe.crops}
            </p>
            <Link href="/marketplace" className="mt-5 inline-flex h-12 items-center gap-2 rounded-2xl bg-[#145c2a] px-5 text-sm font-black text-white">
              {t.cta} <ShoppingBasket size={16} />
            </Link>
          </article>
        ))}
        </div>
      </section>
    </Shell>
  );
}

export function ForecastPage() {
  const { locale } = useLocale();
  const t = copy[locale].forecast;

  return (
    <Shell>
      <PageHeader
        eyebrow={t.eyebrow}
        title={t.title}
        body={t.body}
        icon={<BarChart3 size={15} />}
        actions={<Link href="/marketplace" className="inline-flex min-h-11 items-center rounded-2xl bg-[#145c2a] px-5 text-sm font-black text-white">{t.cta}</Link>}
      />
      <section className="mx-auto grid max-w-[1320px] gap-6 px-5 pb-16 sm:px-8 lg:grid-cols-[1fr_0.8fr]">
        <div className="public-card rounded-[32px] bg-[#fffdf7] p-6 shadow-xl shadow-[#604117]/10 ring-1 ring-[#7d6033]/14">
          <div className="grid gap-4">
            {forecasts.map((item) => (
              <div key={item.crop} className="public-forecast-row rounded-3xl bg-[#f8f0dd] p-5 ring-1 ring-[#d8c8a8]">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="public-card-title text-2xl font-black text-[#17250f]">{item.crop}</h2>
                  <span className="public-status-pill rounded-full bg-[#edf5d9] px-4 py-2 text-sm font-black text-[#1f4d25]">
                    {t.confidence}: {item.confidence}
                  </span>
                </div>
                <p className="public-accent-text mt-3 text-sm font-black uppercase tracking-[0.12em] text-[#6a623f]">
                  {t.demand}: {item.demand}
                </p>
                <p className="public-card-meta mt-2 text-sm font-semibold leading-6 text-[#4a4635]">{item.note}</p>
              </div>
            ))}
          </div>
        </div>
        <aside className="rounded-[32px] bg-[#203525] p-7 text-[#fff8e8] shadow-xl shadow-[#604117]/10">
          <h2 className="text-3xl font-black">SARIMA-ready planning</h2>
          <p className="mt-3 text-sm font-semibold leading-6 text-[#eadfc3]">
            Buyers can preview seasonal movement. Sellers can sign in later for deeper planning, inventory, and forecast generation.
          </p>
          <Link href="/marketplace" className="mt-6 inline-flex h-12 items-center gap-2 rounded-2xl bg-[#f6d27a] px-5 text-sm font-black text-[#17250f]">
            {t.cta} <ArrowRight size={16} />
          </Link>
        </aside>
      </section>
    </Shell>
  );
}

export function PasigPage() {
  const { locale } = useLocale();
  const t = copy[locale].pasig;
  const { data: stores } = usePublicData<StoreRecord>("/api/stores");
  const [selectedName, setSelectedName] = useState<(typeof pasigPoints)[number]["name"] | null>(null);
  const farmerCounts = useMemo(() => {
    const counts = new Map<string, number>();

    for (const store of stores) {
      const seenBarangays = new Set<string>();
      for (const area of store.serviceAreas ?? []) {
        const name = area.barangay?.name?.replace(/^barangay\s+/i, "").trim();
        if (name) seenBarangays.add(name.toLowerCase());
      }
      for (const name of seenBarangays) {
        counts.set(name, (counts.get(name) ?? 0) + 1);
      }
    }

    return counts;
  }, [stores]);
  const selectedPoint = selectedName ? pasigPoints.find((point) => point.name === selectedName) ?? null : null;
  const selectedCount = selectedPoint ? farmerCounts.get(selectedPoint.name.toLowerCase()) ?? selectedPoint.farmers : 0;
  const hasLiveCounts = stores.length > 0;

  return (
    <Shell>
      <PageHeader
        eyebrow={t.eyebrow}
        title={t.title}
        body={t.body}
        icon={<MapPin size={15} />}
        actions={<Link href="/farmers" className="inline-flex min-h-11 items-center rounded-2xl bg-[#145c2a] px-5 text-sm font-black text-white">{t.cta}</Link>}
      />
      <section className="mx-auto max-w-[1440px] px-5 pb-16 sm:px-8">
        <div
          className="relative min-h-[720px] overflow-hidden rounded-[42px] bg-[#dcebbf] shadow-2xl shadow-[#604117]/14 ring-1 ring-[#7d6033]/14 lg:min-h-[820px]"
          onClick={() => setSelectedName(null)}
        >
          <img
            src={asset("pasig-interactive-map-base.svg")}
            alt="Illustrated Pasig map base with river, roads, and green farming areas"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_22%,rgba(255,244,204,0.24),transparent_26%),linear-gradient(180deg,rgba(255,249,236,0.02),rgba(255,249,236,0.14))]" />

          <div className="absolute left-5 top-5 z-30 rounded-full bg-[#fffdf7]/92 px-4 py-3 text-sm font-black text-[#245b2a] shadow-lg shadow-[#604117]/10 ring-1 ring-white/70 backdrop-blur sm:left-8 sm:top-8">
            {t.hint}
          </div>

          {selectedPoint ? (
            <div
              className="absolute right-5 top-5 z-50 w-[min(360px,calc(100%-40px))] rounded-[30px] bg-[#fffdf7]/96 p-5 shadow-xl shadow-[#604117]/14 ring-1 ring-white/70 backdrop-blur sm:right-8 sm:top-8 sm:p-6"
              onClick={(event) => event.stopPropagation()}
            >
              <span className="inline-flex items-center gap-2 rounded-full bg-[#edf5d9] px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-[#245b2a]">
                <MapPin size={14} /> {t.selected}
              </span>
              <h2 className="mt-3 text-3xl font-black text-[#17250f]">Barangay {selectedPoint.name}</h2>
              <div className="mt-5 rounded-3xl bg-[#f8f0dd] p-4 ring-1 ring-[#d8c8a8]">
                <strong className="block text-5xl font-black text-[#1f4d25]">{selectedCount}</strong>
                <span className="mt-1 block text-sm font-black text-[#3b392b]">{t.farmers}</span>
                {!hasLiveCounts ? <small className="mt-2 block text-xs font-bold text-[#7a6c4b]">{t.fallback}</small> : null}
              </div>
              <div className="mt-5 flex gap-3">
                <Link href="/farmers" className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-[#145c2a] px-5 text-sm font-black text-white">
                  {t.cta} <ArrowRight size={16} />
                </Link>
                <button
                  type="button"
                  onClick={() => setSelectedName(null)}
                  className="h-12 rounded-2xl bg-[#f8f0dd] px-4 text-sm font-black text-[#3b392b] ring-1 ring-[#d8c8a8]"
                >
                  Close
                </button>
              </div>
            </div>
          ) : null}

          {pasigPoints.map((point) => {
            const count = farmerCounts.get(point.name.toLowerCase()) ?? point.farmers;
            const isSelected = point.name === selectedPoint?.name;
            return (
              <button
                key={point.name}
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setSelectedName(point.name);
                }}
                aria-label={`Barangay ${point.name}, ${count} urban gardens`}
                aria-pressed={isSelected}
                className={`group absolute flex -translate-x-1/2 -translate-y-full flex-col items-center gap-2 text-center transition hover:-translate-y-[calc(100%+4px)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#f6d27a] ${
                  isSelected ? "z-40" : "z-20"
                }`}
                style={{ left: point.left, top: point.top }}
              >
                <span
                  className={`pointer-events-none whitespace-nowrap rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.12em] opacity-0 shadow-lg ring-1 transition group-hover:opacity-100 group-focus-visible:opacity-100 ${
                    isSelected
                      ? "bg-[#145c2a] text-white opacity-100 ring-[#145c2a]"
                      : "bg-[#fffdf7]/94 text-[#203819] ring-[#7d6033]/18 hover:bg-white"
                  }`}
                  style={{
                    transform: `translate(${point.labelDx ?? 0}px, ${point.labelDy ?? 0}px)`,
                  }}
                >
                  {point.name}
                </span>
                <span
                  className={`relative grid h-12 w-12 place-items-center rounded-full shadow-xl transition sm:h-14 sm:w-14 ${
                    isSelected ? "bg-[#f6d27a] text-[#17250f] shadow-[#604117]/24" : "bg-[#145c2a] text-white shadow-[#145c2a]/25"
                  }`}
                >
                  <MapPin size={28} fill="currentColor" strokeWidth={2.4} />
                  <span className="absolute -right-2 -top-2 grid h-7 min-w-7 place-items-center rounded-full bg-white px-2 text-xs font-black text-[#1f4d25] ring-1 ring-[#d8c8a8]">
                    {count}
                  </span>
                </span>
              </button>
            );
          })}

        </div>
      </section>
    </Shell>
  );
}
