"use client";

import { LayoutGrid } from "lucide-react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "motion/react";
import { useCallback, useRef, useState } from "react";
import { Logo } from "@/components/gypsos/logo";
import { MenuOverlay } from "@/components/gypsos/menu-overlay";
import { NAV_LINKS } from "@/components/gypsos/nav-links";
import { useDesktop, useReduced } from "@/components/motion/scroll-primitives";

const round = (value: number) => Math.round(value * 100) / 100;

const rand = (index: number, salt: number) => {
  const value = Math.sin(index * salt) * 43758.5453;
  return value - Math.floor(value);
};

// Drifting sand/dust motes: two sizes, spread over the whole scene so the hero feels alive.
const DUST = Array.from({ length: 36 }, (_, i) => {
  const big = i % 4 === 0;
  return {
    left: round(2 + rand(i, 91.7) * 96),
    top: round(14 + rand(i, 47.3) * 80),
    size: round(big ? 5 + rand(i, 13.9) * 4 : 2.5 + rand(i, 13.9) * 2.5),
    delay: round(rand(i, 29.1) * -16),
    dur: round(9 + rand(i, 7.7) * 10),
    glow: big,
  };
});

function Header() {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  return (
    <header className="relative z-30">
      <div className="mx-auto grid w-full max-w-[1280px] grid-cols-[1fr_auto_1fr] items-center px-5 pt-6 sm:px-8">
        <a href="#top" className="justify-self-start" aria-label="GYPSOS home">
          <Logo className="w-[120px] sm:w-[148px]" priority />
        </a>
        <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className="link-underline text-[12px] tracking-[0.16em] text-cream/90 transition-colors hover:text-cream">
              {link.label}
            </a>
          ))}
        </nav>
        <div className="col-start-3 flex items-center gap-4 justify-self-end text-cream">
          <button type="button" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} onClick={() => setOpen((value) => !value)}>
            <LayoutGrid strokeWidth={1.25} size={18} />
          </button>
        </div>
        <MenuOverlay open={open} onClose={close} />
      </div>
    </header>
  );
}

