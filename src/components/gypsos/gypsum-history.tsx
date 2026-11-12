"use client";

import { Droplets, Flame, Gem, Layers, Mountain } from "lucide-react";
import Image from "next/image";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useRef, type ReactNode } from "react";
import { BagImage } from "@/components/gypsos/bag-image";
import { ScrubIn, useReduced } from "@/components/motion/scroll-primitives";

/* ------------------------------------------------------------------ */
/* Chapter shell                                                       */
/* ------------------------------------------------------------------ */

function Chapter({ n, kicker, title, children, visual, pinned }: { n: string; kicker: string; title: string; children: ReactNode; visual: ReactNode; pinned: boolean }) {
  // Pinned (every screen size): one full-screen panel per chapter, fitted to the viewport height with svh-based sizing.
  // Unpinned (reduced motion): a plain stacked article.
  const shell = pinned
    ? "relative flex h-svh w-screen shrink-0 flex-col gap-[2svh] px-6 pb-[52px] pt-[max(25svh,172px)] sm:px-10 lg:flex-row lg:items-center lg:gap-[5vw] lg:px-[7vw] lg:pb-[max(13svh,84px)] lg:pt-[max(25svh,196px)]"
    : "relative flex flex-col justify-center gap-10 px-6 py-14 sm:px-10 lg:flex-row lg:items-center lg:gap-[5vw] lg:px-[7vw] lg:py-20";
  return (
    <article className={shell}>
      <span aria-hidden="true" className="outline-text pointer-events-none absolute bottom-12 right-4 select-none font-serif text-[22vw] font-medium leading-none text-white/10 lg:bottom-[9vh] lg:right-[3vw] lg:text-[14vw]">
        {n}
      </span>
      <div className="relative z-10 max-w-[520px] shrink-0 lg:w-[38vw] lg:max-w-none">
        <p className="text-[10px] font-medium uppercase tracking-[0.34em] text-ochre sm:tracking-[0.42em]">{kicker}</p>
        <h3 className="mt-2 font-serif text-[clamp(23px,3.7svh,34px)] font-medium leading-[1.04] text-cream lg:mt-3 lg:text-[clamp(30px,min(4vw,6.5svh),60px)] lg:leading-[1.02]">{title}</h3>
        <div className="mt-2.5 space-y-2 text-[clamp(11px,1.75svh,14.5px)] leading-[1.55] text-cream/75 lg:mt-4 lg:space-y-3 lg:text-[clamp(13px,2svh,15px)] lg:leading-[1.65]">{children}</div>
      </div>
      <div className={pinned ? "relative z-10 min-h-0 flex-1 lg:w-[42vw] lg:flex-none" : "relative z-10 lg:w-[42vw]"}>{visual}</div>
    </article>
  );
}

/* ------------------------------------------------------------------ */
/* Visuals                                                             */
/* ------------------------------------------------------------------ */

function PhotoFrame({ src, alt, sizes, position, shift, ratio = "lg:aspect-[4/3]", caption, pinned }: { src: string; alt: string; sizes: string; position: string; shift?: MotionValue<string>; ratio?: string; caption: string; pinned: boolean }) {
  return (
    <figure className={pinned ? "flex h-full min-h-0 flex-col lg:block lg:h-auto" : ""}>
      <div className={`relative overflow-hidden bg-graphite ${pinned ? "min-h-0 flex-1 lg:flex-none" : "aspect-[4/3]"} ${ratio} lg:max-h-[62svh] lg:w-full`}>
        <motion.div key={`m0-${Boolean(shift)}`} className="absolute inset-y-0 -left-[8%] -right-[8%]" style={shift ? { x: shift } : undefined}>
          <Image src={src} alt={alt} fill sizes={sizes} className={`object-cover ${position}`} />
        </motion.div>
      </div>
      <figcaption className="mt-2 shrink-0 text-[10px] leading-4 tracking-[0.03em] text-cream/50 lg:mt-3 lg:text-[11px] lg:leading-5 lg:tracking-[0.04em]">{caption}</figcaption>
    </figure>
  );
}

