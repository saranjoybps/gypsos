"use client";

import { LayoutGrid, Volume2, VolumeX } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Logo } from "@/components/gypsos/logo";
import { MenuOverlay } from "@/components/gypsos/menu-overlay";
import { NAV_LINKS } from "@/components/gypsos/nav-links";
import { useReduced } from "@/components/motion/scroll-primitives";

const VIDEO_SRC = "/video/hero-branding-video.mp4";
const POSTER_SRC = "/video/hero-poster.jpg";

function Header({ soundOn, onToggleSound, showSound }: { soundOn: boolean; onToggleSound: () => void; showSound: boolean }) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  return (
    <header className="absolute inset-x-0 top-0 z-30">
      <div className="mx-auto grid w-full max-w-[1280px] grid-cols-[1fr_auto_1fr] items-center px-5 pt-6 sm:px-8">
        <a href="#top" className="justify-self-start" aria-label="GYPSOS home">
          <Logo className="w-[120px] sm:w-[148px]" priority />
        </a>
        <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className="text-[12px] tracking-[0.16em] text-cream/90 transition-colors hover:text-cream">
              {link.label}
            </a>
          ))}
        </nav>
        <div className="col-start-3 flex items-center gap-4 justify-self-end text-cream">
          {showSound ? (
            <button
              type="button"
              data-sound-toggle
              onClick={onToggleSound}
              aria-pressed={soundOn}
              aria-label={soundOn ? "Mute hero video audio" : "Unmute hero video audio"}
              className="grid h-9 w-9 place-items-center border border-cream/40 bg-graphite/40 backdrop-blur-sm transition-colors hover:bg-cream hover:text-graphite"
            >
              {soundOn ? <Volume2 size={18} strokeWidth={1.5} aria-hidden="true" /> : <VolumeX size={18} strokeWidth={1.5} aria-hidden="true" />}
            </button>
          ) : null}
          <button type="button" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} onClick={() => setOpen((value) => !value)}>
            <LayoutGrid strokeWidth={1.25} size={18} />
          </button>
        </div>
        <MenuOverlay open={open} onClose={close} />
      </div>
    </header>
  );
}

export function HeroVideoLegacy() {
  const reduce = useReduced();
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  const [soundOn, setSoundOn] = useState(false);
  // The visitor's explicit choice wins over the "enable sound on first tap" fallback.
  const userChoice = useRef<"on" | "off" | null>(null);

  const toggleSound = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    const next = video.muted; // currently muted -> turn sound on
    userChoice.current = next ? "on" : "off";
    video.muted = !next;
    setSoundOn(next);
    if (next) void video.play().catch(() => undefined);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    const section = sectionRef.current;
    if (!video || !section || reduce) return;
    if (video.readyState >= 3) setReady(true); // canplay may have fired before hydration

    // Data Saver: keep the poster, skip the 5 MB video entirely.
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (conn?.saveData) return;

    let visible = true;
    let cancelled = false;

    // Sound is on by default. Browsers only allow audible autoplay in some cases, so try audible first;
    // if the browser refuses, play muted and switch the sound on at the visitor's first tap/click/key.
    const start = async () => {
      video.muted = false;
      try {
        await video.play();
        if (!cancelled) setSoundOn(true);
      } catch {
        if (cancelled) return;
        video.muted = true;
        setSoundOn(false);
        void video.play().catch(() => undefined);
      }
    };
    void start();

    const sync = () => {
      if (visible && !document.hidden) void video.play().catch(() => undefined);
      else video.pause();
    };
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        sync();
      },
      { threshold: 0.05 },
    );
    io.observe(section);
    document.addEventListener("visibilitychange", sync);

    const unlock = (event: Event) => {
      if ((event.target as Element | null)?.closest?.("[data-sound-toggle]")) return;
      if (userChoice.current === "off" || !video.muted) return;
      video.muted = false;
      setSoundOn(true);
      void video.play().catch(() => undefined);
    };
    const events = ["pointerdown", "touchend", "keydown", "click"] as const;
    events.forEach((name) => window.addEventListener(name, unlock, { passive: true }));

    return () => {
      cancelled = true;
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
      events.forEach((name) => window.removeEventListener(name, unlock));
    };
  }, [reduce]);

  return (
    <section ref={sectionRef} id="top" className="relative isolate h-svh min-h-[560px] overflow-hidden bg-graphite">
      {/* Full-bleed background video: poster paints first, video fades in once it can play */}
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={POSTER_SRC} alt="" className="absolute inset-0 h-full w-full object-cover object-[62%_50%]" fetchPriority="high" decoding="async" />
        {!reduce && (
          <video
            ref={videoRef}
            className={`absolute inset-0 h-full w-full object-cover object-[62%_50%] transition-opacity duration-700 ${ready ? "opacity-100" : "opacity-0"}`}
            src={VIDEO_SRC}
            poster={POSTER_SRC}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            disablePictureInPicture
            tabIndex={-1}
            onCanPlay={() => setReady(true)}
          />
        )}
        {/* readability overlays: top (nav), left + bottom (copy) */}
        <div className="absolute inset-0 bg-gradient-to-b from-graphite/70 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-graphite/80 via-graphite/35 to-transparent sm:via-graphite/25" />
        <div className="absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-graphite/90 via-graphite/45 to-transparent" />
      </div>

      <Header soundOn={soundOn} onToggleSound={toggleSound} showSound={!reduce} />

      <div className="mx-auto flex h-full w-full max-w-[1280px] items-end px-5 pb-[clamp(32px,9svh,96px)] pt-[clamp(96px,16svh,140px)] sm:px-8">
        <div className="w-full max-w-[980px]">
          <p className="text-[11px] font-bold uppercase tracking-[0.34em] text-ochre">GYPSOS Premium Grade Gypsum Plaster</p>
          <h1 className="mt-[2.4svh] font-sans text-[clamp(40px,min(7.6vw,14svh),118px)] font-extrabold uppercase leading-[0.9] tracking-[-0.03em] text-cream">
            Smooth walls.
            <br />
            <span className="text-ochre">Smaller bills.</span>
          </h1>
          <p className="mt-[3svh] max-w-[540px] text-[15px] font-medium leading-7 sm:text-[17px] sm:leading-8 text-cream/90">
            Gypsum plaster for interior walls and ceilings: a smooth, uniform finish, less surface preparation and an affordable rate. Premium quality. Professional
            performance. Reliable finishing.
          </p>
          <div className="mt-[4svh] flex flex-wrap gap-3">
            <a href="#calculator" className="bg-ochre px-7 py-4 text-[12px] font-bold uppercase tracking-[0.22em] text-graphite transition-colors hover:bg-cream">
              Work out my cost
            </a>
            <a href="#product" className="border-2 border-cream/80 px-7 py-4 text-[12px] font-bold uppercase tracking-[0.22em] text-cream transition-colors hover:bg-cream hover:text-graphite">
              See the plaster
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
