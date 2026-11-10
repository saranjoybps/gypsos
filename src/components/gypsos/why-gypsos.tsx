"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { ScrubIn, WordReveal, useReduced } from "@/components/motion/scroll-primitives";

const REASONS = [
  { title: "Premium-grade gypsum plaster", body: "Positioned as premium grade from the first bag: made for plastering that has to look right once it dries." },
  { title: "Affordable plastering solutions", body: "A premium finish should not carry a premium price. GYPSOS is priced to keep plastering budgets under control." },
  { title: "Consistent material quality", body: "The aim is the same working behaviour on every delivery, so crews are never surprised by the material." },
  { title: "Superior finishing", body: "Built to leave a smooth, uniform wall surface that is ready for the next finishing step." },
  { title: "Reliable performance", body: "Predictable on the wall, so contractors can plan the job and the schedule around it." },
  { title: "Cost-effective plastering", body: "Quicker application and less extensive surface preparation can lower the cost of finishing where site conditions suit." },
  { title: "Customer satisfaction", body: "Long-term trust with builders, contractors, promoters, architects and dealers matters more than any single order." },
];

function Reason({ index, title, body }: { index: number; title: string; body: string }) {
  const ref = useRef<HTMLLIElement>(null);
  const reduce = useReduced();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.9", "start 0.45"] });
  const opacity = useTransform(scrollYProgress, [0, 1], [0.22, 1]);
  const line = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const x = useTransform(scrollYProgress, [0, 1], [28, 0]);
  return (
    <motion.li key={`m0-${Boolean(reduce)}`} ref={ref} className="relative grid grid-cols-[auto_1fr] gap-x-6 overflow-x-clip border-t border-graphite/15 py-8 sm:gap-x-10 sm:py-10" style={reduce ? undefined : { opacity }}>
      <motion.span key={`m1-${Boolean(reduce)}`} aria-hidden="true" className="absolute left-0 top-[-1px] h-px w-full origin-left bg-ochre" style={reduce ? undefined : { scaleX: line }} />
      <span className="font-serif text-[clamp(40px,5vw,72px)] font-medium leading-none text-ochre">{String(index + 1).padStart(2, "0")}</span>
      <motion.div key={`m2-${Boolean(reduce)}`} style={reduce ? undefined : { x }}>
        <h3 className="font-serif text-[clamp(24px,2.6vw,38px)] font-medium leading-tight text-graphite">{title}</h3>
        <p className="mt-3 max-w-[560px] text-[14.5px] leading-7 text-ink/80">{body}</p>
      </motion.div>
    </motion.li>
  );
}

export function WhyGypsos() {
  return (
    <section id="why" className="bg-gypsum px-6 py-28 sm:py-36">
      <div className="mx-auto grid max-w-[1180px] gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <ScrubIn y={24}>
            <p className="text-[10px] font-medium uppercase tracking-[0.46em] text-ochre-deep">Why choose GYPSOS</p>
          </ScrubIn>
          <WordReveal
            text="A better wall, without the premium price tag."
            className="mt-5 font-serif text-[clamp(38px,5vw,76px)] font-medium leading-[1.02] text-graphite"
          />
          <ScrubIn y={20} className="mt-6 max-w-sm text-[15px] leading-7 text-ink/75">
            <p>Seven reasons builders and contractors reach for GYPSOS when the finish matters.</p>
          </ScrubIn>
        </div>
        <ul className="border-b border-graphite/15">
          {REASONS.map((reason, i) => (
            <Reason key={reason.title} index={i} {...reason} />
          ))}
        </ul>
      </div>
    </section>
  );
}
