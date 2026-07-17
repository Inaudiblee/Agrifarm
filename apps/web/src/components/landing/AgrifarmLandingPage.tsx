"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  BarChart3,
  CloudRain,
  ChefHat,
  Leaf,
  MapPin,
  Moon,
  ShoppingBasket,
  Sprout,
  Sun,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import { LanguageSwitch } from "@/components/language-switch";
import { useLocale } from "@/components/locale-provider";
import { useTheme } from "@/components/theme-provider";
import { AccountMenu } from "@/components/account-menu";
import { CartMenu } from "@/components/cart-menu";
import { getAuthToken, getAuthUser, type AuthUser } from "@/lib/auth-storage";
import { getRoleHomeHref, getRoleLabel } from "@/lib/auth-routing";
import { AGRIFARM_LOGO_SRC } from "@/lib/brand-assets";

const asset = (name: string) => `/assets/agrifarm/${name}`;
const URBAN_GARDEN_IMAGE = asset("urban-garden.png");

const featureCards = [
  {
    id: "explore-farmers",
    title: "Explore Urban Gardens",
    body: "Discover urban gardens across Pasig barangays.",
    image: URBAN_GARDEN_IMAGE,
    icon: UsersRound,
    href: "/farmers",
  },
  {
    id: "feature-marketplace",
    title: "Fresh Marketplace",
    body: "Buy fresh, seasonal produce directly from urban gardens.",
    image: asset("marketplace-basket.png"),
    icon: ShoppingBasket,
    href: "/marketplace",
  },
  {
    id: "feature-recipes",
    title: "Delicious Food",
    body: "Cook healthy meals with local ingredients.",
    image: asset("recipe-kangkong.png"),
    icon: ChefHat,
    href: "/recipes",
  },
  {
    id: "forecast",
    title: "Smart Forecast",
    body: "Plan ahead with seasonal insights and demand forecasts.",
    image: asset("forecast-tablet.png"),
    icon: BarChart3,
    href: "/forecast",
  },
  {
    id: "pasig",
    title: "Explore Pasig",
    body: "Find farms and rooftop gardens near you.",
    image: asset("pasig-map-illustration.png"),
    icon: MapPin,
    href: "/pasig",
  },
];

const freshProducts = [
  {
    name: "Fresh Kangkong",
    farmer: "Maria's Garden",
    barangay: "Barangay Rosario",
    price: "PHP 35 / bundle",
    badge: "Fresh Today",
    image: asset("marketplace-basket.png"),
  },
  {
    name: "Pechay Harvest",
    farmer: "Rooftop Greens PH",
    barangay: "Barangay Kapitolyo",
    price: "PHP 45 / kilo",
    badge: "Rainy Season Pick",
    image: asset("recipe-ginisang-pechay.png"),
  },
  {
    name: "Talong Basket",
    farmer: "Pasig Urban Farm",
    barangay: "Barangay Caniogan",
    price: "PHP 60 / kilo",
    badge: "Best for Dinner",
    image: asset("recipe-tortang-talong.png"),
  },
  {
    name: "Pinakbet Bundle",
    farmer: "Rosario Growers",
    barangay: "Barangay Rosario",
    price: "PHP 180 / set",
    badge: "Family Bundle",
    image: asset("recipe-pinakbet.png"),
  },
];

const seasonalMeals = [
  {
    name: "Ginisang Pechay",
    body: "Quick, warm, and budget-friendly for rainy evenings.",
    crops: "Pechay, garlic, onion",
    cost: "PHP 95-PHP 130",
    serves: "Good for 3-4 people",
    image: asset("recipe-ginisang-pechay.png"),
  },
  {
    name: "Pinakbet",
    body: "A familiar vegetable dish that works well with mixed seasonal harvest.",
    crops: "Talong, okra, squash, sitaw",
    cost: "PHP 160-PHP 220",
    serves: "Good for 4-5 people",
    image: asset("recipe-pinakbet.png"),
  },
  {
    name: "Tortang Talong",
    body: "Comforting, easy to cook, and good for buyers looking for simple ulam.",
    crops: "Talong, egg, tomato",
    cost: "PHP 120-PHP 170",
    serves: "Good for 3-4 people",
    image: asset("recipe-tortang-talong.png"),
  },
];

const stats = [
  { value: "3", label: "Urban Gardens", image: URBAN_GARDEN_IMAGE },
  { value: "3", label: "Barangays Connected", image: asset("pasig-map-illustration.png") },
  { value: "5.2 Tons", label: "Harvested This Month", image: asset("marketplace-basket.png") },
];

