"use client";

/**
 * Shared scroll-linked animation primitives (motion/react only; no extra dependency).
 *
 * Rules every primitive follows:
 *  - Progress comes from `useScroll` on a target element, so scrolling up reverses it exactly.
 *  - All `useTransform` ranges span 0..1 explicitly (motion may run opacity natively on the scroll
 *    timeline; a missing end keyframe would interpolate back to the base value).
 *  - Reduced motion renders the final, static state.
 */

import {
  animate,
  motion,
  useInView,
  useMotionTemplate,
  useMotionValue,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useEffect, useMemo, useRef, useSyncExternalStore, type ReactNode } from "react";

/* -------------------------------------------------------------------------- */
/* Media query helper (no setState-in-effect)                                  */
/* -------------------------------------------------------------------------- */

function useMediaQuery(query: string, serverValue = false) {
  return useSyncExternalStore(
    (notify) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", notify);
      return () => mq.removeEventListener("change", notify);
    },
    () => window.matchMedia(query).matches,
    () => serverValue,
  );
}

/** Hydration-safe reduced-motion flag: false on the server and first client render, then the live preference.
 *  (motion's own hook reads the preference on the first client render, which disagrees with server HTML
 *  and leaves server-rendered inline styles stuck.) */
export function useReduced() {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}

/** True from the `lg` breakpoint (1024px) up. Used to gate pinning / heavy effects. */
export function useDesktop() {
  return useMediaQuery("(min-width: 1024px)");
}

/* -------------------------------------------------------------------------- */
/* Scroll-scrubbed word reveal (text colours in as you scroll)                 */
/* -------------------------------------------------------------------------- */

function Word({ word, progress, from, to }: { word: string; progress: MotionValue<number>; from: number; to: number }) {
  const opacity = useTransform(progress, [0, from, to, 1], [0.16, 0.16, 1, 1]);
  return (
    <motion.span style={{ opacity }} className="inline-block">
      {word}
    </motion.span>
  );
}

export function WordReveal({
  text,
  className,
  as: Tag = "h2",
}: {
  text: string;
  className?: string;
  as?: "h1" | "h2" | "h3" | "p";
}) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReduced();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.88", "end 0.5"] });
  const words = useMemo(() => text.split(" "), [text]);
  const step = 0.85 / words.length;

  if (reduce) return <Tag className={className}>{text}</Tag>;

  return (
    <Tag ref={ref as never} className={className} aria-label={text}>
      {words.map((word, i) => (
        <span key={`${word}-${i}`} aria-hidden="true">
          <Word word={word} progress={scrollYProgress} from={i * step} to={Math.min(1, i * step + step * 2.2)} />
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </Tag>
  );
}

/* -------------------------------------------------------------------------- */
/* ScrubIn: element rises and fades in tied to scroll (reverses on scroll up)   */
/* -------------------------------------------------------------------------- */

export function ScrubIn({
  children,
  className,
  y = 48,
  x = 0,
  start = 0.96,
  end = 0.66,
}: {
  children: ReactNode;
  className?: string;
  y?: number;
  x?: number;
  start?: number;
  end?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReduced();
  const { scrollYProgress } = useScroll({ target: ref, offset: [`start ${start}`, `start ${end}`] });
  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const ty = useTransform(scrollYProgress, [0, 1], [y, 0]);
  const tx = useTransform(scrollYProgress, [0, 1], [x, 0]);
  return (
    <motion.div key={`m0-${Boolean(reduce)}`} ref={ref} className={className} style={reduce ? undefined : { opacity, y: ty, x: tx }}>
      {children}
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/* Parallax: layer drifts against the scroll (distance in svh so it scales)     */
/* -------------------------------------------------------------------------- */

export function Parallax({
  children,
  className,
  from = 8,
  to = -8,
  rotate,
  desktopOnly = false,
}: {
  children: ReactNode;
  className?: string;
  /** starting offset in svh when the element enters from the bottom */
  from?: number;
  /** ending offset in svh when it leaves at the top */
  to?: number;
  /** optional [startDeg, endDeg] */
  rotate?: [number, number];
  desktopOnly?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReduced();
  const desktop = useDesktop();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [`${from}svh`, `${to}svh`]);
  const rot = useTransform(scrollYProgress, [0, 1], [rotate?.[0] ?? 0, rotate?.[1] ?? 0]);
  const off = reduce || (desktopOnly && !desktop);
  return (
    <motion.div key={`m1-${Boolean(off)}`} ref={ref} className={className} style={off ? undefined : { y, rotate: rot }}>
      {children}
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/* ClipReveal: media is unveiled by an expanding inset mask                      */
/* -------------------------------------------------------------------------- */

export function ClipReveal({
  children,
  className,
  inset = 14,
  start = 0.95,
  end = 0.45,
  scaleFrom = 1.18,
}: {
  children: ReactNode;
  className?: string;
  /** starting inset, in percent */
  inset?: number;
  start?: number;
  end?: number;
  scaleFrom?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReduced();
  const { scrollYProgress } = useScroll({ target: ref, offset: [`start ${start}`, `start ${end}`] });
  const inner = useTransform(scrollYProgress, [0, 1], [inset, 0]);
  const clip = useMotionTemplate`inset(${inner}% ${inner}% ${inner}% ${inner}%)`;
  const scale = useTransform(scrollYProgress, [0, 1], [scaleFrom, 1]);
  return (
    <div ref={ref} className={className}>
      <motion.div key={`m2-${Boolean(reduce)}`} className="relative h-full w-full overflow-hidden" style={reduce ? undefined : { clipPath: clip }}>
        <motion.div key={`m3-${Boolean(reduce)}`} className="relative h-full w-full" style={reduce ? undefined : { scale }}>
          {children}
        </motion.div>
      </motion.div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* CountUp                                                                      */
/* -------------------------------------------------------------------------- */

export function CountUp({
  to,
  from = 0,
  duration = 1.8,
  className,
}: {
  to: number;
  from?: number;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduce = useReduced();
  const inView = useInView(ref, { once: true, margin: "0px 0px -15% 0px" });
  const value = useMotionValue(reduce ? to : from);

  useEffect(() => {
    if (!inView || reduce) return;
    const controls = animate(value, to, { duration, ease: [0.16, 1, 0.3, 1] });
    return () => controls.stop();
  }, [inView, reduce, value, to, duration]);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    node.textContent = String(Math.round(value.get()));
    return value.on("change", (latest) => {
      node.textContent = String(Math.round(latest));
    });
  }, [value]);

  return (
    <span ref={ref} className={className} aria-label={String(to)}>
      {to}
    </span>
  );
}
