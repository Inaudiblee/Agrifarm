"use client";

import { useState } from "react";
import { barangays, hero } from "@/data/landing";

export function HeroSection() {
  const [barangay, setBarangay] = useState(barangays[0]);

  return (
    <section
      id="home"
      className="hero-stage relative w-full overflow-hidden"
    >
      <div className="relative z-10 grid min-h-[620px] items-center gap-8 px-7 py-12 sm:px-12 lg:grid-cols-[0.92fr_1.08fr] lg:px-16 lg:py-16 xl:px-20">
        <div className="hero-copy-panel flex flex-col">
          <div className="hero-market-plaque">
            <span className="hero-market-seal" aria-hidden="true" />
            <span>{hero.eyebrow}</span>
          </div>

          <h1
            className="hero-title"
            style={{
              fontSize: "clamp(2.8rem, 7vw, 7.4rem)",
              display: "grid",
            }}
          >
            <span>Sariwang Ani</span>
            <span>Mula Sa Ating</span>
            <span className="hero-title-green">Barangay</span>
          </h1>

          <div className="tribal-rule my-7" aria-hidden="true" />

          <p className="hero-body-text">{hero.body}</p>

          <div className="shop-frame">
            <label htmlFor="barangay-select" className="shop-label">
              Piliin Ang Iyong Barangay
            </label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <select
                id="barangay-select"
                value={barangay}
                onChange={e => setBarangay(e.target.value)}
                className="wooden-select flex-1"
              >
                {barangays.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
              <a href="/shop" className="go-btn">
                Go Shopping
              </a>
            </div>
          </div>
        </div>

        <div className="hero-board flex items-center justify-center">
          <div className="hero-board-inner">
            <span className="hero-board-mark">Sariwang Ani</span>
            <span className="hero-board-line" />
            <p>
              Pumili ng barangay, mamili ng ani, at ipaabot ang sariwang produkto
              mula sa komunidad.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
