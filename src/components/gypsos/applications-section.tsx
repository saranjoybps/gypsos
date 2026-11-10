"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { ScrubIn, WordReveal, useDesktop as useMediaWide, useReduced } from "@/components/motion/scroll-primitives";

const CARDS = [
  {
    title: "Residential buildings",
    note: "Homes and villas: smooth interior walls and ceilings.",
    src: "/images/gypsos/residential.jpg",
    alt: "Residential apartment blocks rising above a road in an Indian city",
    position: "object-[70%_40%]",
  },
  {
    title: "Apartments",
    note: "Repeatable, consistent finishing across many units.",
    src: "/images/gypsos/apartment.jpg",
    alt: "A cluster of high-rise apartment towers under a dramatic evening sky",
    position: "object-[50%_55%]",
  },
  {
    title: "Commercial buildings",
    note: "Offices and retail interiors with a clean finished look.",
    src: "/images/gypsos/commercial.jpg",
    alt: "Glass-fronted modern office towers seen from below",
    position: "object-[50%_30%]",
  },
];

const MORE = ["Interior walls", "Ceilings", "Suitable renovation projects"];

function Card({ index, spread, card }: { index: number; spread: ReturnType<typeof useTransform<number, number>>; card: (typeof CARDS)[number] }) {
  // Cards start overlapped (like a stacked deck) and fan out as the section scrolls into view.
  // Wide screens fan sideways; stacked (phone) layout fans the deck downward with a slight sway.
  const desktop = useMediaWide();
  const x = useTransform(spread, (v) => (desktop ? `${(index - 1) * (1 - v) * -62}%` : `${(index - 1) * (1 - v) * -12}%`));
  const y = useTransform(spread, (v) => (desktop ? "0%" : `${index * (1 - v) * -56}%`));
  const rotate = useTransform(spread, (v) => (index - 1) * (1 - v) * (desktop ? 5 : 4));
  const featured = index === 1;
  return (
    <motion.li
      className={`relative ${featured ? "z-10 md:-mt-6 md:mb-6" : ""}`}
      style={{ x, y, rotate }}
    >
      <figure className="group">
        <div className="relative aspect-[4/5] overflow-hidden bg-graphite">
          <Image src={card.src} alt={card.alt} fill sizes="(max-width: 768px) 90vw, 32vw" className={`object-cover transition-transform duration-700 group-hover:scale-105 ${card.position}`} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" aria-hidden="true" />
          <figcaption className="absolute inset-x-0 bottom-0 p-5">
            <p className="font-serif text-[clamp(22px,2vw,30px)] leading-tight text-cream">{card.title}</p>
            <p className="mt-1 text-[12.5px] leading-5 text-cream/75">{card.note}</p>
          </figcaption>
        </div>
      </figure>
    </motion.li>
  );
}

export function ApplicationsSection() {
  const ref = useRef<HTMLUListElement>(null);
  const reduce = useReduced();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.95", "start 0.35"] });
  const spreadRaw = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const fixed = useTransform(spreadRaw, () => 1);
  const spread = reduce ? fixed : spreadRaw;

  return (
    <section id="applications" className="overflow-x-clip bg-gypsum px-6 py-28 sm:py-36">
      <div className="mx-auto max-w-[1180px]">
        <div className="mx-auto max-w-[860px] text-center">
          <ScrubIn y={24}>
            <p className="text-[10px] font-medium uppercase tracking-[0.46em] text-ochre-deep">Applications</p>
          </ScrubIn>
          <WordReveal
            text="Where GYPSOS goes to work."
            className="mt-5 font-serif text-[clamp(38px,5.6vw,88px)] font-medium leading-[1.02] text-graphite"
          />
        </div>

        <ul ref={ref} className="mt-20 grid gap-8 md:grid-cols-3 md:items-end md:gap-6 lg:mt-28 lg:gap-8">
          {CARDS.map((card, i) => (
            <Card key={card.title} index={i} spread={spread} card={card} />
          ))}
        </ul>

        <ul className="mt-16 flex flex-wrap items-center justify-center gap-3 lg:mt-24" aria-label="More applications">
          {MORE.map((item) => (
            <li key={item}>
              <ScrubIn y={20} start={1} end={0.8}>
                <span className="inline-block border border-graphite/30 px-5 py-2.5 text-[11px] uppercase tracking-[0.24em] text-graphite">{item}</span>
              </ScrubIn>
            </li>
          ))}
        </ul>
        <p className="mx-auto mt-8 max-w-[560px] text-center text-[12px] leading-5 text-ink/55">
          Gypsum plaster is intended for interior surfaces. Suitability for renovation work depends on the condition of the existing wall or ceiling.
        </p>
      </div>
    </section>
  );
}
