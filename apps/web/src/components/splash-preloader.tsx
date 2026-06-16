"use client";

import { useEffect, useState } from "react";
import { copy, type Locale } from "@/lib/i18n";
import { FarmerHarvestScene } from "./farmer-harvest-scene";

type Phase = "harvest" | "rise" | "language";

type SplashPreloaderProps = {
  onSelect: (locale: Locale) => void;
};

export function SplashPreloader({ onSelect }: SplashPreloaderProps) {
  const [phase, setPhase] = useState<Phase>("harvest");
  const [exiting, setExiting] = useState(false);
  const en = copy.en.splash;
  const fil = copy.fil.splash;

  useEffect(() => {
    const riseTimer = window.setTimeout(() => setPhase("rise"), 2600);
    const langTimer = window.setTimeout(() => setPhase("language"), 3600);
    return () => {
      window.clearTimeout(riseTimer);
      window.clearTimeout(langTimer);
    };
  }, []);

  function handlePick(locale: Locale) {
    setExiting(true);
    window.setTimeout(() => onSelect(locale), 450);
  }

  return (
    <div
      className={`splash-overlay fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden dot-pattern ${
        exiting ? "splash-overlay--exit" : ""
      }`}
      style={{
        background: "linear-gradient(180deg, #86efac 0%, #4ade80 35%, #15803d 70%, #14532d 100%)",
      }}
      role="dialog"
      aria-modal="true"
      aria-label={en.choose}
    >
      <div className="splash-logo mb-2 flex items-center gap-2 text-white">
        <span className="text-4xl">🌾</span>
        <span className="font-black text-3xl tracking-tight">
          Agri<span className="text-amber-300">Farm</span>
        </span>
      </div>

      <div
        className={`splash-scene-wrap relative w-full max-w-md px-6 ${
          phase === "rise" || phase === "language" ? "splash-scene-wrap--rise" : ""
        } ${phase === "language" ? "splash-scene-wrap--hidden" : ""}`}
      >
        <FarmerHarvestScene harvesting={phase === "harvest"} />
        {phase === "harvest" && (
          <div className="text-center mt-6 space-y-2">
            <p className="splash-loading-text text-white font-bold text-base m-0">{en.loading}</p>
            <p className="text-green-100 font-semibold text-sm m-0">{fil.loading}</p>
          </div>
        )}
      </div>

      {phase === "language" && (
        <div className="splash-lang-panel px-6 w-full max-w-lg">
          <h2 className="splash-lang-title text-center text-white font-black text-2xl m-0 mb-1">
            {en.choose}
          </h2>
          <p className="text-center text-green-100 font-semibold text-sm mb-2 m-0 px-2">
            {fil.chooseSub}
          </p>
          <p className="text-center text-green-50 text-sm mb-8 m-0 px-2">{en.chooseSub}</p>
          <div className="grid sm:grid-cols-2 gap-4">
            <button
              type="button"
              className="splash-lang-box"
              onClick={() => handlePick("en")}
            >
              <span className="splash-lang-flag">🇺🇸</span>
              <span className="splash-lang-label">{copy.en.lang.en.label}</span>
              <span className="splash-lang-sub">{copy.en.lang.en.sub}</span>
            </button>
            <button
              type="button"
              className="splash-lang-box"
              onClick={() => handlePick("fil")}
            >
              <span className="splash-lang-flag">🇵🇭</span>
              <span className="splash-lang-label">{copy.fil.lang.fil.label}</span>
              <span className="splash-lang-sub">{copy.fil.lang.fil.sub}</span>
            </button>
          </div>
        </div>
      )}

      <div className="splash-ground absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-emerald-950/40 to-transparent pointer-events-none" />
    </div>
  );
}