const landingText = {
  en: {
    features: featureCards,
    products: freshProducts,
    meals: seasonalMeals,
    stats,
    nightStory: {
      headline: "Every barangay garden has a story.",
      body: "As Pasig lights turn on, AgriFarm highlights active urban gardens and nearby barangays where residents can discover fresh harvests.",
      scroll: "Scroll to explore tonight's garden highlights",
      label: "Tonight's Garden Highlights",
      title: "Good evening! Explore gardens around Barangay Rosario.",
      description: "See which barangays have active urban gardens and harvests ready for tonight's meals.",
      button: "Browse highlighted barangays",
    },
    morningStory: {
      headline: "Every barangay garden has a story.",
      body: "AgriFarm highlights urban gardens across Pasig so buyers can discover harvests, explore barangays, and plan a garden visit.",
      scroll: "Scroll to explore today's garden highlights",
      label: "Today's Harvest",
      title: "Good morning!\nPasig grows together.",
      description: "From rooftops to backyards, urban gardens in every barangay bring fresh food, stronger communities, and a greener Pasig.",
      button: "Explore Urban Gardens",
    },
    startJourney: "Start the Journey",
    browseMarketplace: "Browse Marketplace",
    browseProduce: "Browse all products",
    marketplaceEyebrow: "Fresh today in Pasig",
    marketplaceTitle: "See what you can buy right now.",
    marketplaceBody: "A quick buyer preview belongs here: real produce, familiar prices, and the urban garden behind each harvest.",
    mealEyebrow: "Rainy-season meal ideas",
    mealTitle: "Best and cheapest options food to cook at your home.",
    mealBody: "Around late June, buyers are thinking about warm, practical food. Recipes help them decide what to buy, not just what to browse.",
    estimatedCost: "Estimated cook cost",
    bestWith: "Best with:",
    discover: "Discover what's possible with AgriFarm",
    impactTitle: "Growing a better Pasig, together.",
    impactBody: "Every purchase supports urban gardens, stronger communities, and a sustainable future.",
    testimonial: "Every buy helps our community grow.",
    join: "Join the Movement",
    closing: {
      day: "The journey of every harvest begins with care.",
      night: "Every shared meal begins with the harvest.",
    },
  },
  fil: {
    features: [
      { ...featureCards[0], title: "Tuklasin ang Urban Gardens", body: "Tuklasin ang mga urban garden sa mga barangay ng Pasig." },
      { ...featureCards[1], title: "Sariwang Pamilihan", body: "Bumili ng seasonal produce direkta mula sa urban gardens." },
      { ...featureCards[2], title: "Masasarap na mga Putahe", body: "Magluto ng healthy meals gamit ang lokal na sangkap." },
      { ...featureCards[3], title: "Matalinong Pagtataya", body: "Magplano gamit ang impormasyon tungkol sa panahon at pagtataya ng demand." },
      { ...featureCards[4], title: "Tuklasin ang Pasig", body: "Humanap ng mga taniman na malapit sa inyo." },
    ],
    products: [
      { ...freshProducts[0], badge: "Sariwa Ngayon" },
      { ...freshProducts[1], badge: "Pinakamainam Ngayong Tag-ulan" },
      { ...freshProducts[2], badge: "Mainam sa Hapunan" },
      { ...freshProducts[3], badge: "Paketeng Pampamilya" },
    ],
    meals: [
      { ...seasonalMeals[0], body: "Mabilis, mainit, at budget-friendly para sa maulang gabi.", serves: "Para sa 3-4 tao" },
      { ...seasonalMeals[1], body: "Pamilyar na gulay dish para sa mixed seasonal harvest.", serves: "Para sa 4-5 tao" },
      { ...seasonalMeals[2], body: "Comfort food na madaling lutuin para sa simpleng ulam.", serves: "Para sa 3-4 tao" },
    ],
    stats: [
      { ...stats[0], label: "Urban Gardens" },
      { ...stats[1], label: "Barangay na Konektado" },
      { ...stats[2], label: "Ani Ngayong Buwan" },
    ],
    nightStory: {
      headline: "Bawat garden sa barangay ay may kwento.",
      body: "Habang umiilaw ang Pasig, itinatampok ng AgriFarm ang mga urban garden at kalapit na barangay kung saan makakakita ng sariwang ani ang mga residente.",
      scroll: "Mag-scroll para makita ang garden highlights ngayong gabi",
      label: "Garden Highlights Ngayong Gabi",
      title: "Magandang gabi! Tuklasin ang mga garden sa paligid ng Barangay Rosario.",
      description: "Tingnan kung aling mga barangay ang may active urban gardens at mga aning handa para sa hapunan ngayong gabi.",
      button: "Tingnan ang mga tampok na barangay",
    },
    morningStory: {
      headline: "Bawat garden sa barangay ay may kwento.",
      body: "Itinatampok ng AgriFarm ang mga urban garden sa buong Pasig para matuklasan ng mga buyer ang ani, mga barangay, at mga garden na puwedeng bisitahin.",
      scroll: "Mag-scroll para makita ang garden highlights ngayon",
      label: "Ani Ngayon",
      title: "Magandang umaga!\nSabay-sabay lumalago ang Pasig.",
      description: "Ang mga urban garden sa bawat barangay ay nagdadala ng sariwang pagkain, mas matibay na komunidad, at mas luntiang Pasig.",
      button: "Tuklasin ang Urban Gardens",
    },
    startJourney: "Simulan ang Paglalakbay",
    browseMarketplace: "Mamili sa Pamilihan",
    browseProduce: "Tingnan lahat ng Ani",
    marketplaceEyebrow: "Sariwa ngayon sa Pasig",
    marketplaceTitle: "Tingnan ang mga maaari mong bilhin ngayon.",
    marketplaceBody: "Narito ang mabilisang preview para sa mga mamimili—tunay na ani, abot-kayang presyo, at ang urban garden sa likod ng bawat ani.",
    mealEyebrow: "Mga Ideya sa Pagkain para sa Tag-ulan",
    mealTitle: "Mahalagang ipakita ang Filipino food recommendations.",
    mealBody: "Tuwing huling bahagi ng Hunyo, naghahanap ang buyers ng mainit at praktikal na ulam. Tinutulungan sila ng recipes na magdesisyon kung ano ang bibilhin.",
    estimatedCost: "Tinatayang Gastos sa Pagluluto",
    bestWith: "Pinakamainam Gamit ang:",
    discover: "Tuklasin ang posible sa AgriFarm",
    impactTitle: "Sabay nating palaguin ang mas magandang Pasig.",
    impactBody: "Bawat bili ay sumusuporta sa urban gardens, mas matibay na komunidad, at sustainable future.",
    testimonial: "Every buy helps our community grow.",
    join: "Sumali sa Paglalakbay",
    closing: {
      day: "Nagsisimula sa malasakit ang paglalakbay ng bawat ani.",
      night: "Nagsisimula sa ani ang bawat pinagsasaluhang pagkain.",
    },
  },
} as const;

