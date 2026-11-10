"use client";

import { LayoutGrid } from "lucide-react";
import { motion, useScroll, useTransform } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Logo } from "@/components/gypsos/logo";
import { MenuOverlay } from "@/components/gypsos/menu-overlay";
import { NAV_LINKS } from "@/components/gypsos/nav-links";
import { useDesktop, useReduced } from "@/components/motion/scroll-primitives";

/* Timeline (seconds): the elephant charges the wall three times, then keeps leaning into it. */
const IMPACTS = [1.3, 1.95, 2.55];
const CHARGE_END = IMPACTS[IMPACTS.length - 1];
const LOOP = 2.4; // seconds per push in the endless lean
const LOOP_HIT = 0.72; // when in the loop the head meets the wall

const elephantX = {
  x: ["-135%", "0%", "-12%", "0%", "-9%", "0%"],
  times: [0, 1.3, 1.55, 1.95, 2.2, 2.55].map((t) => t / CHARGE_END),
};

// Deterministic dust particles (no Math.random: avoids hydration drift).
const DUST = Array.from({ length: 16 }, (_, i) => {
  const a = (i * 137.5 * Math.PI) / 180;
  return { dx: -70 - ((i * 53) % 90), dy: Math.sin(a) * 70 - 10, size: 6 + ((i * 7) % 14), delay: (i % 5) * 0.02 };
});

function Dust({ at, repeat, power = 1 }: { at: number; repeat?: boolean; power?: number }) {
  return (
    <>
      {DUST.map((p, i) => (
        <motion.span
          key={i}
          aria-hidden="true"
          className="absolute right-0 top-0 rounded-full bg-gypsum/70"
          style={{ width: p.size, height: p.size }}
          initial={{ x: 0, y: 0, scale: 0.4, opacity: 0 }}
          animate={{ x: p.dx * power, y: p.dy * power, scale: 2, opacity: [0, 0.85, 0] }}
          transition={{
            delay: at + p.delay,
            duration: 0.95,
            ease: "easeOut",
            opacity: { times: [0, 0.2, 1], delay: at + p.delay, duration: 0.95, ease: "easeOut", ...(repeat ? { repeat: Infinity, repeatDelay: LOOP - 0.95 } : {}) },
            ...(repeat ? { repeat: Infinity, repeatDelay: LOOP - 0.95 } : {}),
          }}
        />
      ))}
    </>
  );
}

function ElephantArt() {
  return (
    <svg viewBox="0 0 500 380" className="h-full w-full overflow-visible" role="img" aria-label="An elephant leaning its full weight against a plastered wall">
      <defs>
        <linearGradient id="eb" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8d8374" />
          <stop offset="0.55" stopColor="#6a6258" />
          <stop offset="1" stopColor="#453f38" />
        </linearGradient>
        <linearGradient id="el" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7d7468" />
          <stop offset="1" stopColor="#3c3731" />
        </linearGradient>
        <linearGradient id="ee" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#9a8f80" />
          <stop offset="1" stopColor="#5a5248" />
        </linearGradient>
      </defs>
      <ellipse cx="300" cy="354" rx="220" ry="9" fill="#000" opacity="0.55" />
      {/* far legs */}
      <path d="M226 230h52v110q0 12-10 12h-32q-10 0-10-12z M346 230h52v110q0 12-10 12h-32q-10 0-10-12z" fill="#3c3731" />
      {/* tail */}
      <path d="M148 138q-34 30-22 82" fill="none" stroke="#453f38" strokeWidth="8" strokeLinecap="round" />
      <path d="M126 214q-6 10 2 18q8-4 6-16z" fill="#2b2824" />
      {/* body + head */}
      <path d="M146 140Q140 90 200 80L330 78Q380 58 428 78Q468 98 478 142Q490 178 480 208L470 222Q452 252 396 252L172 252Q144 246 146 200Z" fill="url(#eb)" />
      <path d="M200 80L330 78Q380 58 428 78Q468 98 478 142" fill="none" stroke="#c9bda9" strokeWidth="2" opacity="0.55" />
      {/* near legs */}
      <path d="M164 232h58v110q0 12-10 12h-38q-10 0-10-12z M294 232h58v110q0 12-10 12h-38q-10 0-10-12z" fill="url(#el)" />
      <path d="M172 342h42M302 342h42" stroke="#d9cfbd" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
      {/* ear */}
      <path d="M352 96Q288 90 296 172Q306 232 366 226Q408 194 398 136Q388 100 352 96Z" fill="url(#ee)" stroke="#3c3731" strokeWidth="2.5" />
      <path d="M346 122Q326 162 344 204" fill="none" stroke="#4b443b" strokeWidth="3" strokeLinecap="round" />
      {/* trunk, braced down against the wall */}
      <path d="M452 170Q500 186 498 254Q496 308 476 338Q466 352 452 340Q444 328 458 308Q474 270 466 240Z" fill="url(#eb)" />
      <path d="M480 198q7 6 5 20M482 238q8 6 5 22M478 280q7 6 3 20" fill="none" stroke="#3c3731" strokeWidth="3" strokeLinecap="round" />
      {/* tusk */}
      <path d="M446 206Q486 212 500 246Q470 238 440 222Z" fill="#efe6d2" />
      {/* eye */}
      <circle cx="438" cy="142" r="5" fill="#f7f4ee" />
      <circle cx="439" cy="143" r="2.4" fill="#1c1a18" />
      {/* skin folds */}
      <path d="M186 118q44-16 96-6M196 180q64 10 126 0M166 212q54 10 106 4M420 112q20 6 34 24" fill="none" stroke="#3c3731" strokeWidth="2.4" strokeLinecap="round" opacity="0.8" />
    </svg>
  );
}

