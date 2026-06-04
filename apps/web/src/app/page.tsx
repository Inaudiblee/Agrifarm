"use client";

import { useState } from "react";

type Language = "tl" | "en";

const copy = {
  tl: {
    nav: {
      how: "Gabay",
      audience: "Gamitin",
      help: "Tulong",
      login: "Log in",
      start: "Magsimula",
    },
    hero: {
      eyebrow: "Agrifarm Marketplace",
      title: "Sariwang ani mula sa malapit na magsasaka.",
      text: "Pumili ng Tagalog o English, tingnan ang presyo nang malinaw, at sundan ang simpleng hakbang hanggang makabili o makapagbenta.",
      primary: "Mamili ngayon",
      secondary: "Paano gamitin",
      alt: "Agrifarm marketplace scene with crops, farmer, and simple mobile order screen",
    },
    quick: [
      { value: "3", label: "madaling hakbang" },
      { value: "2", label: "wika: Tagalog at English" },
      { value: "0", label: "mahirap na setup" },
    ],
    how: {
      label: "Simple ang proseso",
      title: "Ginawa para sa unang beses gagamit.",
      steps: [
        {
          title: "Piliin ang produkto",
          text: "Makikita agad ang pangalan, presyo, dami, at lugar ng produkto.",
        },
        {
          title: "I-check ang order",
          text: "Malaki ang buttons at malinaw kung magkano ang babayaran.",
        },
        {
          title: "Sundin ang abiso",
          text: "May update kung ihahanda, kukunin, o ihahatid ang ani.",
        },
      ],
    },
    actions: [
      {
        label: "Para sa mamimili",
        title: "Bumili nang hindi nalilito.",
        text: "Para sa pamilya, tindahan, at karinderya na gusto ng sariwa at lokal na produkto.",
        button: "Bumili",
      },
      {
        label: "Para sa magsasaka",
        title: "Ipakita ang ani sa mas maraming tao.",
        text: "Ilagay ang produkto, presyo, dami, at lugar nang malinaw para madaling mahanap.",
        button: "Magbenta",
      },
      {
        label: "Para sa baguhan",
        title: "May gabay sa bawat hakbang.",
        text: "Kung hindi sanay sa app, simple ang salita at malinaw ang susunod na pipindutin.",
        button: "Humingi ng tulong",
      },
    ],
    help: {
      label: "Mas madaling basahin",
      title: "Malaki ang letra, konti ang kailangan pindutin.",
      text: "Ang design ay nakatutok sa malinaw na presyo, madaling order, at language choice bago pa magsimula.",
      bullets: ["Tagalog at English", "Malalaking action buttons", "Diretsong salita"],
    },
  },
  en: {
    nav: {
      how: "Guide",
      audience: "Use it",
      help: "Help",
      login: "Log in",
      start: "Start",
    },
    hero: {
      eyebrow: "Agrifarm Marketplace",
      title: "Fresh harvests from nearby farmers.",
      text: "Choose Tagalog or English, read prices clearly, and follow simple steps to buy or sell local produce.",
      primary: "Shop now",
      secondary: "How it works",
      alt: "Agrifarm marketplace scene with crops, farmer, and simple mobile order screen",
    },
    quick: [
      { value: "3", label: "easy steps" },
      { value: "2", label: "languages: Tagalog and English" },
      { value: "0", label: "difficult setup" },
    ],
    how: {
      label: "Simple process",
      title: "Made for first-time users.",
      steps: [
        {
          title: "Choose a product",
          text: "See the product name, price, quantity, and location right away.",
        },
        {
          title: "Check the order",
          text: "Buttons are large and the total amount is easy to understand.",
        },
        {
          title: "Follow the update",
          text: "Get updates when the harvest is prepared, picked up, or delivered.",
        },
      ],
    },
    actions: [
      {
        label: "For buyers",
        title: "Buy without confusion.",
        text: "For families, stores, and food businesses that want fresh local products.",
        button: "Buy",
      },
      {
        label: "For farmers",
        title: "Show your harvest to more people.",
        text: "List the product, price, quantity, and location clearly so buyers can find it.",
        button: "Sell",
      },
      {
        label: "For beginners",
        title: "Guided every step.",
        text: "If apps feel unfamiliar, the words are simple and the next button is clear.",
        button: "Ask for help",
      },
    ],
    help: {
      label: "Easier to read",
      title: "Large text, fewer things to press.",
      text: "The design focuses on clear prices, easy ordering, and language choice before users begin.",
      bullets: ["Tagalog and English", "Large action buttons", "Plain words"],
    },
  },
} as const;

