"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { ScrubIn, WordReveal, useReduced } from "@/components/motion/scroll-primitives";

function Panel({
  id,
  label,
  headline,
  children,
  tone,
}: {
  id: string;
  label: string;
  headline: string;
  children: React.ReactNode;
  tone: "dark" | "ochre";
}) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReduced();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.95", "start 0.25"] });
  // The coloured plate wipes open from the left edge as the panel arrives.
  const clip = useTransform(scrollYProgress, [0, 1], ["inset(0 100% 0 0)", "inset(0 0% 0 0)"]);
  const dark = tone === "dark";
  return (
    <article ref={ref} id={id} className="relative px-6 py-16 sm:px-12 lg:px-16 lg:py-24">
      <motion.div key={`m0-${Boolean(reduce)}`} aria-hidden="true" className={`absolute inset-0 ${dark ? "bg-graphite" : "bg-ochre"}`} style={reduce ? undefined : { clipPath: clip }} />
      <div className={`relative z-10 ${dark ? "text-cream" : "text-graphite"}`}>
        <p className={`text-[10px] font-medium uppercase tracking-[0.46em] ${dark ? "text-ochre" : "text-graphite/70"}`}>{label}</p>
        <p className="mt-5 font-serif text-[clamp(30px,3.6vw,54px)] font-medium leading-[1.06]">{headline}</p>
        <div className={`mt-6 max-w-[520px] space-y-4 text-[15px] leading-[1.8] ${dark ? "text-cream/75" : "text-graphite/80"}`}>{children}</div>
      </div>
    </article>
  );
}

export function VisionMission() {
  return (
    <section id="vision" className="bg-gypsum px-4 py-24 sm:px-6 sm:py-32">
      <div className="mx-auto max-w-[1280px]">
        <div className="mx-auto max-w-[900px] px-2 text-center">
          <ScrubIn y={24}>
            <p className="text-[10px] font-medium uppercase tracking-[0.46em] text-ochre-deep">Vision and mission</p>
          </ScrubIn>
          <WordReveal text="Where we are heading, and how we get there." className="mt-5 font-serif text-[clamp(36px,5vw,76px)] font-medium leading-[1.04] text-graphite" />
        </div>

        <div className="mt-16 grid lg:mt-24 lg:grid-cols-2">
          <Panel id="vision-panel" tone="dark" label="Our vision" headline="The preferred choice for every construction project.">
            <p>
              To make GYPSOS Premium Grade Gypsum Plaster the preferred choice for every construction project by delivering superior quality, excellent finishing and
              cost-effective plastering solutions.
            </p>
            <p>Our vision is to establish a strong presence across India and become one of the most trusted brands in the gypsum plaster industry.</p>
          </Panel>
          <Panel id="mission-panel" tone="ochre" label="Our mission" headline="Premium quality, at a cost that makes sense.">
            <p>To provide premium-quality gypsum plaster at an affordable cost without compromising on quality or performance.</p>
            <p>
              We are committed to reducing plastering costs, ensuring superior finishing, maintaining consistent product quality and building long-term trust with
              builders, contractors, promoters, architects, dealers and customers.
            </p>
          </Panel>
        </div>
      </div>
    </section>
  );
}
