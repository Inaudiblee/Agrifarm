"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Leaf,
  LockKeyhole,
  MapPin,
  Menu,
  ShieldCheck,
  ShoppingCart,
  Sprout,
  Star,
  Store,
  Truck,
  UserRound,
  X,
} from "lucide-react";
import { useLocale } from "@/components/locale-provider";
import { getAuthToken, getAuthUser, type AuthUser } from "@/lib/auth-storage";
import { getRoleHomeHref, isSeller } from "@/lib/auth-routing";

const CONTENT = "/assets/agrifarm-content";
const STORY = "/assets/agrifarm-story";

const content = {
  en: {
    language: "English",
    location: "Pasig City",
    login: "Log in",
    menu: "Menu",
    nav: ["Find farmers", "Meet farmers", "Meals", "In season", "Why AgriFarm"],
    hero: {
      eyebrow: "Fresh from your community",
      title: "Fresh Harvest Near You Today",
      body: "Buy fresh produce from trusted farmers in your barangay, or bring your own harvest to more local families.",
      buy: "Buy Fresh Produce",
      sell: "Sell Your Harvest",
      trust: "Verified local farmers",
      safety: "Safe transactions",
    },
    map: {
      eyebrow: "Find farmers",
      title: "Farmers Near You",
      body: "Choose a barangay to see how many farmers have fresh harvests today.",
      legend: ["Many farmers", "Some farmers", "Few farmers"],
      selected: "farmers available today",
    },
    farmers: {
      eyebrow: "Meet farmers",
      title: "Know Who Grows Your Food",
      body: "Real farmers, clear locations, and trusted community ratings.",
      view: "View Farm",
      selected: "Selected farm",
    },
    meals: {
      eyebrow: "Affordable meals",
      title: "Affordable Meals This Week",
      body: "Plan familiar family meals using today’s AgriFarm prices and available ingredients.",
      estimated: "Estimated ingredient cost",
      serves: "serves",
      available: "ingredients available",
      current: "Based on current market prices",
      view: "View Ingredients",
      hide: "Hide Ingredients",
    },
    trends: {
      eyebrow: "Today’s harvest guide",
      title: "Trending Crops & What’s in Season",
      body: "Simple demand and harvest guidance—no complicated charts.",
      season: "In season now",
    },
    journey: {
      eyebrow: "Farm to table",
      title: "From Harvest to Your Home",
      body: "Four clear steps keep every order simple.",
      steps: [
        ["Harvest", "Picked fresh"],
        ["Pack", "Packed safely"],
        ["Deliver", "Brought locally"],
        ["Home", "Enjoyed together"],
      ],
    },
    why: {
      eyebrow: "Why AgriFarm",
      title: "Good Food. Fair Trade. Stronger Communities.",
      body: "A marketplace designed around trust, clarity, and local livelihoods.",
      items: [
        ["Support local farmers", "Your purchase goes directly to Filipino farming families."],
        ["Fair prices", "Clear prices help buyers budget and farmers earn fairly."],
        ["Community impact", "Local buying keeps more value inside the community."],
        ["Safe transactions", "Verified accounts and clear order steps protect every purchase."],
      ],
      cta: "Start Buying Fresh Produce",
    },
    account: { buyer: "Buyer account", seller: "Seller account", continue: "Continue" },
  },
  fil: {
    language: "Tagalog",
    location: "Lungsod ng Pasig",
    login: "Mag-login",
    menu: "Menu",
    nav: ["Hanapin ang magsasaka", "Kilalanin sila", "Abot-kayang ulam", "Napapanahong ani", "Bakit AgriFarm"],
    hero: {
      eyebrow: "Sariwa mula sa inyong komunidad",
      title: "Sariwang Ani Malapit sa Inyo Ngayon",
      body: "Bumili ng sariwang produkto mula sa mapagkakatiwalaang magsasaka sa inyong barangay, o ibenta ang sariling ani sa mas maraming pamilya.",
      buy: "Bumili ng Sariwang Produkto",
      sell: "Ibenta ang Inyong Ani",
      trust: "Beripikadong lokal na magsasaka",
      safety: "Ligtas na transaksyon",
    },
    map: {
      eyebrow: "Hanapin ang magsasaka",
      title: "Mga Magsasakang Malapit sa Inyo",
      body: "Pumili ng barangay para makita kung ilang magsasaka ang may sariwang ani ngayon.",
      legend: ["Maraming magsasaka", "May ilang magsasaka", "Kaunting magsasaka"],
      selected: "magsasakang may ani ngayon",
    },
    farmers: {
      eyebrow: "Kilalanin ang magsasaka",
      title: "Alamin Kung Sino ang Nagtanim ng Inyong Pagkain",
      body: "Tunay na magsasaka, malinaw na lokasyon, at mapagkakatiwalaang rating.",
      view: "Tingnan ang Bukid",
      selected: "Napiling bukid",
    },
    meals: {
      eyebrow: "Abot-kayang ulam",
      title: "Abot-kayang Ulam Ngayong Linggo",
      body: "Magplano ng pamilyar na ulam gamit ang presyo ngayon at mga sangkap na available sa AgriFarm.",
      estimated: "Tinatayang halaga ng sangkap",
      serves: "para sa",
      available: "sangkap na available",
      current: "Batay sa presyo sa palengke ngayon",
      view: "Tingnan ang Sangkap",
      hide: "Itago ang Sangkap",
    },
    trends: {
      eyebrow: "Gabay sa ani ngayon",
      title: "Patok at Napapanahong Ani",
      body: "Simpleng gabay sa demand at ani—walang komplikadong chart.",
      season: "Napapanahon ngayon",
    },
    journey: {
      eyebrow: "Mula bukid hanggang hapag",
      title: "Mula Ani Hanggang sa Inyong Tahanan",
      body: "Apat na malinaw na hakbang para sa simpleng pag-order.",
      steps: [
        ["Ani", "Sariwang pinitas"],
        ["Balot", "Maingat na inihanda"],
        ["Hatid", "Direktang dinala"],
        ["Hapag", "Sama-samang kain"],
      ],
    },
    why: {
      eyebrow: "Bakit AgriFarm",
      title: "Masarap na Pagkain. Patas na Kita. Matatag na Komunidad.",
      body: "Pamilihang dinisenyo para sa tiwala, linaw, at lokal na kabuhayan.",
      items: [
        ["Suportahan ang lokal na magsasaka", "Ang inyong bayad ay direktang tumutulong sa pamilyang magsasaka."],
        ["Patas na presyo", "Malinaw na presyo para sa badyet ng mamimili at kita ng magsasaka."],
        ["Tulong sa komunidad", "Ang lokal na pamimili ay nagpapanatili ng halaga sa komunidad."],
        ["Ligtas na transaksyon", "Beripikadong account at malinaw na order para sa bawat pagbili."],
      ],
      cta: "Magsimulang Bumili ng Sariwang Produkto",
    },
    account: { buyer: "Account ng mamimili", seller: "Account ng seller", continue: "Magpatuloy" },
  },
} as const;