const STEPS = [
  { icon: Mountain, label: "Gypsum rock", note: "CaSO₄·2H₂O, rock with crystal water locked in" },
  { icon: Flame, label: "Gentle heat", note: "Most of the crystal water is driven off" },
  { icon: Layers, label: "Fine powder", note: "Ground to a dry, workable plaster powder" },
  { icon: Droplets, label: "Add water", note: "The powder takes the water back" },
  { icon: Gem, label: "Sets solid", note: "Hardens into a smooth, solid surface" },
];

function Process({ progress }: { progress: MotionValue<number> }) {
  const reduce = useReduced();
  const fill = useTransform(progress, [0, 0.25, 0.5, 1], [0, 0, 1, 1]);
  return (
    <ol className="relative space-y-[1.7svh] border-l border-white/15 pl-8 [@media(max-height:520px)]:space-y-[6px] lg:space-y-6">
      <motion.span key={`m1-${Boolean(reduce)}`} aria-hidden="true" className="absolute -left-px top-0 h-full w-px origin-top bg-ochre" style={reduce ? undefined : { scaleY: fill }} />
      {STEPS.map(({ icon: Icon, label, note }, i) => (
        <li key={label} className="relative">
          <span className="absolute -left-[50px] top-0 grid h-8 w-8 lg:h-9 lg:w-9 place-items-center border border-ochre/60 bg-teal-night text-ochre">
            <Icon size={16} strokeWidth={1.4} />
          </span>
          <p className="text-[10px] tracking-[0.3em] text-white/40 [@media(max-height:520px)]:hidden">STEP {i + 1}</p>
          <p className="font-serif text-[clamp(16px,2.5svh,24px)] leading-tight text-cream">{label}</p>
          <p className="mt-0.5 text-[12px] leading-5 text-cream/60 [@media(max-height:720px)]:hidden max-lg:[@media(max-height:880px)]:hidden lg:mt-1 lg:text-[13px] lg:leading-6">{note}</p>
        </li>
      ))}
    </ol>
  );
}

/* ------------------------------------------------------------------ */
/* Section                                                             */
/* ------------------------------------------------------------------ */

