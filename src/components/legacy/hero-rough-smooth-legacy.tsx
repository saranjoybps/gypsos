"use client";

import { LayoutGrid } from "lucide-react";
import { motion, useScroll, useTransform } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Logo } from "@/components/gypsos/logo";
import { MenuOverlay } from "@/components/gypsos/menu-overlay";
import { NAV_LINKS } from "@/components/gypsos/nav-links";
import { useDesktop, useReduced } from "@/components/motion/scroll-primitives";

const STAMPS = ["Premium quality", "Professional performance", "Affordable plastering", "Reliable finishing"];
const ROWS = 4;
const STROKE = 0.55; // seconds per trowel pass
const STAGGER = 0.28;
const WALL_DONE = 0.3 + (ROWS - 1) * STAGGER + STROKE; // when the last pass ends

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

export function HeroRoughSmoothLegacy() {
  const reduce = useReduced();
  const desktop = useDesktop();
  const [skipped, setSkipped] = useState(false);
  const instant = reduce || skipped;
  const ref = useRef<HTMLElement>(null);

  // Any scroll, tap or key press skips the intro straight to the finished wall.
  useEffect(() => {
    const skip = () => setSkipped(true);
    const opts = { once: true, passive: true } as const;
    window.addEventListener("wheel", skip, opts);
    window.addEventListener("touchstart", skip, opts);
    window.addEventListener("keydown", skip, { once: true });
    window.addEventListener("pointerdown", skip, opts);
    return () => {
      window.removeEventListener("wheel", skip);
      window.removeEventListener("touchstart", skip);
      window.removeEventListener("keydown", skip);
      window.removeEventListener("pointerdown", skip);
    };
  }, []);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const copyY = useTransform(scrollYProgress, [0, 1], ["0svh", "-8svh"]);
  const plateY = useTransform(scrollYProgress, [0, 1], ["0svh", "-14svh"]);
  const plateRot = useTransform(scrollYProgress, [0, 1], [-4, 3]);
  const tapeX = useTransform(scrollYProgress, [0, 1], ["0vw", "-40vw"]);
  const live = !reduce && desktop;

  const dur = (d: number) => (instant ? 0 : d);
  const delay = (d: number) => (instant ? 0 : d);

  return (
    <section ref={ref} id="top" className="relative bg-graphite">
      <Header />

      <div className="relative min-h-[calc(100svh-84px)] overflow-hidden bg-gypsum">
        {/* The finished smooth wall: headline, stamp plate, positioning stamps */}
        <div className="relative mx-auto grid min-h-[calc(100svh-84px-40px)] w-full max-w-[1280px] items-center gap-10 px-5 pb-16 pt-12 sm:px-8 lg:grid-cols-[1.45fr_1fr] lg:gap-6">
          <motion.div key={`m0-${Boolean(live)}`} style={live ? { y: copyY } : undefined}>
            <p className="text-[11px] font-bold uppercase tracking-[0.34em] text-ochre-deep">Gypsum plaster · Made for Indian sites</p>
            <h1 className="mt-5 font-sans text-[clamp(46px,9.4vw,150px)] font-extrabold uppercase leading-[0.88] tracking-[-0.03em] text-graphite">
              Smooth walls.
              <br />
              <span className="text-ochre-deep">Smaller bills.</span>
            </h1>
            <p className="mt-7 max-w-[520px] text-[17px] font-medium leading-7 text-graphite/80">
              GYPSOS Premium Grade Gypsum Plaster. One coat of trowel work, a finish that is ready for paint, and a rate your site can live with.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#calculator" className="bg-graphite px-7 py-4 text-[12px] font-bold uppercase tracking-[0.22em] text-cream transition-colors hover:bg-ochre-deep">
                Work out my cost
              </a>
              <a href="#product" className="border-2 border-graphite px-7 py-4 text-[12px] font-bold uppercase tracking-[0.22em] text-graphite transition-colors hover:bg-graphite hover:text-cream">
                See the plaster
              </a>
            </div>
          </motion.div>

          <motion.div key={`m1-${Boolean(live)}`} className="relative order-first mx-auto w-full max-w-[300px] sm:max-w-[420px] lg:order-none lg:max-w-none" style={live ? { y: plateY } : undefined}>
            <motion.div
              key={`m2-${Boolean(instant)}`}
              className="relative origin-center border-[6px] border-graphite bg-graphite px-6 py-8 shadow-[8px_8px_0_0_#c9873a] sm:px-12 sm:py-16"
              initial={instant ? false : { scale: 1.9, rotate: -14, opacity: 0 }}
              animate={{ scale: 1, rotate: -4, opacity: 1 }}
              transition={{ delay: delay(WALL_DONE + 0.1), duration: dur(0.28), ease: [0.5, 0, 0.9, 0.4] }}
              style={live ? { rotate: plateRot } : undefined}
            >
              <Logo className="w-full" />
              <p className="mt-6 text-center text-[10px] font-bold uppercase tracking-[0.4em] text-ochre">Premium Grade Gypsum Plaster</p>
              {/* dust puff on impact */}
              {!instant && (
                <motion.span
                  aria-hidden="true"
                  className="pointer-events-none absolute -inset-6 border-[10px] border-graphite/25"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1.25, opacity: [0, 0.8, 0] }}
                  transition={{ delay: WALL_DONE + 0.34, duration: 0.5, ease: "easeOut" }}
                />
              )}
            </motion.div>

            <ul className="mt-10 flex flex-wrap gap-3">
              {STAMPS.map((label, i) => (
                <motion.li
                  key={`s${i}-${Boolean(instant)}`}
                  className="border-2 border-ochre-deep px-3 py-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-ochre-deep"
                  style={{ rotate: i % 2 ? 2 : -2 }}
                  initial={instant ? false : { scale: 1.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: delay(WALL_DONE + 0.55 + i * 0.22), duration: dur(0.2), ease: "easeIn" }}
                >
                  {label}
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Trowel passes: strips of rough wall slide off to reveal the smooth wall */}
        {Array.from({ length: ROWS }, (_, i) => {
          const dir = i % 2 === 0 ? 1 : -1;
          return (
            <motion.div
              key={`t${i}-${Boolean(instant)}`}
              aria-hidden="true"
              className="rough-wall pointer-events-none absolute inset-x-0 z-10 will-change-transform"
              style={{ top: `${(i * 100) / ROWS}%`, height: `${100 / ROWS + 0.3}%` }}
              initial={instant ? { x: `${dir * 105}%` } : { x: "0%" }}
              animate={{ x: `${dir * 105}%` }}
              transition={{ delay: delay(0.3 + i * STAGGER), duration: dur(STROKE), ease: [0.6, 0.05, 0.3, 1] }}
            >
              <span className={`absolute inset-y-0 w-[7px] bg-[#cfd3d6] shadow-[0_0_12px_rgba(255,255,255,0.5)] ${dir === 1 ? "left-0" : "right-0"}`} />
            </motion.div>
          );
        })}

        {/* Measuring tape */}
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 z-20 h-10 overflow-hidden border-t-2 border-graphite">
          <motion.div key={`m3-${Boolean(live)}`} className="tape-ticks absolute inset-y-0 left-0 w-[240%]" style={live ? { x: tapeX } : undefined} />
          <div className="absolute inset-y-0 left-0 flex w-full items-end justify-between px-5 pb-1 text-[10px] font-extrabold tracking-[0.2em] text-graphite sm:px-8">
            <span>0</span>
            <span>SCROLL ↓</span>
            <span>EST. 2020</span>
          </div>
        </div>
      </div>
    </section>
  );
}
