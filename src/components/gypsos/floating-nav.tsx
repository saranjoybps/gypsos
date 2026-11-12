"use client";

import { LayoutGrid } from "lucide-react";
import { motion, useMotionValueEvent, useScroll } from "motion/react";
import { useCallback, useState } from "react";
import { Logo } from "@/components/gypsos/logo";
import { MenuOverlay } from "@/components/gypsos/menu-overlay";
import { NAV_LINKS } from "@/components/gypsos/nav-links";

/** Compact fixed bar that appears once the pinned hero is done. Re-renders only when it toggles. */
export function FloatingNav() {
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (y) => {
    const threshold = window.innerHeight * 1.05;
    setVisible((current) => (current !== y > threshold ? y > threshold : current));
  });

  return (
    <>
      <motion.div
        className="fixed inset-x-0 top-0 z-[60] px-3 pt-3 sm:px-6"
        initial={false}
        animate={{ y: visible ? 0 : "-130%", opacity: visible ? 1 : 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        style={{ pointerEvents: visible ? "auto" : "none" }}
        aria-hidden={!visible}
      >
        <div className="mx-auto flex max-w-[1180px] items-center justify-between gap-4 bg-graphite/92 px-4 py-3 text-cream backdrop-blur-md sm:px-6">
          <a href="#top" aria-label="GYPSOS home" tabIndex={visible ? 0 : -1}>
            <Logo className="w-[104px] sm:w-[124px]" />
          </a>
          <nav className="hidden items-center gap-7 lg:flex" aria-label="Sections">
            {NAV_LINKS.map((link) => (
              <a key={link.href} href={link.href} tabIndex={visible ? 0 : -1} className="link-underline text-[11px] uppercase tracking-[0.2em] text-cream/75 transition-colors hover:text-cream">
                {link.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-4">
            <button type="button" tabIndex={visible ? 0 : -1} aria-label="Open menu" aria-expanded={open} onClick={() => setOpen(true)}>
              <LayoutGrid strokeWidth={1.25} size={18} />
            </button>
          </div>
        </div>
      </motion.div>
      <MenuOverlay open={open} onClose={close} />
    </>
  );
}