const barangays = [
  { name: "Pinagbuhatan", count: 23, level: "many", left: "24%", top: "25%" },
  { name: "Rosario", count: 12, level: "some", left: "58%", top: "20%" },
  { name: "Caniogan", count: 18, level: "many", left: "18%", top: "66%" },
  { name: "Santolan", count: 7, level: "few", left: "72%", top: "60%" },
  { name: "Manggahan", count: 9, level: "some", left: "48%", top: "76%" },
] as const;

const farmers = [
  { name: "Mang Juan", rating: "4.9", reviews: 120, location: "Caniogan, Pasig", image: `${CONTENT}/hero-farmer-produce.jpg`, position: "50% 38%" },
  { name: "Aling Rosa", rating: "4.8", reviews: 96, location: "Rosario, Pasig", image: `${CONTENT}/farmer-collective.jpg`, position: "28% 50%" },
  { name: "Mang Pedro", rating: "5.0", reviews: 150, location: "Pinagbuhatan, Pasig", image: `${CONTENT}/farmer-collective.jpg`, position: "53% 50%" },
  { name: "Aling Nena", rating: "4.7", reviews: 80, location: "Santolan, Pasig", image: `${CONTENT}/farmer-collective.jpg`, position: "76% 50%" },
] as const;

const meals = [
  { name: "Ginisang Monggo", cost: "₱120", serves: "4", available: "5/6", image: `${STORY}/meal-ginisang-monggo.png`, ingredients: ["Monggo", "Malunggay", "Kamatis", "Sibuyas", "Bawang"] },
  { name: "Pinakbet", cost: "₱160", serves: "4", available: "7/7", image: `${STORY}/meal-pinakbet.png`, ingredients: ["Kalabasa", "Talong", "Okra", "Sitaw", "Ampalaya", "Kamatis"] },
  { name: "Tinolang Manok", cost: "₱220", serves: "5", available: "6/7", image: `${STORY}/meal-tinola.png`, ingredients: ["Manok", "Sayote", "Malunggay", "Luya", "Sibuyas"] },
] as const;

