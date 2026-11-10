"use client";

import { Clock, Droplets, Home, Layers, PaintBucket, Sparkles, Timer } from "lucide-react";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { ScrubIn, WordReveal, useDesktop, useReduced } from "@/components/motion/scroll-primitives";

const BENEFITS = [
  { icon: Sparkles, title: "Smooth, uniform finish", body: "Gypsum plaster sets to a refined, even surface that reads clean under light." },
  { icon: Timer, title: "Faster application", body: "In suitable applications, application is typically quicker than traditional cement-sand plastering." },
  { icon: PaintBucket, title: "Less putty preparation", body: "Where appropriate, the smoother base reduces the need for extensive putty work before painting." },
  { icon: Layers, title: "Better finishing quality", body: "A consistent base gives paint and other finishes a better surface to sit on." },
  { icon: Home, title: "Interior walls and ceilings", body: "Made for interior plastering of walls and ceilings in homes, apartments and commercial spaces." },
  { icon: Clock, title: "Potentially shorter finishing time", body: "Faster application and less preparation can help shorten the finishing stage of a project." },
  { icon: Droplets, title: "Lower water requirement", body: "Gypsum plastering generally needs less water than conventional cement-sand methods, where applicable." },
];

function Column({ children, from, to, className = "" }: { children: React.ReactNode; from: number; to: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReduced();
  const desktop = useDesktop();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  // Stacked columns on phones keep the same drift, scaled down so neighbouring items never collide.
  const k = desktop ? 0.7 : 0.3;
  const y = useTransform(scrollYProgress, [0, 1], [`${from * k}svh`, `${to * k}svh`]);
  return (
    <motion.div key={`m0-${Boolean(reduce)}`} ref={ref} className={className} style={reduce ? undefined : { y }}>
      {children}
    </motion.div>
  );
}

function Item({ icon: Icon, title, body, index }: { icon: typeof Sparkles; title: string; body: string; index: number }) {
  return (
    <ScrubIn y={36} start={1} end={0.72}>
      <article className="border-t border-white/15 pt-6">
        <div className="flex items-center justify-between">
          <Icon size={26} strokeWidth={1.1} className="text-ochre" aria-hidden="true" />
          <span className="text-[11px] tracking-[0.3em] text-white/35">{String(index + 1).padStart(2, "0")}</span>
        </div>
        <h3 className="mt-6 font-serif text-[clamp(24px,2.2vw,32px)] font-medium leading-tight text-cream">{title}</h3>
        <p className="mt-3 text-[14px] leading-7 text-cream/65">{body}</p>
      </article>
    </ScrubIn>
  );
}

export function BenefitsSection() {
  const cols = [
    [0, 3, 6],
    [1, 4],
    [2, 5],
  ];
  return (
    <section id="benefits" className="plaster-grain relative overflow-hidden bg-graphite px-6 py-28 text-cream sm:py-36">
      <div className="relative z-10 mx-auto max-w-[1180px]">
        <ScrubIn y={24}>
          <p className="text-[10px] font-medium uppercase tracking-[0.46em] text-ochre">Benefits of gypsum plaster</p>
        </ScrubIn>
        <WordReveal
          text="Why gypsum plaster changes the plastering job."
          className="mt-5 max-w-[860px] font-serif text-[clamp(38px,5.6vw,88px)] font-medium leading-[1.02] text-cream"
        />

        <div className="mt-20 grid gap-12 md:grid-cols-3 md:gap-8 lg:mt-28 lg:gap-12">
          {cols.map((indices, c) => (
            <Column key={c} from={c === 1 ? 14 : c === 2 ? 6 : 0} to={c === 1 ? -2 : c === 2 ? -8 : -14} className="flex flex-col gap-12 md:gap-16">
              {indices.map((i) => (
                <Item key={BENEFITS[i].title} index={i} {...BENEFITS[i]} />
              ))}
            </Column>
          ))}
        </div>

        <p className="mt-14 max-w-[640px] border-l-2 border-ochre pl-5 text-[13px] leading-6 text-cream/60">
          Performance depends on the base surface, site conditions, mixing and application method. Benefits describe typical advantages of gypsum plaster in suitable
          interior applications and are not a guarantee of results on any specific site.
        </p>
      </div>
    </section>
  );
}
