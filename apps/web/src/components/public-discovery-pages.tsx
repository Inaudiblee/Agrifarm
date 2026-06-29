"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  ChefHat,
  Leaf,
  MapPin,
  Search,
  ShieldCheck,
  ShoppingBasket,
  Sprout,
  UsersRound,
} from "lucide-react";
import { LanguageSwitch } from "@/components/language-switch";
import { useLocale } from "@/components/locale-provider";
import { getApiBase, resolveMediaUrl } from "@/lib/api";

const asset = (name: string) => `/assets/agrifarm/${name}`;

type Product = {
  id: string;
  name: string;
  description?: string | null;
  store?: { name?: string | null; slug?: string | null } | null;
  variants?: Array<{ price: string | number; unit?: string | null; stockOnHand?: number | null }>;
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
      back: "Back to Home",
      marketplace: "Marketplace",
      farmers: "Farmers",
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
      eyebrow: "Urban farmers",
      title: "Meet the growers behind every harvest.",
      body: "Explore rooftop gardens, barangay service areas, and trusted seller profiles as a guest.",
      empty: "No active farmer stores yet. Featured community examples are shown below.",
      verified: "Verified farmer",
      products: "products",
      area: "Service area",
      cta: "View marketplace",
    },
    recipes: {
      eyebrow: "Delicious Filipino food",
      title: "Plan meals from what Pasig farmers can harvest.",
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
      cta: "Meet farmers",
      farmers: "farmers in this barangay",
      selected: "Selected barangay",
      hint: "Tap a pin to see how many farmers are connected there.",
      fallback: "Sample community count",
    },
  },
  fil: {
    nav: {
      back: "Bumalik sa Home",
      marketplace: "Pamilihan",
      farmers: "Magsasaka",
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
      eyebrow: "Urban na magsasaka",
      title: "Kilalanin ang growers sa likod ng bawat ani.",
      body: "Tingnan ang rooftop gardens, barangay service areas, at trusted seller profiles kahit guest.",
      empty: "Wala pang active farmer stores. Ipinapakita muna ang featured community examples.",
      verified: "Verified farmer",
      products: "produkto",
      area: "Service area",
      cta: "Tingnan ang pamilihan",
    },
    recipes: {
      eyebrow: "Masasarap na pagkaing Pilipino",
      title: "Magplano ng ulam mula sa ani ng Pasig farmers.",
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
      cta: "Kilalanin ang farmers",
      farmers: "magsasaka sa barangay na ito",
      selected: "Napiling barangay",
      hint: "Pindutin ang pin para makita kung ilang farmers ang konektado roon.",
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
    image: asset("maria-harvest-basket.png"),
  },
  {
    id: "rooftop",
    name: "Rooftop Greens PH",
    barangay: "Barangay Kapitolyo",
    products: 9,
    image: asset("farmer-watering.png"),
  },
  {
    id: "pasig",
    name: "Pasig Urban Farm",
    barangay: "Barangay Caniogan",
    products: 15,
    image: asset("hero-pasig-rooftop-farm.png"),
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
  const t = copy[locale];

  return (
    <main className="min-h-screen bg-[#fff9ec] text-[#17250f]">
      <header className="sticky top-0 z-40 border-b border-[#eadfca] bg-[#fff9ec]/88 backdrop-blur-xl">
        <nav className="mx-auto flex h-20 max-w-[1320px] items-center justify-between px-5 sm:px-8">
          <Link href="/" className="flex items-center gap-3" aria-label="AgriFarm home">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-[#ecf5dc] text-[#19602b] shadow-sm">
              <Leaf size={32} strokeWidth={2.4} />
            </span>
            <span className="leading-tight">
              <strong className="block text-2xl font-black text-[#0d5426]">AgriFarm</strong>
              <small className="hidden text-xs font-bold text-[#33452a] sm:block">From our farms, for our future.</small>
            </span>
          </Link>
          <div className="hidden items-center gap-7 text-sm font-bold lg:flex">
            <Link href="/marketplace">{t.nav.marketplace}</Link>
            <Link href="/farmers">{t.nav.farmers}</Link>
            <Link href="/recipes">{t.nav.recipes}</Link>
            <Link href="/forecast">{t.nav.forecast}</Link>
            <Link href="/pasig">{t.nav.pasig}</Link>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageSwitch compact />
            <Link href="/" className="hidden h-11 items-center gap-2 rounded-2xl bg-white/80 px-4 text-sm font-black ring-1 ring-black/5 sm:inline-flex">
              <ArrowLeft size={16} /> {t.nav.back}
            </Link>
            <Link href="/login" className="hidden h-11 items-center rounded-2xl bg-white/80 px-5 text-sm font-black ring-1 ring-black/5 md:inline-flex">
              {t.nav.login}
            </Link>
            <Link href="/register" className="inline-flex h-11 items-center rounded-2xl bg-[#145c2a] px-5 text-sm font-black text-white shadow-lg shadow-[#145c2a]/20">
              {t.nav.register}
            </Link>
          </div>
        </nav>
      </header>
      {children}
    </main>
  );
}

function Hero({
  eyebrow,
  title,
  body,
  image,
  icon,
}: {
  eyebrow: string;
  title: string;
  body: string;
  image: string;
  icon: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_18%,rgba(255,221,151,0.72),transparent_28%),linear-gradient(180deg,#fff9ec_0%,#f4edd8_100%)]" />
      <div className="relative mx-auto grid max-w-[1320px] items-center gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:py-16">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-white/78 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-[#365320] shadow-sm ring-1 ring-[#7d6033]/10">
            {icon} {eyebrow}
          </span>
          <h1 className="mt-5 max-w-3xl text-4xl font-black leading-tight tracking-tight text-[#143b18] sm:text-6xl">
            {title}
          </h1>
          <p className="mt-5 max-w-2xl text-lg font-medium leading-8 text-[#3a3729]">{body}</p>
        </div>
        <div className="relative min-h-[280px] overflow-hidden rounded-[34px] bg-[#edf0d8] shadow-2xl shadow-[#604117]/14 ring-1 ring-[#7d6033]/12 lg:min-h-[390px]">
          <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,249,236,0.28),rgba(255,249,236,0)_55%)]" />
        </div>
      </div>
    </section>
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

export function MarketplacePage() {
  const { locale } = useLocale();
  const t = copy[locale].marketplace;
  const { data: products, loading } = usePublicData<Product>("/api/products");
  const [query, setQuery] = useState("");
  const visibleProducts = useMemo(
    () =>
      products.filter((product) =>
        `${product.name} ${product.description ?? ""} ${product.store?.name ?? ""}`.toLowerCase().includes(query.toLowerCase())
      ),
    [products, query]
  );

  return (
    <Shell>
      <Hero
        eyebrow={t.eyebrow}
        title={t.title}
        body={t.body}
        image={asset("hero-pasig-rooftop-farm-composite.png")}
        icon={<ShoppingBasket size={15} />}
      />
      <section className="mx-auto max-w-[1320px] px-5 pb-16 sm:px-8">
        <div className="-mt-4 mb-8 flex max-w-xl items-center gap-3 rounded-3xl bg-white px-5 py-4 shadow-xl shadow-[#604117]/10 ring-1 ring-[#7d6033]/12">
          <Search size={20} className="text-[#246733]" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t.search}
            className="h-10 flex-1 bg-transparent text-base font-semibold outline-none placeholder:text-[#786d57]"
          />
        </div>
        {!loading && products.length === 0 ? <p className="mb-5 font-bold text-[#5b513d]">{t.empty}</p> : null}
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {(products.length ? visibleProducts : samples).map((item) => {
            const isLive = isProduct(item);
            const variant = isLive ? item.variants?.[0] : undefined;
            const price = isLive ? money(variant?.price) : item.price;
            const unit = isLive ? variant?.unit ?? t.fallbackUnit : item.unit;
            const storeName = isLive ? item.store?.name ?? t.fallbackStore : item.store;
            return (
              <article key={item.id} className="overflow-hidden rounded-3xl bg-[#fffdf7] shadow-lg shadow-[#604117]/8 ring-1 ring-[#7d6033]/14">
                <div className="h-48 bg-[#f3ead3]">
                  <img src={isLive ? productImage(item) : item.image} alt="" className="h-full w-full object-contain p-5" />
                </div>
                <div className="p-5">
                  <h2 className="text-xl font-black text-[#17250f]">{item.name}</h2>
                  <p className="mt-1 text-sm font-bold text-[#5a513d]">{storeName}</p>
                  <div className="mt-5 flex items-center justify-between gap-3">
                    <strong className="rounded-2xl bg-[#edf5d9] px-4 py-2 text-sm font-black text-[#1f4d25]">
                      {price} / {unit}
                    </strong>
                    <Link href="/login" className="inline-flex h-11 items-center rounded-2xl bg-[#145c2a] px-4 text-sm font-black text-white">
                      {t.cta}
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </Shell>
  );
}

export function FarmersPage() {
  const { locale } = useLocale();
  const t = copy[locale].farmers;
  const { data: stores, loading } = usePublicData<StoreRecord>("/api/stores");

  return (
    <Shell>
      <Hero
        eyebrow={t.eyebrow}
        title={t.title}
        body={t.body}
        image={asset("maria-rooftop-story.png")}
        icon={<UsersRound size={15} />}
      />
      <section className="mx-auto max-w-[1320px] px-5 pb-16 sm:px-8">
        {!loading && stores.length === 0 ? <p className="mb-5 font-bold text-[#5b513d]">{t.empty}</p> : null}
        <div className="grid gap-6 lg:grid-cols-3">
          {(stores.length ? stores : sampleFarmers).map((store, index) => {
            const isLive = isStoreRecord(store);
            const area = isLive ? store.serviceAreas?.[0]?.barangay?.name ?? "Pasig City" : store.barangay;
            const productCount = isLive ? store._count?.products ?? 0 : store.products;
            return (
              <article key={store.id} className="overflow-hidden rounded-[32px] bg-[#fffdf7] shadow-xl shadow-[#604117]/10 ring-1 ring-[#7d6033]/14">
                <div className="h-64 bg-[#edf0d8]">
                  <img
                    src={isLive ? [asset("maria-harvest-basket.png"), asset("farmer-watering.png"), asset("hero-pasig-rooftop-farm.png")][index % 3] : store.image}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <span className="inline-flex items-center gap-2 rounded-full bg-[#edf5d9] px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-[#245b2a]">
                    <ShieldCheck size={14} /> {t.verified}
                  </span>
                  <h2 className="mt-4 text-2xl font-black text-[#17250f]">{store.name}</h2>
                  <p className="mt-3 flex items-center gap-2 text-sm font-bold text-[#5a513d]">
                    <MapPin size={16} className="text-[#246733]" /> {t.area}: {area}
                  </p>
                  <p className="mt-2 text-sm font-bold text-[#5a513d]">
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

  return (
    <Shell>
      <Hero eyebrow={t.eyebrow} title={t.title} body={t.body} image={asset("recipe-kangkong.png")} icon={<ChefHat size={15} />} />
      <section className="mx-auto grid max-w-[1320px] gap-6 px-5 pb-16 sm:px-8 lg:grid-cols-3">
        {recipes.map((recipe) => (
          <article key={recipe.name} className="rounded-[32px] bg-[#fffdf7] p-5 shadow-xl shadow-[#604117]/10 ring-1 ring-[#7d6033]/14">
            <div className="h-56 rounded-3xl bg-[#f3ead3]">
              <img src={recipe.image} alt="" className="h-full w-full object-contain p-4" />
            </div>
            <h2 className="mt-5 text-2xl font-black text-[#17250f]">{recipe.name}</h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-[#4a4635]">{recipe.body[locale]}</p>
            <div className="mt-5 rounded-3xl bg-[#edf5d9] p-4">
              <span className="text-xs font-black uppercase tracking-[0.14em] text-[#5a6235]">{t.cost}</span>
              <strong className="mt-1 block text-2xl font-black text-[#1f4d25]">{recipe.cost}</strong>
            </div>
            <p className="mt-4 text-sm font-black text-[#245b2a]">
              {t.bestWith}: {recipe.crops}
            </p>
            <Link href="/marketplace" className="mt-5 inline-flex h-12 items-center gap-2 rounded-2xl bg-[#145c2a] px-5 text-sm font-black text-white">
              {t.cta} <ShoppingBasket size={16} />
            </Link>
          </article>
        ))}
      </section>
    </Shell>
  );
}

export function ForecastPage() {
  const { locale } = useLocale();
  const t = copy[locale].forecast;

  return (
    <Shell>
      <Hero eyebrow={t.eyebrow} title={t.title} body={t.body} image={asset("forecast-tablet.png")} icon={<BarChart3 size={15} />} />
      <section className="mx-auto grid max-w-[1320px] gap-6 px-5 pb-16 sm:px-8 lg:grid-cols-[1fr_0.8fr]">
        <div className="rounded-[32px] bg-[#fffdf7] p-6 shadow-xl shadow-[#604117]/10 ring-1 ring-[#7d6033]/14">
          <div className="grid gap-4">
            {forecasts.map((item) => (
              <div key={item.crop} className="rounded-3xl bg-[#f8f0dd] p-5 ring-1 ring-[#d8c8a8]">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-2xl font-black text-[#17250f]">{item.crop}</h2>
                  <span className="rounded-full bg-[#edf5d9] px-4 py-2 text-sm font-black text-[#1f4d25]">
                    {t.confidence}: {item.confidence}
                  </span>
                </div>
                <p className="mt-3 text-sm font-black uppercase tracking-[0.12em] text-[#6a623f]">
                  {t.demand}: {item.demand}
                </p>
                <p className="mt-2 text-sm font-semibold leading-6 text-[#4a4635]">{item.note}</p>
              </div>
            ))}
          </div>
        </div>
        <aside className="rounded-[32px] bg-[#203525] p-7 text-[#fff8e8] shadow-xl shadow-[#604117]/10">
          <img src={asset("forecast-tablet.png")} alt="" className="mx-auto h-56 w-full object-contain" />
          <h2 className="mt-6 text-3xl font-black">SARIMA-ready planning</h2>
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
      <Hero eyebrow={t.eyebrow} title={t.title} body={t.body} image={asset("pasig-map-illustration.png")} icon={<MapPin size={15} />} />
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
                aria-label={`Barangay ${point.name}, ${count} farmers`}
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
