"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { ClipReveal, Parallax, ScrubIn, WordReveal, useReduced } from "@/components/motion/scroll-primitives";

const PILLARS = ["Premium", "Professional", "Affordable", "Innovative"];

export function BrandIntro() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReduced();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const markX = useTransform(scrollYProgress, [0, 1], ["8vw", "-14vw"]);

  return (
    <section ref={ref} id="about" className="hero-to-intro relative overflow-hidden px-6 pb-28 pt-24 sm:pt-32 lg:pb-40">
      <motion.p key={`m0-${Boolean(reduce)}`}
        aria-hidden="true"
        className="outline-text pointer-events-none absolute left-0 top-[18%] select-none whitespace-nowrap font-serif text-[34vw] font-medium leading-none text-ink/15 lg:top-[8%]"
        style={reduce ? undefined : { x: markX }}
      >
        GYPSOS
      </motion.p>

      <div className="relative mx-auto max-w-[1180px]">
        <ScrubIn y={24} className="text-center">
          <p className="text-[10px] font-medium uppercase tracking-[0.46em] text-ochre-deep">GYPSOS Buildtech India Private Limited · Est. 2020</p>
        </ScrubIn>

        <WordReveal
          text="Premium-grade gypsum plaster for walls that deserve a better finish."
          className="mx-auto mt-6 max-w-[980px] text-center font-serif text-[clamp(38px,6.2vw,92px)] font-medium leading-[1.02] text-graphite"
        />

        <div className="mt-16 grid items-start gap-12 lg:mt-24 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
          <ScrubIn x={-30} className="max-w-md text-[15px] leading-[1.8] text-ink/85 lg:justify-self-end">
            <p>GYPSOS is a gypsum plaster brand established in 2020, supplying and distributing gypsum plaster products across India.</p>
            <p className="mt-5">
              At GYPSOS, we believe premium quality should not come at a premium price. We focus on delivering superior-grade gypsum plaster with excellent finishing,
              consistent quality and reliable performance at an affordable cost.
            </p>
            <p className="mt-5">
              Our commitment to quality, cost efficiency, customer satisfaction and dependable service makes us different. We aim to make premium plastering solutions
              accessible to every construction project.
            </p>
          </ScrubIn>

          <div className="relative">
            <Parallax from={6} to={-6}>
              <ClipReveal className="relative aspect-[4/3] w-full bg-bone" inset={16}>
                <Image
                  src="/images/gypsos/interior.jpg"
                  alt="A bright interior room with smooth, uniformly finished white walls"
                  fill
                  sizes="(max-width: 1024px) 92vw, 560px"
                  className="object-cover object-[60%_40%]"
                />
              </ClipReveal>
            </Parallax>
            <Parallax from={-4} to={10} className="absolute -bottom-8 -left-4 hidden sm:block lg:-left-14">
              <p className="bg-graphite px-5 py-4 font-serif text-[22px] leading-tight text-cream">
                Smooth walls.
                <br />
                <span className="text-ochre">Sensible cost.</span>
              </p>
            </Parallax>
          </div>
        </div>

        <ul className="mt-24 grid grid-cols-2 border-t border-graphite/20 lg:mt-32 lg:grid-cols-4" aria-label="Brand positioning">
          {PILLARS.map((word, i) => (
            <li key={word} className="border-b border-graphite/20 py-6 pr-4 lg:border-b-0 lg:border-r lg:pl-6 lg:first:pl-0 lg:last:border-r-0">
              <ScrubIn y={28} start={1} end={0.8}>
                <span className="font-sans text-[11px] tracking-[0.3em] text-ink/50">{String(i + 1).padStart(2, "0")}</span>
                <p className="mt-2 font-serif text-[clamp(26px,3vw,40px)] font-medium leading-none text-graphite">{word}</p>
              </ScrubIn>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