export default function HomePage() {
  const [language, setLanguage] = useState<Language>("tl");
  const t = copy[language];

  return (
    <main className="min-h-screen bg-[#f6f7f1] text-[#14332b]">
      <section
        aria-label="Agrifarm landing page"
        className="relative min-h-screen overflow-hidden bg-[#14332b] text-white"
      >
        <img
          alt={t.hero.alt}
          className="absolute inset-0 h-full w-full object-cover"
          src="/market-hero-wide.png"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(15,47,39,0.92),rgba(15,47,39,0.72)_42%,rgba(15,47,39,0.12)_78%)]" />

        <header className="relative z-10 mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-6 sm:px-8">
          <a className="text-2xl font-black tracking-normal" href="#">
            Agrifarm
          </a>
          <nav className="hidden items-center gap-8 text-sm font-bold text-white/85 md:flex">
            <a href="#gabay">{t.nav.how}</a>
            <a href="#gamitin">{t.nav.audience}</a>
            <a href="#tulong">{t.nav.help}</a>
          </nav>
          <div className="flex items-center gap-3">
            <LanguagePicker language={language} setLanguage={setLanguage} />
            <a
              className="hidden text-sm font-black text-white/90 sm:inline-flex"
              href="/login"
            >
              {t.nav.login}
            </a>
            <a
              className="rounded-full bg-[#f2b23d] px-5 py-3 text-sm font-black text-[#211600] shadow-lg shadow-black/15"
              href="/register"
            >
              {t.nav.start}
            </a>
          </div>
        </header>

        <div className="relative z-10 mx-auto flex min-h-[calc(100vh-96px)] max-w-7xl items-center px-5 pb-28 sm:px-8">
          <div className="max-w-3xl">
            <p className="mb-5 inline-flex border-l-4 border-[#f2b23d] bg-white/10 px-4 py-2 text-sm font-black uppercase tracking-normal text-[#f7d78a] backdrop-blur">
              {t.hero.eyebrow}
            </p>
            <h1 className="max-w-3xl text-5xl font-black leading-[1.02] tracking-normal sm:text-6xl lg:text-7xl">
              {t.hero.title}
            </h1>
            <p className="mt-6 max-w-2xl text-xl leading-8 text-white/86">
              {t.hero.text}
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a
                className="rounded-full bg-[#f2b23d] px-8 py-4 text-center text-base font-black text-[#211600] shadow-xl shadow-black/20"
                href="/register"
              >
                {t.hero.primary}
              </a>
              <a
                className="rounded-full border-2 border-white/70 bg-white/10 px-8 py-4 text-center text-base font-black text-white backdrop-blur"
                href="#gabay"
              >
                {t.hero.secondary}
              </a>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 z-10 bg-white/96 text-[#14332b] shadow-2xl shadow-black/20 backdrop-blur">
          <div className="mx-auto grid max-w-7xl gap-px px-5 py-5 sm:grid-cols-3 sm:px-8">
            {t.quick.map((item) => (
              <div className="py-2 sm:px-6" key={item.label}>
                <strong className="block text-3xl font-black text-[#1f6b45]">
                  {item.value}
                </strong>
                <span className="text-sm font-bold text-[#4d615c]">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-20" id="gabay">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div>
              <p className="text-sm font-black uppercase text-[#b16428]">
                {t.how.label}
              </p>
              <h2 className="mt-4 text-4xl font-black leading-tight text-[#14332b] sm:text-5xl">
                {t.how.title}
              </h2>
            </div>
            <div className="grid gap-4">
              {t.how.steps.map((step, index) => (
                <article
                  className="grid gap-4 border-t border-[#dce6da] py-6 sm:grid-cols-[72px_1fr]"
                  key={step.title}
                >
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#dbeed6] text-xl font-black text-[#1f6b45]">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="text-2xl font-black text-[#14332b]">
                      {step.title}
                    </h3>
                    <p className="mt-2 max-w-2xl text-lg leading-8 text-[#4d615c]">
                      {step.text}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#eef3ea] py-20" id="gamitin">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-5 lg:grid-cols-3">
            {t.actions.map((item) => (
              <article
                className="rounded-lg bg-white p-7 shadow-sm ring-1 ring-[#dce6da]"
                key={item.title}
              >
                <p className="text-sm font-black uppercase text-[#2f7296]">
                  {item.label}
                </p>
                <h3 className="mt-4 text-3xl font-black leading-tight text-[#14332b]">
                  {item.title}
                </h3>
                <p className="mt-4 min-h-28 text-base leading-7 text-[#4d615c]">
                  {item.text}
                </p>
                <a
                  className="mt-6 inline-flex rounded-full bg-[#14332b] px-6 py-3 text-sm font-black text-white"
                  href="#tulong"
                >
                  {item.button}
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#14332b] py-20 text-white" id="tulong">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="text-sm font-black uppercase text-[#f2b23d]">
              {t.help.label}
            </p>
            <h2 className="mt-4 text-4xl font-black leading-tight sm:text-5xl">
              {t.help.title}
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-white/78">
              {t.help.text}
            </p>
          </div>
          <div className="grid gap-3">
            {t.help.bullets.map((bullet) => (
              <div
                className="rounded-lg border border-white/15 bg-white/8 px-5 py-4 text-lg font-black backdrop-blur"
                key={bullet}
              >
                {bullet}
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function LanguagePicker({
  language,
  setLanguage,
}: {
  language: Language;
  setLanguage: (language: Language) => void;
}) {
  return (
    <div
      aria-label="Choose language"
      className="flex rounded-full border border-white/20 bg-white/14 p-1 shadow-sm backdrop-blur"
      role="group"
    >
      {[
        ["tl", "Tagalog"],
        ["en", "English"],
      ].map(([value, label]) => {
        const isActive = language === value;

        return (
          <button
            aria-pressed={isActive}
            className={`rounded-full px-4 py-2 text-sm font-black transition ${
              isActive
                ? "bg-white text-[#14332b]"
                : "text-white hover:bg-white/12"
            }`}
            key={value}
            onClick={() => setLanguage(value as Language)}
            type="button"
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