export function PyramidHero() {
  const trackRef = useRef<HTMLElement>(null);
  const reduce = useReduced();
  const desktop = useDesktop();
  const { scrollYProgress } = useScroll({ target: trackRef, offset: ["start start", "end end"] });

  // Phones/tablets travel a little less so the stage stays composed in portrait.
  const k = desktop ? 1 : 0.75;
  // Every range spans 0..1 explicitly (native scroll-timeline opacity otherwise bounces back).
  const copyY = useTransform(scrollYProgress, [0, 0.7, 1], ["0svh", "-9svh", "-9svh"]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0, 0]);
  const copyEvents = useTransform(scrollYProgress, (v) => (v > 0.5 ? "none" : "auto"));
  const navOpacity = useTransform(scrollYProgress, [0, 0.72, 1], [1, 0, 0]);
  const navEvents = useTransform(scrollYProgress, (v) => (v > 0.72 ? "none" : "auto"));
  // Three sand layers rise at different speeds: far barely moves, near sweeps up the most.
  const sandY = useTransform(scrollYProgress, [0, 1], ["0svh", `${-26 * k}svh`]);
  const live = !reduce;

  return (
    <section ref={trackRef} id="top" className="hero-track relative bg-sand">
      <div className="sticky top-0 h-svh overflow-hidden bg-sand">
        {/* 1. Pyramid plate: full-bleed, anchored, never translates with scroll. It only eases in once on load. */}
        <div className="absolute inset-0 z-[1] bg-[linear-gradient(to_bottom,#f4d9a8_60%,#e6bb80_80%)]" aria-hidden="true">
          <Image
            src="/images/egypt/pyramids-sunrise.webp"
            alt=""
            fill
            preload
            sizes="100vw"
            className="pyramid-intro origin-bottom object-cover object-[70%_50%] [mask-image:linear-gradient(to_bottom,#000_64%,transparent_74%)] [-webkit-mask-image:linear-gradient(to_bottom,#000_64%,transparent_74%)]"
          />
        </div>
        <span className="sr-only">The pyramids of Giza at sunrise, a reminder of gypsum&apos;s ancient past</span>

        {/* 3. Sand: one dune layer that sits over the plate's own dunes and rises with scroll.
            Width covers the stage in both axes (the dune art is 3:1); its horizon starts at ~67svh. */}
        <motion.div
          key={`m1-${live}`}
          className="pointer-events-none absolute left-1/2 z-[3] will-change-transform"
          style={{ width: "max(100vw, 300svh)", top: "calc(67svh - max(100vw, 300svh) * 0.1333)", x: "-50%", ...(live ? { y: sandY } : {}) }}
          aria-hidden="true"
        >
          <Image src="/images/egypt/dunes-sand.webp" alt="" width={2172} height={724} preload sizes="(max-width: 760px) 300svh, 100vw" className="block h-auto w-full select-none" />
        </motion.div>

        {/* 4. Dust: transform/opacity only, removed under reduced motion */}
        {live ? (
          <div className="pointer-events-none absolute inset-0 z-[8]" aria-hidden="true">
            {DUST.map((d, i) => (
              <span
                key={i}
                className={`dust-speck absolute rounded-full ${d.glow ? "bg-[#fff1cf] shadow-[0_0_10px_3px_rgba(255,225,160,0.55)]" : "bg-[#fff4dc]"}`}
                style={{ left: `${d.left}%`, top: `${d.top}%`, width: d.size, height: d.size, animationDelay: `${d.delay}s`, animationDuration: `${d.dur}s` }}
              />
            ))}
          </div>
        ) : null}

        {/* soft blend of the nearest sand into whatever follows */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[6] h-[22%] bg-[linear-gradient(to_bottom,transparent_0%,rgba(235,184,124,0.5)_62%,#ebb87c_92%)]"
          aria-hidden="true"
        />

        {/* readability shade behind the copy: left on wide screens, bottom on phones */}
        <motion.div
          key={`s-${live}`}
          className="pointer-events-none absolute inset-0 z-[7] bg-[linear-gradient(to_top,rgba(28,26,24,0.66)_0%,rgba(28,26,24,0.4)_45%,transparent_72%)] sm:bg-[linear-gradient(to_right,rgba(28,26,24,0.78)_0%,rgba(28,26,24,0.55)_40%,rgba(28,26,24,0.22)_62%,transparent_82%)]"
          style={live ? { opacity: copyOpacity } : undefined}
          aria-hidden="true"
        />

        {/* 5. Nav + copy */}
        <motion.div key={`n-${live}`} className="relative z-20" style={live ? { opacity: navOpacity, pointerEvents: navEvents } : undefined}>
          <Header />
        </motion.div>

        <div className="absolute inset-x-0 top-0 z-10 mx-auto flex h-full w-full max-w-[1280px] items-end px-5 pb-[clamp(32px,9svh,96px)] pt-[clamp(96px,16svh,140px)] sm:px-8">
          <motion.div
            key={`c-${live}`}
            className="w-full max-w-[980px]"
            style={live ? { y: copyY, opacity: copyOpacity, pointerEvents: copyEvents } : undefined}
          >
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <span className="bg-ochre px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.28em] text-graphite">Est. 2020</span>
              <p className="text-[11px] font-bold uppercase tracking-[0.34em] text-cream [text-shadow:0_1px_12px_rgba(28,26,24,0.6)]">
              GYPSOS Premium Grade Gypsum Plaster
            </p>
            </div>
            <h1 className="mt-[2.4svh] font-sans text-[clamp(40px,min(7.6vw,13svh),112px)] font-extrabold uppercase leading-[0.9] tracking-[-0.03em] text-cream [text-shadow:0_2px_30px_rgba(28,26,24,0.55)]">
              Smooth walls.
              <br />
              <span className="text-[#e8a447] [text-shadow:0_2px_24px_rgba(28,26,24,0.7)]">Smaller bills.</span>
            </h1>
            <p className="mt-[3svh] max-w-[540px] text-[15px] font-medium leading-7 text-cream/95 [text-shadow:0_1px_14px_rgba(28,26,24,0.6)] sm:text-[17px] sm:leading-8">
              Gypsum plaster for interior walls and ceilings: a smooth, uniform finish, less surface preparation and an affordable rate.
            </p>
            <div className="mt-[4svh] flex flex-wrap gap-3">
              <a href="#calculator" className="bg-ochre px-7 py-4 text-[12px] font-bold uppercase tracking-[0.22em] text-graphite transition-colors btn-sweep [--sweep:var(--color-cream)]">
                Work out my cost
              </a>
              <a href="#product" className="border-2 border-cream/80 px-7 py-4 text-[12px] font-bold uppercase tracking-[0.22em] text-cream transition-colors btn-sweep [--sweep:var(--color-cream)] hover:text-graphite">
                See the plaster
              </a>
            </div>
          </motion.div>
        </div>

      </div>
    </section>
  );
}