const crops = [
  { name: "Kamatis", image: `${STORY}/crop-kamatis.png`, price: "₱35–₱45 / kilo", statusEn: "High demand", statusFil: "Mataas ang demand", forecastEn: "May become more expensive next week", forecastFil: "Maaaring tumaas ang presyo sa susunod na linggo" },
  { name: "Talong", image: `${STORY}/crop-talong.png`, price: "₱45–₱55 / kilo", statusEn: "In season now", statusFil: "Napapanahon ngayon", forecastEn: "Good supply is arriving", forecastFil: "Maraming paparating na ani" },
  { name: "Pechay", image: `${STORY}/crop-pechay.png`, price: "₱20–₱30 / tali", statusEn: "Steady demand", statusFil: "Pantay ang demand", forecastEn: "Expected to remain affordable", forecastFil: "Inaasahang mananatiling abot-kaya" },
  { name: "Mangga", image: `${CONTENT}/product-mango.jpg`, price: "₱80–₱100 / kilo", statusEn: "Harvest arriving soon", statusFil: "Malapit na ang anihan", forecastEn: "More harvests expected next week", forecastFil: "Mas maraming ani sa susunod na linggo" },
] as const;

const processIcons = [Sprout, CheckCircle2, Truck, UserRound];
const trustIcons = [Store, Leaf, UserRound, LockKeyhole];

function SectionHeading({ eyebrow, title, body }: { eyebrow: string; title: string; body: string }) {
  return (
    <div className="story-heading">
      <span>{eyebrow}</span>
      <h2>{title}</h2>
      <p>{body}</p>
    </div>
  );
}

