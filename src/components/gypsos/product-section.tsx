"use client";

import { ArrowRight, Check } from "lucide-react";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { BagImage } from "@/components/gypsos/bag-image";
import { ScrubIn, WordReveal, useDesktop, useReduced } from "@/components/motion/scroll-primitives";

const APPLICATIONS = ["Residential buildings", "Commercial buildings", "Apartments", "Interior walls", "Ceilings", "Suitable renovation projects"];

const BENEFITS = [
  "Smooth, uniform surface finish",
  "Quick, even application on interior walls and ceilings",
  "Less surface preparation before finishing, where appropriate",
  "Affordable, cost-effective plastering",
  "Consistent quality from bag to bag",
];

export function ProductSection() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReduced();
  const desktop = useDesktop();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });

  // Bag arrives from the lower right, tilted, and settles upright; the tilted backdrop turns against it.
  const k = desktop ? 1 : 0.55;
  const bagY = useTransform(scrollYProgress, [0, 0.35, 1], [`${26 * k}svh`, "0svh", `${-8 * k}svh`]);
  const bagX = useTransform(scrollYProgress, [0, 0.35, 1], [`${18 * k}vw`, "0vw", "0vw"]);
  const bagRotate = useTransform(scrollYProgress, [0, 0.35, 1], [14, -3, -6]);
  const plateRotate = useTransform(scrollYProgress, [0, 1], [-28, 14]);
  const plateY = useTransform(scrollYProgress, [0, 1], ["10svh", "-6svh"]);
  const live = !reduce;

  return (
    <section id="product" ref={ref} aria-labelledby="product-title" className="plaster-grain relative overflow-hidden bg-bone px-6 py-28 sm:py-36">
      <div className="relative z-10 mx-auto grid max-w-[1180px] items-center gap-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
        <div>
          <ScrubIn y={24}>
            <p className="text-[10px] font-medium uppercase tracking-[0.46em] text-ochre-deep">Our product</p>
          </ScrubIn>
          <h2 id="product-title" className="sr-only">
            GYPSOS Premium Grade Gypsum Plaster
          </h2>
          <WordReveal
            as="p"
            text="GYPSOS Premium Grade Gypsum Plaster"
            className="mt-5 font-serif text-[clamp(40px,5.4vw,84px)] font-medium leading-[1] text-graphite"
          />

          <ScrubIn y={28} className="mt-8 max-w-[560px] space-y-4 text-[15px] leading-[1.85] text-ink/85">
            <p>
              A premium-grade gypsum plaster for interior wall and ceiling plastering, developed to give a smooth, uniform finish at an affordable cost.
            </p>
            <p>
              Gypsum plaster sets to a smooth surface and can typically be applied in a more even coat than conventional cement-sand plaster, often with less surface
              preparation before the final finish. Results depend on the base surface, site conditions and application method.
            </p>
          </ScrubIn>

          <div className="mt-10 grid gap-10 sm:grid-cols-2">
            <ScrubIn y={24}>
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.3em] text-graphite">Intended applications</h3>
              <ul className="mt-4 space-y-2.5">
                {APPLICATIONS.map((item) => (
                  <li key={item} className="flex gap-3 text-[14px] leading-6 text-ink/85">
                    <ArrowRight size={15} strokeWidth={1.5} className="mt-[5px] shrink-0 text-ochre-deep" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </ScrubIn>
            <ScrubIn y={24}>
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.3em] text-graphite">Key benefits</h3>
              <ul className="mt-4 space-y-2.5">
                {BENEFITS.map((item) => (
                  <li key={item} className="flex gap-3 text-[14px] leading-6 text-ink/85">
                    <Check size={15} strokeWidth={1.8} className="mt-[5px] shrink-0 text-ochre-deep" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </ScrubIn>
          </div>

          <ScrubIn y={20} className="mt-12 flex flex-wrap items-center gap-4">
            <a href="#calculator" className="inline-flex items-center gap-3 bg-graphite px-7 py-3.5 text-[11px] font-medium uppercase tracking-[0.26em] text-cream transition-colors btn-sweep [--sweep:var(--color-ochre-deep)]">
              Estimate your cost <ArrowRight size={14} strokeWidth={1.5} aria-hidden="true" />
            </a>
            <a href="#contact" className="inline-flex items-center border border-graphite/40 px-7 py-3.5 text-[11px] font-medium uppercase tracking-[0.26em] text-graphite transition-colors btn-sweep [--sweep:var(--color-graphite)] hover:text-cream">
              Send an enquiry
            </a>
          </ScrubIn>
          <p className="mt-6 max-w-[520px] text-[12px] leading-5 text-ink/60">
            Intended for interior walls and ceilings. Always follow the application guidance and confirm suitability for your project.
          </p>
        </div>

        <div className="relative mx-auto flex w-full max-w-[460px] justify-center lg:max-w-none">
          <motion.div
            aria-hidden="true"
            className="absolute left-1/2 top-1/2 h-[78%] w-[78%] -translate-x-1/2 -translate-y-1/2 bg-gradient-to-br from-ochre/70 to-ochre-deep/60"
            style={live ? { rotate: plateRotate, y: plateY } : { rotate: -12 }}
          />
          <motion.div key={`m0-${Boolean(live)}`} className="relative w-[78%] max-w-[380px]" style={live ? { y: bagY, x: bagX, rotate: bagRotate } : undefined}>
            <BagImage sizes="(max-width: 1024px) 78vw, 380px" className="w-full drop-shadow-[0_30px_40px_rgba(28,26,24,0.35)]" />
          </motion.div>
        </div>
      </div>
      <p className="relative z-10 mx-auto mt-14 max-w-[1180px] text-[11px] leading-5 text-ink/50">Product image shows the GYPSOS bag artwork. Actual packaging may vary.</p>
    </section>
  );
}
