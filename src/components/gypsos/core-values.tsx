"use client";

import { Anchor, Award, Handshake, HeartHandshake, IndianRupee, Lightbulb, ShieldCheck, Target } from "lucide-react";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { ScrubIn, WordReveal, useReduced } from "@/components/motion/scroll-primitives";

const VALUES = [
  { icon: Award, title: "Quality Excellence", body: "Premium grade is a standard we hold on every delivery." },
  { icon: IndianRupee, title: "Affordability", body: "Good plastering should not require a premium budget." },
  { icon: HeartHandshake, title: "Customer Satisfaction", body: "A finished wall the customer is glad to live with." },
  { icon: Lightbulb, title: "Tradition + Innovation", body: "An ancient material, made for how we build today." },
  { icon: ShieldCheck, title: "Integrity & Transparency", body: "Honest claims, clear pricing, no hidden surprises." },
  { icon: Anchor, title: "Reliability", body: "A material and a partner you can plan a schedule around." },
  { icon: Target, title: "Commitment to Excellence", body: "Small details of the finish are never treated as small." },
  { icon: Handshake, title: "Building Relationships", body: "Long-term trust with everyone who builds with us." },
];

function Value({ icon: Icon, title, body, index }: { icon: typeof Award; title: string; body: string; index: number }) {
  const ref = useRef<HTMLLIElement>(null);
  const reduce = useReduced();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.95", "start 0.6"] });
  const clip = useTransform(scrollYProgress, [0, 1], ["inset(100% 0 0 0)", "inset(0% 0 0 0)"]);
  const opacity = useTransform(scrollYProgress, [0, 1], [0.3, 1]);
  return (
    <li ref={ref} className="value-card group relative overflow-hidden border-t border-graphite/20 py-8 pr-4 sm:border-r sm:px-7 sm:[&:nth-child(2n)]:border-r-0 lg:[&:nth-child(2n)]:border-r lg:[&:nth-child(4n)]:border-r-0">
      <motion.div key={`m0-${Boolean(reduce)}`} aria-hidden="true" className="absolute inset-0 bg-gypsum" style={reduce ? undefined : { clipPath: clip }} />
      <motion.div key={`m1-${Boolean(reduce)}`} className="relative" style={reduce ? undefined : { opacity }}>
        <div className="flex items-start justify-between">
          <Icon size={30} strokeWidth={1.1} className="text-ochre-deep transition-transform duration-500 group-hover:-translate-y-1 group-hover:scale-110" aria-hidden="true" />
          <span className="outline-text font-serif text-[56px] leading-none text-ochre-deep/45">{index + 1}</span>
        </div>
        <h3 className="mt-8 font-serif text-[clamp(24px,2vw,30px)] font-medium leading-tight text-graphite">{title}</h3>
        <p className="mt-3 text-[14px] leading-6 text-graphite/75">{body}</p>
      </motion.div>
    </li>
  );
}

export function CoreValues() {
  return (
    <section id="values" className="bg-bone px-6 py-28 sm:py-36">
      <div className="mx-auto max-w-[1180px]">
        <ScrubIn y={24}>
          <p className="text-[10px] font-medium uppercase tracking-[0.46em] text-ochre-deep">Core values</p>
        </ScrubIn>
        <WordReveal text="What we hold ourselves to." className="mt-5 max-w-[820px] font-serif text-[clamp(38px,5.4vw,84px)] font-medium leading-[1.02] text-graphite" />
        <ul className="mt-16 grid border-b border-graphite/20 sm:grid-cols-2 lg:mt-24 lg:grid-cols-4">
          {VALUES.map((value, i) => (
            <Value key={value.title} index={i} {...value} />
          ))}
        </ul>
      </div>
    </section>
  );
}
