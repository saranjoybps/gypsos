"use client";

import { useId, useMemo, useState } from "react";
import { ScrubIn, WordReveal } from "@/components/motion/scroll-primitives";
import { estimate, inr, num, type PropertyType } from "@/lib/plaster-estimate";

const TYPES: { value: PropertyType; label: string }[] = [
  { value: "residential", label: "Residential" },
  { value: "commercial", label: "Commercial" },
];

export function CostCalculator() {
  const [type, setType] = useState<PropertyType>("residential");
  const [area, setArea] = useState("");
  const [touched, setTouched] = useState(false);
  const areaId = useId();
  const errorId = useId();

  const result = useMemo(() => estimate(type, area), [type, area]);
  const showError = (touched || area.trim() !== "") && !result.ok;

  return (
    <section id="calculator" className="plaster-grain relative overflow-hidden bg-sand px-6 py-28 text-graphite sm:py-36">
      <div className="relative z-10 mx-auto grid max-w-[1180px] grid-cols-[minmax(0,1fr)] gap-14 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-20">
        <div>
          <ScrubIn y={24}>
            <p className="text-[10px] font-medium uppercase tracking-[0.46em] text-graphite/70">Gypsum plaster cost calculator</p>
          </ScrubIn>
          <WordReveal text="Estimate your plastering cost in seconds." className="mt-5 font-serif text-[clamp(36px,4.8vw,72px)] font-medium leading-[1.04] text-graphite" />
          <ScrubIn y={24} className="mt-8 max-w-md text-[15px] leading-7 text-graphite/75">
            <p>Choose the property type, enter the total area, and the estimate updates instantly.</p>
          </ScrubIn>
        </div>

        <ScrubIn y={40}>
          <form className="bg-gypsum p-6 text-graphite sm:p-10" onSubmit={(e) => e.preventDefault()} noValidate aria-label="Cost calculator">
            <fieldset>
              <legend className="text-[11px] font-semibold uppercase tracking-[0.3em]">1. Property type</legend>
              <div className="mt-4 grid grid-cols-2 gap-0 border border-graphite/30" role="radiogroup" aria-label="Property type">
                {TYPES.map((item) => {
                  const active = type === item.value;
                  return (
                    <label
                      key={item.value}
                      className={`cursor-pointer px-4 py-3.5 text-center text-[12px] font-medium uppercase tracking-[0.22em] transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ochre ${
                        active ? "bg-graphite text-cream" : "bg-transparent text-graphite hover:bg-graphite/5"
                      }`}
                    >
                      <input type="radio" name="property-type" value={item.value} checked={active} onChange={() => setType(item.value)} className="sr-only" />
                      {item.label}
                    </label>
                  );
                })}
              </div>
            </fieldset>

            <div className="mt-8">
              <label htmlFor={areaId} className="text-[11px] font-semibold uppercase tracking-[0.3em]">
                2. Total area (sq. ft.)
              </label>
              <div className="mt-4 flex items-stretch border border-graphite/30 focus-within:border-ochre-deep focus-within:outline focus-within:outline-2 focus-within:outline-ochre/60">
                <input
                  id={areaId}
                  inputMode="decimal"
                  autoComplete="off"
                  placeholder="e.g. 1200"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  onBlur={() => setTouched(true)}
                  aria-invalid={showError}
                  aria-describedby={showError ? errorId : undefined}
                  className="min-w-0 flex-1 bg-transparent px-4 py-4 font-serif text-[28px] outline-none placeholder:text-graphite/30"
                />
                <span className="grid place-items-center border-l border-graphite/20 px-4 text-[12px] uppercase tracking-[0.2em] text-graphite/60">sq. ft.</span>
              </div>
              <p id={errorId} className="mt-2 min-h-[20px] text-[13px] font-medium text-red-700" role={showError ? "alert" : undefined}>
                {showError && !result.ok ? result.error : ""}
              </p>
            </div>

            <div className="mt-4 border-t border-graphite/20 pt-6" aria-live="polite">
              {result.ok ? (
                <dl className="space-y-3 text-[14px]">
                  <Row label="Property type" value={result.type === "residential" ? "Residential" : "Commercial"} />
                  <Row label="Area entered" value={`${num(result.area)} sq. ft.`} />
                  <div className="flex items-end justify-between gap-4 border-t border-graphite/20 pt-5">
                    <dt className="text-[11px] font-semibold uppercase tracking-[0.3em]">Estimated total</dt>
                    <dd key={result.total} className="total-pop font-serif text-[clamp(34px,4vw,52px)] font-semibold leading-none text-ochre-deep" data-testid="estimate-total">
                      {inr(result.total)}
                    </dd>
                  </div>
                </dl>
              ) : (
                <p className="text-[14px] leading-6 text-graphite/60">Enter the area above to see your estimate.</p>
              )}
            </div>

            <p className="mt-8 border-l-4 border-red-600 bg-red-50 px-4 py-3 text-[13px] font-semibold leading-6 text-red-700" role="note">
              Disclaimer: This calculator provides an approximate cost estimation only. Actual pricing may vary depending on site measurements, site conditions,
              material requirements and other project-specific factors. Final pricing will be confirmed after proper site measurement and assessment.
            </p>
            <a href="#contact" className="mt-6 inline-block bg-graphite px-7 py-3.5 text-[11px] font-medium uppercase tracking-[0.26em] text-cream transition-colors btn-sweep [--sweep:var(--color-ochre-deep)]">
              Request a site assessment
            </a>
          </form>
        </ScrubIn>
      </div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-graphite/65">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}
