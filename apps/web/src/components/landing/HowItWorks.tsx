import { steps } from "@/data/landing";
import { SectionTitle } from "./SectionTitle";

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="section-block section-block-bottom process-section relative w-full px-6 py-16 sm:px-10 lg:px-14"
    >
      <SectionTitle title="Paano Gumagana" />

      <div className="grid gap-5 lg:grid-cols-4">
        {steps.map((step, i) => (
          <article key={step.title} className="process-card relative">
            <div className="process-circle">
              <span className="number-badge">{i + 1}</span>
              <span className="process-rune" aria-hidden="true">
                {i + 1}
              </span>
            </div>

            {i < steps.length - 1 && (
              <span className="process-arrow hidden lg:block" aria-hidden="true" />
            )}

            <h3
              className="font-carved px-2 text-lg font-black uppercase leading-tight"
              style={{
                color: "#F5DDA2",
                textShadow: "0 2px 0 #2A1408, 0 5px 12px rgba(0,0,0,0.7)",
              }}
            >
              {step.title}
            </h3>

            <p
              className="mt-2 px-2 text-sm font-semibold leading-6"
              style={{ color: "#C8A058" }}
            >
              {step.description}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
