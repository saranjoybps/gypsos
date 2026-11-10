"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { ScrubIn, useDesktop, useReduced } from "@/components/motion/scroll-primitives";

function DirectorRow({ name, initial, direction }: { name: string; initial: string; direction: 1 | -1 }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReduced();
  const desktop = useDesktop();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  // The giant name slides across the row as it passes, in opposite directions for the two directors.
  const k = desktop ? 1 : 0.5;
  const x = useTransform(scrollYProgress, [0, 0.5, 1], [`${direction * 22 * k}vw`, "0vw", `${direction * -8 * k}vw`]);
  const dash = useTransform(scrollYProgress, [0, 0.4, 1], [0, 1, 1]);
  const live = !reduce;

  return (
    <div ref={ref} className="relative border-t border-white/15 py-10 sm:py-14 lg:py-16">
      <motion.span aria-hidden="true" className="absolute left-0 top-[-1px] h-px w-full origin-left bg-ochre" style={live ? { scaleX: dash } : { scaleX: 0 }} />
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-10">
        <div className="grid h-20 w-20 shrink-0 place-items-center rounded-full border border-ochre/70 sm:h-28 sm:w-28" aria-hidden="true">
          <span className="font-serif text-[40px] leading-none text-ochre sm:text-[56px]">{initial}</span>
        </div>
        <div className="min-w-0 flex-1">
          <motion.h3 key={`m0-${Boolean(live)}`} className="font-serif text-[clamp(56px,11vw,168px)] font-medium leading-[0.92] text-cream" style={live ? { x } : undefined}>
            {name}
          </motion.h3>
          <p className="mt-4 text-[11px] uppercase tracking-[0.34em] text-ochre">Managing Director</p>
        </div>
      </div>
    </div>
  );
}

export function DirectorsSection() {
  return (
    <section id="directors" className="relative overflow-hidden bg-teal-night px-6 py-28 text-cream sm:py-36">
      <div className="mx-auto max-w-[1180px]">
        <ScrubIn y={24}>
          <p className="text-[10px] font-medium uppercase tracking-[0.46em] text-ochre">Leadership</p>
          <h2 className="mt-5 max-w-[760px] font-serif text-[clamp(34px,4.6vw,68px)] font-medium leading-[1.04]">Led by two Managing Directors.</h2>
          <p className="mt-5 max-w-[520px] text-[15px] leading-7 text-cream/70">
            GYPSOS Buildtech India Private Limited is guided by its Managing Directors, who steer the company&apos;s commitment to quality, finish and fair pricing.
          </p>
          <p className="mt-6 max-w-[620px] text-[15px] leading-7 text-cream/70">
            We were inspired to start GYPSOS Buildtech India Private Limited by the opportunity to make plastering more cost-effective without compromising on quality.
            We believe in delivering high-quality materials, superior finishing and reliable performance at an affordable price. Our mission is to make premium-quality
            gypsum plaster accessible to everyone.
          </p>
        </ScrubIn>
        <div className="mt-16 lg:mt-24">
          <DirectorRow name="Vivek" initial="V" direction={-1} />
          <DirectorRow name="Kalaiselvan" initial="K" direction={1} />
          <div className="border-t border-white/15" />
        </div>
      </div>
    </section>
  );
}
