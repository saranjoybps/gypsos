"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { SiteHeaderLegacy } from "@/components/legacy/site-header-legacy";
import { useReduced } from "@/components/motion/scroll-primitives";

const round = (value: number) => Math.round(value * 100) / 100;

const STARS = Array.from({ length: 86 }, (_, index) => {
  const rand = (salt: number) => {
    const value = Math.sin(index * salt) * 43758.5453;
    return value - Math.floor(value);
  };
  return {
    x: round(rand(127.1) * 100),
    y: round(rand(311.7) * 68),
    r: round(0.35 + rand(73.4) * 1.15),
    o: round(0.2 + rand(19.2) * 0.7),
  };
});

function Walker() {
  return (
    <svg viewBox="0 0 16 34" aria-hidden="true" className="block h-auto w-full drop-shadow">
      <circle cx="8" cy="3.2" r="2" fill="#3a291c" />
      <path
        fill="#3a291c"
        d="M7.1 6.2h2.1l.4 8.4 2.8.9-.4 1.5-3.2-1-.5 8.6H6.6l-.1-7.6-2.6 3.4-1.2-1.1 3-4.2-.4-4.8-2.4 1.7-.8-1.3 3.8-2.7-.4-2.8z"
      />
    </svg>
  );
}

export function HeroLegacy() {
  const trackRef = useRef<HTMLElement>(null);
  const reduce = useReduced();
  const { scrollYProgress } = useScroll({
    target: trackRef,
    // Progress hits 1 exactly when the sticky stage is released (track bottom meets viewport bottom).
    offset: ["start start", "end end"],
  });

  // Every range spans 0..1 explicitly: motion may run opacity natively on the scroll timeline, where a
  // missing end keyframe would interpolate back to the base value and make elements fade out then in again.
  // Distances use svh so parallax scales with the stage on every screen size.
  const copyY = useTransform(scrollYProgress, [0, 0.7, 1], ["0svh", "-9svh", "-9svh"]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0, 0]);
  const copyEvents = useTransform(scrollYProgress, (v) => (v > 0.5 ? "none" : "auto"));
  const navOpacity = useTransform(scrollYProgress, [0, 0.28, 0.72, 1], [1, 1, 0, 0]);
  const navEvents = useTransform(scrollYProgress, (v) => (v > 0.72 ? "none" : "auto"));
  const sandY = useTransform(scrollYProgress, [0, 1], ["0svh", "-14svh"]);
  const pyramidY = useTransform(scrollYProgress, [0, 1], ["0svh", "-5svh"]);
  const paused = reduce === true;

  return (
    <section ref={trackRef} id="top" className="hero-track relative bg-sand">
      <div className="sticky top-0 h-svh overflow-hidden bg-sand">
        <motion.div className="sky-wash absolute inset-0" aria-hidden="true">
          <svg className="absolute inset-0 h-full w-full">
            {STARS.map((star, index) => (
              <circle key={index} cx={`${star.x}%`} cy={`${star.y}%`} r={star.r} fill="#fff8ec" opacity={star.o} />
            ))}
          </svg>
          <div className="sky-grain absolute inset-0" />
        </motion.div>

        {/* Sand ground under the pyramid plate so its faded bottom edge never exposes the sky. */}
        <div
          className="absolute inset-x-0 bottom-0 z-[1] h-[34%] bg-gradient-to-b from-[#e3ad76] to-sand"
          aria-hidden="true"
        />

        <motion.div key={`m0-${Boolean(paused)}`}
          className="absolute left-[-4%] right-[-10%] top-[14%] z-[1] h-[72%] overflow-hidden will-change-transform"
          style={paused ? undefined : { y: pyramidY }}
        >
          <Image
            src="/images/egypt/giza-pyramids.png"
            alt="The pyramids of Giza rising behind desert dunes, a reminder of gypsum's ancient past"
            fill
            preload
            sizes="100vw"
            className="pyramid-plate origin-bottom object-cover object-[68%_88%]"
          />
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[42%] bg-gradient-to-t from-[#e9b77c]/55 via-[#edb87e]/20 to-transparent mix-blend-multiply"
            aria-hidden="true"
          />
        </motion.div>

        {/* Dune layer: sized by the larger of width/height so it always reaches the horizon; the walker rides on it. */}
        <motion.div
          className="pointer-events-none absolute bottom-[-20%] left-[33%] z-[2] will-change-transform"
          style={{ width: "max(196%, 260svh)", x: "-41.5%", ...(paused ? {} : { y: sandY }) }}
          aria-hidden="true"
        >
          <Image
            src="/images/egypt/dune-overlay.png"
            alt=""
            width={2172}
            height={724}
            preload
            sizes="(max-width: 760px) 260svh, 196vw"
            className="block h-auto w-full select-none"
          />
          <div className="absolute bottom-[33.5%] left-[41.5%] w-[0.5%] min-w-[11px] -translate-x-1/2">
            <Walker />
          </div>
        </motion.div>

        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[3] h-[26%] bg-[linear-gradient(to_bottom,transparent_0%,rgba(235,184,124,0.55)_62%,#ebb87c_88%)]"
          aria-hidden="true"
        />

        <motion.div key={`m1-${Boolean(paused)}`} className="relative z-20" style={paused ? undefined : { opacity: navOpacity, pointerEvents: navEvents }}>
          <SiteHeaderLegacy />
        </motion.div>

        <motion.div key={`m2-${Boolean(paused)}`}
          className="relative z-10 mx-auto mt-[7vh] max-w-[880px] px-6 text-center"
          style={paused ? undefined : { y: copyY, opacity: copyOpacity, pointerEvents: copyEvents }}
        >
          <p className="text-[10px] font-medium uppercase tracking-[0.46em] text-cream/75">GYPSOS Gypsum Plaster</p>
          <h1 className="mt-5 font-serif text-[clamp(38px,4.6vw,64px)] font-medium leading-[1.08] text-cream">
            A finish as old as the pyramids
            <br />
            perfected for modern walls
          </h1>
          <a href="#about" className="mt-8 inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.38em] text-cream/90">
            Discover GYPSOS
            <span className="grid h-7 w-7 place-items-center rounded-full border border-cream/55" aria-hidden="true">
              <span className="h-[5px] w-[5px] rounded-full bg-cream" />
            </span>
          </a>
        </motion.div>

        <p className="edge-label left-6 sm:left-8">Scroll</p>
        <p className="edge-label right-6 sm:right-8">Est. 2020</p>
      </div>
    </section>
  );
}