export function AgrifarmLandingPage() {
  const { locale, copy: t } = useLocale();
  const { theme, setTheme } = useTheme();
  const [user, setUser] = useState<AuthUser | null>(null);
  const isNight = theme === "night";
  const landing = landingText[locale];

  const story = isNight
    ? {
        heroImage: asset("hero-pasig-rooftop-night-meal2.png"),
        ...landing.nightStory,
        storyImage: URBAN_GARDEN_IMAGE,
      }
    : {
        heroImage: asset("hero-pasig-rooftop-farm-composite1.png"),
        ...landing.morningStory,
        storyImage: URBAN_GARDEN_IMAGE,
      };

  useEffect(() => {
    const token = getAuthToken();
    const storedUser = getAuthUser();
    setUser(token && storedUser ? storedUser : null);
  }, []);

  return (
    <main
      data-landing-theme={isNight ? "night" : "morning"}
      className={`min-h-screen overflow-hidden transition-colors duration-500 ${
        isNight ? "bg-[#111a15] text-[#fff8e8]" : "bg-[#fff9ec] text-[#17250f]"
      }`}
    >
      <header
        className={`fixed inset-x-0 top-0 z-50 border-b backdrop-blur-xl transition-colors duration-500 ${
          isNight ? "border-white/10 bg-[#101914]/78" : "border-white/35 bg-[#fff9ec]/70"
        }`}
      >
        <nav className="mx-auto flex h-20 w-full max-w-[1500px] items-center justify-between px-5 sm:px-8 lg:px-10">
          <Link href="/" className="flex items-center gap-3" aria-label="AgriFarm home">
            <span
              className={`grid h-12 w-12 place-items-center overflow-hidden rounded-full shadow-sm ring-1 ${
                isNight ? "bg-white/10 ring-white/15" : "bg-[#ecf5dc] ring-[#145c2a]/10"
              }`}
            >
              <img className="h-[88%] w-[76%] object-contain" src={AGRIFARM_LOGO_SRC} alt="" aria-hidden="true" />
            </span>
            <span className="leading-tight">
              <strong
                className={`block text-2xl font-black tracking-tight sm:text-3xl ${
                  isNight ? "text-[#f7f0d7]" : "text-[#0d5426]"
                }`}
              >
                AgriFarm
              </strong>
              <small className={`hidden text-xs font-bold sm:block ${isNight ? "text-[#d7c99d]" : "text-[#33452a]"}`}>
                From our farms, for our future.
              </small>
            </span>
          </Link>

          <div
            className={`hidden items-center gap-5 text-sm font-semibold xl:flex ${
              isNight ? "text-[#f5ead0]" : "text-[#1f2b18]"
            }`}
          >
            <Link href="/marketplace">{t.landing.navLabels.marketplace}</Link>
            <Link href="/farmers">{t.landing.navLabels.farmers}</Link>
            <Link href="/recipes">{t.landing.navLabels.recipes}</Link>
            <Link href="/forecast">{t.landing.navLabels.forecast}</Link>
            <Link href="/pasig">{t.landing.navLabels.explorePasig}</Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageSwitch compact />
            <div
              className={`hidden h-12 items-center rounded-2xl p-1 ring-1 md:flex ${
                isNight ? "bg-white/10 ring-white/15" : "bg-white/80 ring-black/5"
              }`}
              aria-label="Choose landing story time"
            >
              <button
                type="button"
                onClick={() => setTheme("day")}
                className={`grid h-10 w-10 place-items-center rounded-xl transition ${
                  !isNight ? "bg-[#145c2a] text-white shadow-sm" : "text-[#f5ead0] hover:bg-white/10"
                }`}
                aria-label="Morning story"
                aria-pressed={!isNight}
              >
                <Sun size={18} />
              </button>
              <button
                type="button"
                onClick={() => setTheme("night")}
                className={`grid h-10 w-10 place-items-center rounded-xl transition ${
                  isNight ? "bg-[#f6d27a] text-[#182114] shadow-sm" : "text-[#17250f] hover:bg-[#edf5d9]"
                }`}
                aria-label="Night story"
                aria-pressed={isNight}
              >
                <Moon size={18} />
              </button>
            </div>
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
                  className={`hidden h-11 items-center rounded-2xl px-4 text-sm font-bold shadow-sm ring-1 transition hover:-translate-y-0.5 sm:inline-flex ${
                    isNight ? "bg-white/12 text-[#fff8e8] ring-white/12" : "bg-white/80 text-[#17250f] ring-black/5"
                  }`}
                >
                  {t.nav.login}
                </Link>
                <Link
                  href="/register"
                  className="inline-flex h-11 items-center rounded-2xl bg-[#145c2a] px-4 text-sm font-bold text-white shadow-lg shadow-[#145c2a]/20 transition hover:-translate-y-0.5"
                >
                  {t.nav.register}
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      <section className="relative min-h-screen overflow-hidden pt-20">
        <img
          src={story.heroImage}
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div
          className={`absolute inset-0 transition-colors duration-500 ${
            isNight
              ? "bg-[linear-gradient(105deg,rgba(8,17,14,0.92)_0%,rgba(8,17,14,0.70)_34%,rgba(8,17,14,0.22)_60%,rgba(8,17,14,0.02)_100%)]"
              : "bg-[linear-gradient(105deg,rgba(255,249,236,0.98)_0%,rgba(255,249,236,0.92)_28%,rgba(255,249,236,0.42)_48%,rgba(255,249,236,0.06)_73%)]"
          }`}
        />
        <div
          className={`absolute inset-0 ${
            isNight
              ? "bg-[radial-gradient(circle_at_18%_30%,rgba(255,207,112,0.28),transparent_25%),linear-gradient(180deg,rgba(6,16,22,0.10)_0%,rgba(8,17,14,0)_52%,rgba(8,17,14,0.76)_100%)]"
              : "bg-[radial-gradient(circle_at_18%_31%,rgba(255,230,174,0.76),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.10)_0%,rgba(255,249,236,0)_55%,rgba(19,47,18,0.42)_100%)]"
          }`}
        />
        <div
          className={`absolute inset-x-0 bottom-0 h-[30vh] ${
            isNight
              ? "bg-[linear-gradient(180deg,rgba(8,17,14,0)_0%,rgba(8,17,14,0.42)_45%,rgba(8,17,14,0.92)_100%)]"
              : "bg-[linear-gradient(180deg,rgba(255,249,236,0)_0%,rgba(47,82,29,0.26)_42%,rgba(22,53,24,0.72)_100%)]"
          }`}
        />

        <div className="relative z-10 mx-auto grid min-h-[calc(100vh-80px)] w-full max-w-[1500px] items-center gap-10 px-5 pb-32 pt-10 sm:px-8 lg:grid-cols-[0.92fr_1.08fr] lg:px-10">
          <div className="max-w-2xl">
            <h1
              className={`text-5xl font-black leading-[0.98] tracking-tight sm:text-7xl lg:text-[88px] ${
                isNight ? "text-[#fff8e8]" : "text-[#12310e]"
              }`}
            >
              {story.headline}
            </h1>
            <p
              className={`mt-6 max-w-md text-lg font-medium leading-8 sm:text-xl ${
                isNight ? "text-[#f2e6c9]" : "text-[#1f2b18]"
              }`}
            >
              {story.body}
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex h-16 items-center justify-center gap-3 rounded-2xl bg-[#145c2a] px-8 text-base font-extrabold text-white shadow-2xl shadow-[#145c2a]/25 transition hover:-translate-y-1"
              >
                {landing.startJourney} <Leaf size={20} fill="currentColor" />
              </Link>
              <Link
                href="/marketplace"
                className="inline-flex h-16 items-center justify-center rounded-2xl bg-white/80 px-8 text-base font-extrabold text-[#173113] shadow-xl shadow-black/10 ring-1 ring-[#69491c]/20 backdrop-blur transition hover:-translate-y-1"
              >
                {landing.browseMarketplace}
              </Link>
            </div>
            <div
              className={`mt-5 inline-flex h-12 items-center rounded-2xl p-1 ring-1 md:hidden ${
                isNight ? "bg-white/10 ring-white/15" : "bg-white/80 ring-black/5"
              }`}
              aria-label="Choose landing story time"
            >
              <button
                type="button"
                onClick={() => setTheme("day")}
                className={`inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-black transition ${
                  !isNight ? "bg-[#145c2a] text-white shadow-sm" : "text-[#f5ead0] hover:bg-white/10"
                }`}
                aria-pressed={!isNight}
              >
                <Sun size={17} /> Morning
              </button>
              <button
                type="button"
                onClick={() => setTheme("night")}
                className={`inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-black transition ${
                  isNight ? "bg-[#f6d27a] text-[#182114] shadow-sm" : "text-[#17250f] hover:bg-[#edf5d9]"
                }`}
                aria-pressed={isNight}
              >
                <Moon size={17} /> Night
              </button>
            </div>
            <div className="mt-20 hidden items-center gap-3 text-sm font-bold text-white drop-shadow lg:flex">
              <span>{story.scroll}</span>
              <span className="grid h-11 w-11 place-items-center rounded-full bg-white/85 text-[#173113]">
                <ArrowDown size={20} />
              </span>
            </div>
          </div>

          <div className="relative hidden min-h-[470px] lg:block lg:min-h-[650px]" aria-hidden="true" />
        </div>

        <div
          className={`absolute bottom-0 left-0 right-0 z-20 h-24 rounded-t-[60%] ${
            isNight ? "bg-[#111a15]" : "bg-[#fff9ec]"
          }`}
        />
      </section>

      <section id="farmers" className="relative z-30 -mt-24 px-5 sm:px-8">
        <div
          className={`mx-auto overflow-hidden rounded-[36px] shadow-2xl ring-1 ${
            isNight
              ? "bg-[#13231b] shadow-black/30 ring-white/10"
              : "bg-[#fffaf0] shadow-[#65461b]/15 ring-[#7a5b2f]/10"
          }`}
        >
          <div className="grid lg:grid-cols-[0.98fr_1.02fr]">
            <div className="relative flex items-center">
              <div
                className={`absolute inset-0 ${
                  isNight
                    ? "bg-[radial-gradient(circle_at_top_left,rgba(246,210,122,0.10),transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0))]"
                    : "bg-[radial-gradient(circle_at_top_left,rgba(255,214,120,0.24),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.82),rgba(255,250,240,0.94))]"
                }`}
              />
              <div className="relative z-10 w-full px-8 py-9 sm:px-10 sm:py-11 lg:px-12 lg:py-12">
                <span
                  className={`inline-flex items-center gap-3 rounded-full px-5 py-3 text-xs font-black uppercase tracking-[0.12em] ${
                    isNight ? "bg-[#f6d27a]/90 text-[#17250f]" : "bg-[#f7ebc7] text-[#365320]"
                  }`}
                >
                  <Sprout size={16} /> {story.label}
                </span>
                <h2
                  className={`mt-8 max-w-[11ch] whitespace-pre-line text-4xl font-black leading-[1.08] sm:text-[3.25rem] lg:text-[3.55rem] ${
                    isNight ? "text-[#fff8e8]" : "text-[#1d4727]"
                  }`}
                >
                  {story.title}
                </h2>
                <p
                  className={`mt-6 max-w-xl text-base font-medium leading-7 ${
                    isNight ? "text-[#e4d8bc]" : "text-[#374437]"
                  }`}
                >
                  {story.description}
                </p>

                <div className={`mt-8 grid gap-4 sm:grid-cols-3 ${isNight ? "text-[#f0e5ca]" : "text-[#2f4330]"}`}>
                  <StoryFeature icon={Leaf} title={locale === "fil" ? "Sariwang ani" : "Freshly harvested"} body={locale === "fil" ? "Mula sa lokal na gardeners" : "by local gardeners"} />
                  <StoryFeature icon={MapPin} title={locale === "fil" ? "Mula sa iba’t ibang barangay" : "From different barangays"} body={locale === "fil" ? "Mga garden na puwedeng puntahan" : "gardens you can explore"} />
                  <StoryFeature icon={UsersRound} title={locale === "fil" ? "Para sa mas malusog na pamilyang Pasigueño" : "For healthier Pasig families"} body={locale === "fil" ? "Komunidad na sabay-sabay lumalago" : "communities growing together"} />
                </div>

                <Link
                  href="/farmers"
                  className={`mt-8 inline-flex h-14 items-center gap-3 rounded-2xl px-6 text-sm font-extrabold shadow-lg ${
                    isNight
                      ? "bg-[#f0d47e] text-[#173113] shadow-black/20"
                      : "bg-[#2f6c36] text-white shadow-[#226b32]/20"
                  }`}
                >
                  {story.button} <ArrowRight size={22} />
                </Link>
              </div>
            </div>

            <div className="relative min-h-[300px] lg:min-h-[520px]">
              <img src="/assets/agrifarm/maria-rooftop-story2.png" alt="Urban garden highlights across Pasig" className="h-full w-full object-cover" />
              <div
                className={`absolute inset-y-0 left-0 w-28 sm:w-36 lg:w-44 ${
                  isNight
                    ? "bg-[linear-gradient(90deg,#13231b_0%,rgba(19,35,27,0.88)_28%,rgba(19,35,27,0)_100%)]"
                      : "bg-[linear-gradient(90deg,#fffaf0_0%,rgba(255,250,240,0.9)_28%,rgba(255,250,240,0)_100%)]"
                }`}
              />
            </div>
          </div>
        </div>
      </section>

      <section id="marketplace" className="px-5 py-16 sm:px-8 lg:py-20">
        <div className="mx-auto max-w-[1420px]">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-[#edf5d9] px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-[#365320]">
                <ShoppingBasket size={15} /> {landing.marketplaceEyebrow}
              </span>
              <h2
                className={`mt-4 text-3xl font-black tracking-tight sm:text-4xl ${
                  isNight ? "text-[#fff8e8]" : "text-[#19351b]"
                }`}
              >
                {landing.marketplaceTitle}
              </h2>
              <p className={`mt-3 max-w-2xl text-base font-medium leading-7 ${isNight ? "text-[#d8ceb2]" : "text-[#3b392b]"}`}>
                {landing.marketplaceBody}
              </p>
            </div>
            <Link
              href="/marketplace"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#145c2a] px-6 text-sm font-extrabold text-white shadow-lg shadow-[#145c2a]/20"
            >
              {landing.browseProduce} <ArrowRight size={17} />
            </Link>
          </div>

          <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {landing.products.map((product) => (
              <article
                key={product.name}
                className="overflow-hidden rounded-3xl bg-[#fffdf7] shadow-lg shadow-[#604117]/8 ring-1 ring-[#7d6033]/14 transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#604117]/14"
              >
                <div className="relative h-44 bg-[#f3ead3]">
                  <img src={product.image} alt="" className="h-full w-full object-contain p-4" />
                  <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[11px] font-black uppercase tracking-[0.12em] text-[#245b2a] shadow-sm">
                    {product.badge}
                  </span>
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-black text-[#17250f]">{product.name}</h3>
                      <p className="mt-1 text-sm font-semibold text-[#5a513d]">{product.farmer}</p>
                    </div>
                    <strong className="rounded-2xl bg-[#edf5d9] px-3 py-2 text-sm font-black text-[#1f4d25]">
                      {product.price}
                    </strong>
                  </div>
                  <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-[#4a4937]">
                    <MapPin size={16} className="text-[#246733]" />
                    {product.barangay}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="recipes" className="px-5 pb-16 sm:px-8 lg:pb-20">
        <div
          className={`mx-auto grid max-w-[1420px] gap-8 overflow-hidden rounded-[34px] p-7 shadow-xl ring-1 lg:grid-cols-[0.78fr_1.22fr] lg:p-10 ${
            isNight ? "bg-[#1b2c22] shadow-black/25 ring-white/10" : "bg-[#f4edd8] shadow-[#604117]/10 ring-[#7d6033]/10"
          }`}
        >
          <div className="flex flex-col justify-center">
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white/75 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-[#365320]">
              <CloudRain size={15} /> {landing.mealEyebrow}
            </span>
            <h2
              className={`mt-5 text-3xl font-black leading-tight sm:text-4xl ${
                isNight ? "text-[#fff8e8]" : "text-[#1f4d25]"
              }`}
            >
              {landing.mealTitle}
            </h2>
            <p className={`mt-4 text-base font-medium leading-7 ${isNight ? "text-[#d8ceb2]" : "text-[#353426]"}`}>
              {landing.mealBody}
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {landing.meals.map((meal) => (
              <article key={meal.name} className="rounded-3xl bg-white/70 p-4 shadow-lg shadow-[#604117]/8 ring-1 ring-white/70">
                <div className="h-40 rounded-2xl bg-[#fff8e7]">
                  <img src={meal.image} alt="" className="h-full w-full object-contain p-3" />
                </div>
                <h3 className="mt-4 text-lg font-black text-[#17250f]">{meal.name}</h3>
                <p className="mt-2 text-sm font-medium leading-6 text-[#464130]">{meal.body}</p>
                <div className="mt-4 rounded-2xl bg-[#fff8e7] p-3 ring-1 ring-[#d8c8a8]/70">
                  <span className="block text-[11px] font-black uppercase tracking-[0.14em] text-[#6a623f]">
                    {landing.estimatedCost}
                  </span>
                  <strong className="mt-1 block text-2xl font-black text-[#1f4d25]">{meal.cost}</strong>
                  <span className="text-xs font-bold text-[#5a513d]">{meal.serves}</span>
                </div>
                <div className="mt-4 rounded-2xl bg-[#edf5d9] px-3 py-2 text-xs font-bold text-[#1f4d25]">
                  {landing.bestWith} {meal.crops}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8 lg:py-20">
        <div className="mx-auto max-w-[1420px]">
          <h2 className={`text-3xl font-black tracking-tight sm:text-4xl ${isNight ? "text-[#fff8e8]" : "text-[#19351b]"}`}>
            {landing.discover}
          </h2>
          <div className="mt-7 grid gap-6 md:grid-cols-2 xl:grid-cols-5">
            {landing.features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Link
                  key={feature.title}
                  href={feature.href}
                  id={feature.id}
                  className="group scroll-mt-28 overflow-hidden rounded-3xl bg-[#fffdf7] shadow-lg shadow-[#604117]/8 ring-1 ring-[#7d6033]/14 transition duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#604117]/14"
                >
                  <div className="relative h-48 bg-[#f4ead3]">
                    <img src={feature.image} alt="" className="h-full w-full object-contain p-4 transition duration-300 group-hover:scale-105" />
                  </div>
                  <div className="p-6">
                    <div className="mb-4 flex items-center justify-between">
                      <Icon className="text-[#246733]" size={24} />
                      <span className="grid h-11 w-11 place-items-center rounded-full border border-[#9d8a63]/40 text-[#203819] transition group-hover:bg-[#246733] group-hover:text-white">
                        <ArrowRight size={18} />
                      </span>
                    </div>
                    <h3 className="text-xl font-black text-[#17250f]">{feature.title}</h3>
                    <p className="mt-3 text-sm font-medium leading-6 text-[#3b392b]">{feature.body}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-5 pb-20 sm:px-8">
        <div
          className={`mx-auto grid max-w-[1420px] gap-8 rounded-[32px] p-8 shadow-xl ring-1 lg:grid-cols-[1.05fr_1.4fr] lg:p-10 ${
            isNight ? "bg-[#203525] shadow-black/25 ring-white/10" : "bg-[#edf0d8] shadow-[#604117]/10 ring-[#7d6033]/10"
          }`}
        >
          <div>
            <h2 className={`text-3xl font-black leading-tight sm:text-4xl ${isNight ? "text-[#fff8e8]" : "text-[#1f4d25]"}`}>
              {landing.impactTitle}
            </h2>
            <p className={`mt-4 max-w-lg text-base font-medium leading-7 ${isNight ? "text-[#d8ceb2]" : "text-[#31311f]"}`}>
              {landing.impactBody}
            </p>
            <Link
              href="/register"
              className="mt-7 inline-flex h-14 items-center gap-3 rounded-2xl bg-[#226b32] px-7 text-sm font-extrabold text-white shadow-lg shadow-[#226b32]/20"
            >
              {landing.join} <Leaf size={18} fill="currentColor" />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {landing.stats.map((stat) => (
              <div key={stat.label} className="rounded-3xl bg-white/45 p-5 text-center ring-1 ring-white/60">
                <img src={stat.image} alt="" className="mx-auto h-14 w-14 object-contain" />
                <strong className="mt-4 block text-3xl font-black text-[#19351b]">{stat.value}</strong>
                <span className="text-sm font-semibold text-[#3e402d]">{stat.label}</span>
              </div>
            ))}
            <blockquote
              className={`flex min-h-[166px] flex-col justify-center rounded-3xl p-5 text-center ring-1 ${
                isNight ? "bg-[#f6d27a] text-[#17250f] ring-white/15" : "bg-white/45 text-[#1f4d25] ring-white/60"
              }`}
            >
              <span className="text-sm font-black uppercase tracking-[0.14em] text-current/70">Community</span>
              <strong className="mt-3 block text-2xl font-black leading-tight">"{landing.testimonial}"</strong>
            </blockquote>
          </div>
        </div>
      </section>

      <footer
        className={`relative overflow-hidden px-5 pb-12 pt-6 text-center sm:px-8 ${
          isNight ? "bg-[#111a15]" : "bg-[#fff9ec]"
        }`}
      >
        <div
          className={`absolute inset-x-0 top-0 h-24 ${
            isNight
              ? "bg-[linear-gradient(180deg,rgba(246,210,122,0.16),rgba(17,26,21,0))]"
              : "bg-[linear-gradient(180deg,rgba(226,215,170,0.55),rgba(255,249,236,0))]"
          }`}
        />
        <img
          src={asset("leafy-divider.png")}
          alt=""
          className="absolute -bottom-8 -left-6 h-32 w-32 rotate-[-18deg] object-contain opacity-85 sm:h-44 sm:w-44"
        />
        <img
          src={asset("leafy-divider.png")}
          alt=""
          className="absolute -bottom-8 -right-6 h-32 w-32 scale-x-[-1] rotate-[18deg] object-contain opacity-85 sm:h-44 sm:w-44"
        />
        <img
          src={asset("leafy-divider.png")}
          alt=""
          className="relative mx-auto h-20 w-20 rounded-full bg-white/70 object-contain p-3 shadow-lg ring-1 ring-[#7d6033]/10"
        />
        <p className={`relative mx-auto mt-5 max-w-md text-lg font-bold leading-7 ${isNight ? "text-[#fff8e8]" : "text-[#17250f]"}`}>
          {isNight ? landing.closing.night : landing.closing.day}
        </p>
      </footer>
    </main>
  );
}

function StoryFeature({
  icon: Icon,
  title,
  body,
}: {
  icon: LucideIcon;
  title: string;
  body: string;
}) {
  return (
    <div className="flex flex-col items-start gap-3 border-l border-[#d9d4c6] pl-4 first:border-l-0 first:pl-0">
      <span className="grid h-12 w-12 place-items-center rounded-full bg-[#f3efdc] text-[#3d7742] ring-1 ring-[#d9d2bc]">
        <Icon size={24} />
      </span>
      <div>
        <strong className="block text-base font-black leading-snug text-current">{title}</strong>
        <span className="mt-1 block text-sm font-medium leading-5 text-current/80">{body}</span>
      </div>
    </div>
  );
}