export function AgrifarmLandingPage() {
  const { locale, setLocale } = useLocale();
  const t = content[locale];
  const [menuOpen, setMenuOpen] = useState(false);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [selectedBarangay, setSelectedBarangay] = useState<(typeof barangays)[number]>(barangays[0]);
  const [selectedFarmer, setSelectedFarmer] = useState<(typeof farmers)[number]>(farmers[0]);
  const [openMeal, setOpenMeal] = useState<string | null>(null);

  useEffect(() => {
    const token = getAuthToken();
    const user = getAuthUser();
    setAuthUser(token && user ? user : null);
  }, []);

  const accountHref = getRoleHomeHref(authUser);
  const accountLabel = authUser ? (isSeller(authUser) ? t.account.seller : t.account.buyer) : null;
  const navHrefs = ["#find-farmers", "#meet-farmers", "#meals", "#season", "#why"];

  return (
    <div className="story-landing">
      <header className="story-nav">
        <div className="story-shell story-nav-inner">
          <Link href="#home" className="story-logo" aria-label="AgriFarm home">
            <span className="story-logo-mark"><Leaf size={28} aria-hidden="true" /></span>
            <span><strong>AGRI<span>FARM</span></strong><small>Mula sa Bukid, Para sa Pamilya</small></span>
          </Link>

          <nav className="story-nav-links" aria-label="Main navigation">
            {t.nav.map((label, index) => <Link key={label} href={navHrefs[index]}>{label}</Link>)}
          </nav>

          <div className="story-nav-actions">
            <span className="story-location"><MapPin size={19} />{t.location}</span>
            <div className="story-language" aria-label="Language selector">
              <button type="button" aria-pressed={locale === "en"} onClick={() => setLocale("en")}>English</button>
              <button type="button" aria-pressed={locale === "fil"} onClick={() => setLocale("fil")}>Tagalog</button>
            </div>
            {authUser ? (
              <Link href={accountHref} className="story-login" aria-label={`${authUser.fullName}, ${accountLabel}`}>
                <UserRound size={20} />
                <span><strong>{authUser.fullName}</strong><small>{accountLabel}</small></span>
              </Link>
            ) : (
              <Link href="/login" className="story-login"><UserRound size={20} />{t.login}</Link>
            )}
            <button className="story-menu" type="button" aria-label={t.menu} aria-expanded={menuOpen} onClick={() => setMenuOpen(value => !value)}>
              {menuOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </div>
        <nav className={`story-mobile-menu ${menuOpen ? "is-open" : ""}`} aria-label="Mobile navigation">
          {t.nav.map((label, index) => <Link key={label} href={navHrefs[index]} onClick={() => setMenuOpen(false)}>{label}</Link>)}
          <span>{t.location}</span>
          <div className="story-language">
            <button type="button" aria-pressed={locale === "en"} onClick={() => setLocale("en")}>English</button>
            <button type="button" aria-pressed={locale === "fil"} onClick={() => setLocale("fil")}>Tagalog</button>
          </div>
        </nav>
      </header>

      <main>
        <section id="home" className="story-hero">
          <div className="story-shell story-hero-grid">
            <div className="story-hero-copy">
              <span className="story-kicker"><Sprout size={22} />{t.hero.eyebrow}</span>
              <h1>{t.hero.title}</h1>
              <p>{t.hero.body}</p>
              {authUser ? (
                <div className="story-session">
                  <span>{authUser.fullName}</span><strong>{accountLabel}</strong>
                  <Link href={accountHref}>{t.account.continue}<ArrowRight size={18} /></Link>
                </div>
              ) : null}
              <div className="story-hero-actions">
                <Link href="#find-farmers" className="story-button story-button-primary"><ShoppingCart size={24} />{t.hero.buy}<ArrowRight size={22} /></Link>
                <Link href="/register" className="story-button story-button-secondary"><Store size={24} />{t.hero.sell}</Link>
              </div>
              <div className="story-trust-line"><ShieldCheck size={26} /><span>{t.hero.trust}</span><i aria-hidden="true" /><LockKeyhole size={24} /><span>{t.hero.safety}</span></div>
            </div>
            <div className="story-hero-photo">
              <Image src={`${CONTENT}/hero-farmer-wide.png`} alt="Smiling Filipino farmer holding a basket of fresh vegetables" fill priority sizes="(max-width: 900px) 100vw, 52vw" />
            </div>
          </div>
        </section>

        <section id="find-farmers" className="story-section story-map-section">
          <div className="story-shell">
            <SectionHeading eyebrow={t.map.eyebrow} title={t.map.title} body={t.map.body} />
            <div className="story-map-wrap">
              <Image src={`${STORY}/barangay-map.png`} alt="Illustrated map of nearby Pasig barangays" fill sizes="(max-width: 900px) 96vw, 1200px" />
              {barangays.map(barangay => (
                <button key={barangay.name} type="button" className={`story-map-pin level-${barangay.level} ${selectedBarangay.name === barangay.name ? "is-selected" : ""}`} style={{ left: barangay.left, top: barangay.top }} onClick={() => setSelectedBarangay(barangay)} aria-label={`${barangay.name}, ${barangay.count} ${t.map.selected}`}>
                  <strong>{barangay.count}</strong><span>{barangay.name}</span>
                </button>
              ))}
            </div>
            <div className="story-map-footer">
              <div className="story-map-selected" aria-live="polite"><MapPin size={22} /><strong>{selectedBarangay.name}</strong><span>{selectedBarangay.count} {t.map.selected}</span></div>
              <ul className="story-legend">
                {t.map.legend.map((label, index) => <li key={label}><i className={`level-${["many", "some", "few"][index]}`} />{label}</li>)}
              </ul>
            </div>
          </div>
        </section>

        <section id="meet-farmers" className="story-section">
          <div className="story-shell">
            <SectionHeading eyebrow={t.farmers.eyebrow} title={t.farmers.title} body={t.farmers.body} />
            <div className="story-farmer-grid">
              {farmers.map(farmer => (
                <article key={farmer.name} className={`story-farmer-card ${selectedFarmer.name === farmer.name ? "is-selected" : ""}`}>
                  <div className="story-farmer-photo"><Image src={farmer.image} alt={`${farmer.name}, local farmer from ${farmer.location}`} fill sizes="(max-width: 650px) 92vw, (max-width: 1000px) 45vw, 23vw" style={{ objectPosition: farmer.position }} /></div>
                  <div className="story-farmer-body">
                    <h3>{farmer.name}</h3>
                    <div className="story-rating"><Star size={20} fill="currentColor" />{farmer.rating} <span>({farmer.reviews})</span></div>
                    <p><MapPin size={19} />{farmer.location}</p>
                    <button type="button" className="story-card-button" onClick={() => setSelectedFarmer(farmer)}>{t.farmers.view}<ArrowRight size={20} /></button>
                  </div>
                </article>
              ))}
            </div>
            <p className="story-selection" aria-live="polite"><CheckCircle2 size={21} />{t.farmers.selected}: <strong>{selectedFarmer.name}</strong>, {selectedFarmer.location}</p>
          </div>
        </section>

        <section id="meals" className="story-section story-meals-section">
          <div className="story-shell">
            <SectionHeading eyebrow={t.meals.eyebrow} title={t.meals.title} body={t.meals.body} />
            <div className="story-meal-grid">
              {meals.map(meal => {
                const expanded = openMeal === meal.name;
                return (
                  <article key={meal.name} className="story-meal-card">
                    <div className="story-meal-photo"><Image src={meal.image} alt={`${meal.name}, an affordable Filipino family meal`} fill sizes="(max-width: 700px) 92vw, 31vw" /></div>
                    <div className="story-meal-body">
                      <h3>{meal.name}</h3>
                      <span className="story-price-label">{t.meals.estimated}</span>
                      <strong className="story-meal-price">{meal.cost}</strong>
                      <div className="story-meal-meta"><span>{t.meals.serves} {meal.serves}</span><span>{meal.available} {t.meals.available}</span></div>
                      <small>{t.meals.current}</small>
                      <button type="button" className="story-card-button" aria-expanded={expanded} onClick={() => setOpenMeal(expanded ? null : meal.name)}>{expanded ? t.meals.hide : t.meals.view}<ArrowRight size={20} /></button>
                      {expanded ? <ul className="story-ingredients">{meal.ingredients.map(item => <li key={item}><CheckCircle2 size={17} />{item}</li>)}</ul> : null}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section id="season" className="story-section">
          <div className="story-shell">
            <SectionHeading eyebrow={t.trends.eyebrow} title={t.trends.title} body={t.trends.body} />
            <div className="story-crop-grid">
              {crops.map(crop => (
                <article key={crop.name} className="story-crop-card">
                  <div className="story-crop-image"><Image src={crop.image} alt={crop.name} fill sizes="(max-width: 650px) 44vw, 22vw" /></div>
                  <div className="story-crop-body">
                    <span><Sprout size={18} />{t.trends.season}</span>
                    <h3>{crop.name}</h3>
                    <strong>{crop.price}</strong>
                    <p>{locale === "en" ? crop.statusEn : crop.statusFil}</p>
                    <small>{locale === "en" ? crop.forecastEn : crop.forecastFil}</small>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="story-section story-journey-section">
          <div className="story-shell">
            <SectionHeading eyebrow={t.journey.eyebrow} title={t.journey.title} body={t.journey.body} />
            <ol className="story-process">
              {t.journey.steps.map((step, index) => {
                const Icon = processIcons[index];
                return <li key={step[0]}><span className="story-process-number">{index + 1}</span><div className="story-process-icon"><Icon size={54} /></div><strong>{step[0]}</strong><p>{step[1]}</p></li>;
              })}
            </ol>
          </div>
        </section>

        <section id="why" className="story-section story-why-section">
          <div className="story-shell">
            <SectionHeading eyebrow={t.why.eyebrow} title={t.why.title} body={t.why.body} />
            <div className="story-why-grid">
              {t.why.items.map((item, index) => {
                const Icon = trustIcons[index];
                return <article key={item[0]}><span><Icon size={34} /></span><h3>{item[0]}</h3><p>{item[1]}</p></article>;
              })}
            </div>
            <Link href="#find-farmers" className="story-button story-button-primary story-final-cta"><ShoppingCart size={24} />{t.why.cta}<ArrowRight size={22} /></Link>
          </div>
        </section>
      </main>

      <footer className="story-footer">
        <div className="story-shell"><strong>AGRIFARM</strong><span>Mula sa Bukid, Para sa Pamilya</span><p>© {new Date().getFullYear()} AgriFarm</p></div>
      </footer>
    </div>
  );
}