function Header() {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  return (
    <header className="relative z-30 border-b-4 border-ochre bg-graphite">
      <div className="mx-auto grid w-full max-w-[1280px] grid-cols-[1fr_auto_1fr] items-center px-5 py-5 sm:px-8">
        <a href="#top" className="justify-self-start" aria-label="GYPSOS home">
          <Logo className="w-[120px] sm:w-[148px]" priority />
        </a>
        <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className="text-[12px] tracking-[0.16em] text-cream/85 transition-colors hover:text-cream">
              {link.label}
            </a>
          ))}
        </nav>
        <button
          type="button"
          className="col-start-3 justify-self-end text-cream"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          <LayoutGrid strokeWidth={1.25} size={18} />
        </button>
        <MenuOverlay open={open} onClose={close} />
      </div>
    </header>
  );
}

export function HeroElephantSvgLegacy() {
  const reduce = useReduced();
  const desktop = useDesktop();
  const [skipped, setSkipped] = useState(false);
  const instant = reduce || skipped;
  const ref = useRef<HTMLElement>(null);

  // Any scroll, tap or key press skips the charge and settles into the final pose.
  useEffect(() => {
    const skip = () => setSkipped(true);
    const opts = { once: true, passive: true } as const;
    window.addEventListener("wheel", skip, opts);
    window.addEventListener("touchstart", skip, opts);
    window.addEventListener("pointerdown", skip, opts);
    window.addEventListener("keydown", skip, { once: true });
    return () => {
      window.removeEventListener("wheel", skip);
      window.removeEventListener("touchstart", skip);
      window.removeEventListener("pointerdown", skip);
      window.removeEventListener("keydown", skip);
    };
  }, []);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const copyY = useTransform(scrollYProgress, [0, 1], ["0svh", "-10svh"]);
  const stageY = useTransform(scrollYProgress, [0, 1], ["0svh", "6svh"]);
  const live = !reduce && desktop;

  // Wall shudder: spikes at each charge impact, then a gentler tremor with every lean.
  const wallPts: [number, number][] = [[0, 0]];
  IMPACTS.forEach((t) => wallPts.push([t - 0.03, 0], [t, -7], [t + 0.07, 5], [t + 0.15, -3], [t + 0.25, 0]));
  const wallEnd = wallPts[wallPts.length - 1][0];

  return (
    <section ref={ref} id="top" className="relative bg-graphite">
      <Header />

      <div className="relative min-h-[calc(100svh-84px)] overflow-hidden bg-[radial-gradient(120%_90%_at_30%_30%,#33302b_0%,#1c1a18_70%)]">
        {/* Headline */}
        <motion.div
          key={`m0-${Boolean(live)}`}
          className="relative z-10 mx-auto w-full max-w-[1280px] px-5 pt-10 sm:px-8 lg:pt-14"
          style={live ? { y: copyY } : undefined}
        >
          <div className="max-w-[calc(74%-0.5rem)] sm:max-w-[calc(70%-1rem)] lg:max-w-[56%]">
            <p className="text-[11px] font-bold uppercase tracking-[0.34em] text-ochre">GYPSOS Premium Grade Gypsum Plaster</p>
            <h1 className="mt-4 font-sans text-[clamp(40px,6.6vw,104px)] font-extrabold uppercase leading-[0.9] tracking-[-0.03em] text-cream">
              Push all
              <br />
              you like.
            </h1>
            <p className="mt-5 max-w-[470px] text-[15px] font-medium leading-7 text-cream/80">
              A smooth, even interior finish at a rate your site can live with. Premium quality. Professional performance. Affordable plastering. Reliable finishing.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="#calculator" className="bg-ochre px-6 py-3.5 text-[12px] font-bold uppercase tracking-[0.22em] text-graphite transition-colors hover:bg-cream">
                Work out my cost
              </a>
              <a href="#product" className="border-2 border-cream/70 px-6 py-3.5 text-[12px] font-bold uppercase tracking-[0.22em] text-cream transition-colors hover:bg-cream hover:text-graphite">
                See the plaster
              </a>
            </div>
          </div>
        </motion.div>

        {/* The wall */}
        <motion.div
          key={`w-${Boolean(instant)}`}
          aria-hidden="true"
          className="absolute bottom-[9svh] right-0 top-0 z-[5] w-[26%] sm:w-[30%] lg:w-[34%]"
          animate={instant ? undefined : { x: wallPts.map((p) => p[1]) }}
          transition={instant ? undefined : { duration: wallEnd, times: wallPts.map((p) => p[0] / wallEnd), ease: "easeOut" }}
        >
          <motion.div
            key={`wl-${Boolean(instant)}`}
            className="relative h-full w-full border-l-4 border-black/40 bg-gypsum shadow-[-18px_0_40px_rgba(0,0,0,0.5)]"
            animate={instant ? undefined : { x: [0, -2.5, 2, -1.5, 0] }}
            transition={instant ? undefined : { delay: CHARGE_END + LOOP_HIT + 0.02, duration: 0.5, repeat: Infinity, repeatDelay: LOOP - 0.5, ease: "easeOut" }}
          >
            {/* plaster surface: soft trowel sweeps + fine grain */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(60% 40% at 30% 20%, rgba(255,255,255,0.7), transparent 70%), radial-gradient(70% 50% at 80% 75%, rgba(201,135,58,0.10), transparent 70%), linear-gradient(100deg, rgba(0,0,0,0.07), transparent 30%, rgba(0,0,0,0.05))",
              }}
            />
            <div className="absolute inset-0 opacity-[0.35] mix-blend-multiply" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' seed='9'/%3E%3CfeColorMatrix values='0 0 0 0 .6 0 0 0 0 .55 0 0 0 0 .5 0 0 0 .5 0'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)'/%3E%3C/svg%3E\")" }} />
            {/* brand plate fixed to the wall */}
            <div className="absolute left-1/2 top-[22%] w-[78%] -translate-x-1/2 border-4 border-graphite bg-graphite px-3 py-4 shadow-[5px_5px_0_0_#c9873a] sm:px-5 sm:py-6">
              <Logo className="w-full" />
            </div>
            {/* skirting */}
            <div className="absolute inset-x-0 bottom-0 h-[5%] bg-bone shadow-[0_-2px_0_rgba(0,0,0,0.15)]" />
          </motion.div>
        </motion.div>

        {/* Elephant + dust */}
        <motion.div
          key={`s-${Boolean(live)}`}
          className="pointer-events-none absolute bottom-[calc(9svh-6px)] right-[26%] z-[6] aspect-[500/380] h-[24svh] sm:right-[30%] sm:h-[32svh] lg:right-[34%] lg:h-[46svh]"
          style={live ? { y: stageY } : undefined}
        >
          <motion.div
            key={`e0-${Boolean(instant)}`}
            className="h-full w-full will-change-transform"
            initial={instant ? false : { x: "-135%" }}
            animate={instant ? { x: "0%" } : { x: elephantX.x }}
            transition={instant ? { duration: 0 } : { duration: CHARGE_END, times: elephantX.times, ease: ["easeIn", "easeOut", "easeIn", "easeOut", "easeIn"] }}
          >
            {/* gallop bob while charging, then the lean */}
            <motion.div
              key={`e1-${Boolean(instant)}`}
              className="h-full w-full origin-bottom-right"
              animate={instant ? undefined : { y: [0, -7, 0], rotate: [0, 0.6, 0] }}
              transition={instant ? undefined : { duration: 0.26, repeat: 4, ease: "easeInOut" }}
            >
              <motion.div
                key={`e2-${Boolean(instant)}`}
                className="h-full w-full origin-bottom-left"
                initial={instant ? false : { x: "0%", rotate: 0 }}
                animate={instant ? { x: "0%", rotate: 0 } : { x: ["0%", "-2.5%", "0.6%", "0%", "0%"], rotate: [0, -1.4, 1.2, 0, 0] }}
                transition={instant ? { duration: 0 } : { delay: CHARGE_END, duration: LOOP, times: [0, 0.2, 0.3, 0.45, 1], repeat: Infinity, ease: "easeInOut" }}
              >
                <ElephantArt />
              </motion.div>
            </motion.div>
          </motion.div>
          {!instant && (
            <div className="absolute right-0 top-[38%] h-0 w-0">
              <Dust at={IMPACTS[0]} />
              <Dust at={IMPACTS[1]} />
              <Dust at={IMPACTS[2]} power={1.3} />
              <Dust at={CHARGE_END + LOOP_HIT + LOOP} repeat power={0.8} />
            </div>
          )}
        </motion.div>

        {/* Floor */}
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 z-[7] h-[9svh] border-t-4 border-ochre bg-[#100f0d]" />
        <p className="absolute inset-x-0 bottom-2 z-[8] px-5 text-center text-[10px] uppercase tracking-[0.22em] text-cream/45 sm:px-8 sm:text-left">
          Illustration. Gypsum plaster is a finish, not structure. Est. 2020
        </p>
      </div>
    </section>
  );
}