export function GypsumHistory() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReduced();
  const pinned = !reduce; // pinned horizontal story on every screen size; only reduced motion gets the stacked layout
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  // Four 100vw panels; hold briefly at each end so the first and last chapters can be read.
  const trackX = useTransform(scrollYProgress, [0, 0.04, 0.96, 1], ["0vw", "0vw", "-300vw", "-300vw"]);
  const bg = useTransform(scrollYProgress, [0, 1], ["#0f2f32", "#1c1a18"]);
  const bar = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const photoShift = useTransform(scrollYProgress, [0, 1], ["5%", "-5%"]);
  const photoShiftB = useTransform(scrollYProgress, [0, 1], ["-5%", "5%"]);

  return (
    <section id="history" ref={ref} aria-labelledby="history-title" className={pinned ? "relative h-[520svh]" : "relative"}>
      <motion.div className={pinned ? "sticky top-0 h-svh overflow-hidden" : "overflow-hidden"} style={{ backgroundColor: pinned ? bg : "#0f2f32" }}>
        {/* intro strip (always above chapters on small screens, overlaid on desktop) */}
        <div className={pinned ? "absolute inset-x-0 top-0 z-20 px-6 pt-[78px] sm:px-10 lg:px-[7vw] lg:pt-[92px]" : "relative z-20 px-6 pt-24 sm:px-10 lg:px-[7vw]"}>
          <ScrubIn y={20}>
            <p className="font-medium uppercase text-[9px] tracking-[0.2em] text-ochre sm:text-[10px] sm:tracking-[0.46em]">From ancient Egypt to modern construction</p>
            <h2 id="history-title" className="mt-3 font-serif text-[clamp(26px,3.2vw,48px)] font-medium leading-tight text-cream lg:max-w-[40vw]">
              The long history of gypsum
            </h2>
          </ScrubIn>
        </div>

        <motion.div key={`m2-${Boolean(pinned)}`} className={pinned ? "flex h-full flex-row will-change-transform" : "flex flex-col"} style={pinned ? { x: trackX } : undefined}>
          <Chapter
            pinned={pinned}
            n="01"
            kicker="Chapter one · The mineral"
            title="Born of water and time"
            visual={
              <PhotoFrame
                pinned={pinned}
                src="/images/gypsos/selenite.jpg"
                alt="A cluster of translucent selenite, a crystalline form of gypsum, photographed against a dark background"
                sizes="(max-width: 1024px) 92vw, 46vw"
                position="object-center"
                shift={pinned ? photoShift : undefined}
                caption="Selenite, a crystalline form of gypsum. Photo: Bryan Barnes, CC BY-SA 4.0, via Wikimedia Commons."
              />
            }
          >
            <p>
              Gypsum is calcium sulphate dihydrate, a soft mineral that forms when mineral-rich water evaporates and leaves crystals and thick beds behind. It is soft
              enough to scratch with a fingernail, and it holds water inside its crystal structure.
            </p>
            <p>That locked-in water is the secret of everything that follows.</p>
          </Chapter>

          <Chapter
            pinned={pinned}
            n="02"
            kicker="Chapter two · The transformation"
            title="Fire, then water"
            visual={
              <div className="grid h-full items-center gap-8 sm:grid-cols-[1fr_0.9fr]">
                <Process progress={scrollYProgress} />
                <div className="relative hidden aspect-[3/4] overflow-hidden bg-graphite sm:block lg:max-h-[56svh]">
                  <Image src="/images/gypsos/rock-gypsum.jpg" alt="Close-up of raw rock gypsum showing crystalline texture" fill sizes="22vw" className="object-cover opacity-80" />
                </div>
              </div>
            }
          >
            <p>
              Heat gypsum gently and it gives up most of its crystal water, turning into a dry powder: plaster. Mix that powder with water and it takes the water back,
              setting into a solid, smooth mass.
            </p>
            <p>Early builders learned this long before anyone could explain the chemistry. Their kilns were open fires.</p>
          </Chapter>

          <Chapter
            pinned={pinned}
            n="03"
            kicker="Chapter three · Ancient Egypt"
            title="Mortar, plaster and painted tombs"
            visual={
              <PhotoFrame
                pinned={pinned}
                src="/images/gypsos/nebamun.jpg"
                alt="A painted fragment from an ancient Egyptian tomb-chapel showing a man hunting birds in the marshes"
                sizes="(max-width: 1024px) 92vw, 40vw"
                position="object-center"
                shift={pinned ? photoShiftB : undefined}
                ratio="lg:aspect-[5/4]"
                caption="Painted tomb-chapel fragment from Thebes (public domain). Decorated walls began with a prepared plaster surface."
              />
            }
          >
            <p>
              Ancient Egyptians burned gypsum, ground it and mixed it with water. The plaster was used as bedding mortar between stone blocks and to coat and smooth
              walls, including the surfaces that tomb paintings were made on.
            </p>
            <p className="border-l-2 border-ochre pl-4 text-cream/90">
              A note on accuracy: the pyramids are built of stone. Gypsum was a jointing, coating and finishing material, never their structure.
            </p>
          </Chapter>

          <Chapter
            pinned={pinned}
            n="04"
            kicker="Chapter four · Today"
            title="Same chemistry. Controlled for the finish."
            visual={
              <div className="relative mx-auto flex h-full max-w-[460px] items-end justify-center gap-4 lg:h-auto lg:max-w-none lg:gap-6">
                <BagImage sizes="(max-width: 1024px) 60vw, 360px" className="h-full drop-shadow-2xl lg:h-[52svh] lg:max-h-[520px] lg:min-h-[300px]" />
              </div>
            }
          >
            <p>
              Modern gypsum plaster applies the same chemistry with controlled manufacturing: a measured powder, predictable setting behaviour and a smooth finish for
              interior walls and ceilings.
            </p>
            <p>
              GYPSOS Premium Grade Gypsum Plaster carries that old craft into residential and commercial finishing across India.
            </p>
          </Chapter>
        </motion.div>

        {/* progress rail (desktop pinned only) */}
        {pinned ? (
          <div className="absolute inset-x-6 bottom-5 z-20 flex items-center gap-4 sm:inset-x-10 lg:inset-x-[7vw] lg:bottom-[5vh] lg:gap-5" aria-hidden="true">
            <span className="text-[10px] tracking-[0.3em] text-white/50">MINERAL</span>
            <div className="relative h-px flex-1 bg-white/15">
              <motion.span className="absolute inset-0 origin-left bg-ochre" style={{ scaleX: bar }} />
            </div>
            <span className="text-[10px] tracking-[0.3em] text-white/50">TODAY</span>
          </div>
        ) : null}
      </motion.div>
    </section>
  );
}
