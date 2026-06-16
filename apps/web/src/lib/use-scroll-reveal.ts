"use client";

import { useEffect } from "react";

/**
 * Activates IntersectionObserver-based scroll reveal for `.bh-reveal` elements.
 * Elements gain `.bh-visible` when they enter the viewport.
 */
export function useScrollReveal() {
  useEffect(() => {
    const targets = document.querySelectorAll<HTMLElement>(".bh-reveal");
    if (!targets.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("bh-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    targets.forEach((el) => io.observe(el));

    return () => io.disconnect();
  }, []);
}
