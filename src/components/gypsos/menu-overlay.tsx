"use client";

import { X } from "lucide-react";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Logo } from "@/components/gypsos/logo";
import { MENU_LINKS } from "@/components/gypsos/nav-links";

/** Full-screen menu. Locks background scroll, traps Tab inside, closes on Escape and restores focus. */
export function MenuOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    panelRef.current?.querySelector<HTMLElement>("button, a")?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;
      const items = panelRef.current.querySelectorAll<HTMLElement>("a[href], button");
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = overflow;
      previous?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div ref={panelRef} className="fixed inset-0 z-[70] overflow-y-auto bg-graphite/97 text-cream" role="dialog" aria-modal="true" aria-label="Menu">
      <div className="mx-auto flex min-h-full max-w-[1180px] flex-col px-6 py-7">
        <div className="flex items-center justify-between">
          <Logo className="w-[140px]" />
          <button type="button" className="grid h-10 w-10 place-items-center" aria-label="Close menu" onClick={onClose}>
            <X strokeWidth={1.25} size={20} />
          </button>
        </div>
        <nav className="mt-10 flex flex-col gap-3 sm:mt-14 sm:gap-4" aria-label="Menu">
          {MENU_LINKS.map((link, i) => (
            <a
              key={link.href}
              href={link.href}
              onClick={onClose}
              className="group flex items-baseline gap-5 border-b border-white/10 pb-3 font-serif text-[clamp(28px,5vw,48px)] font-medium leading-none transition-colors hover:text-ochre"
            >
              <span className="font-sans text-[11px] tracking-[0.3em] text-white/40">{String(i + 1).padStart(2, "0")}</span>
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </div>,
    document.body,
  );
}
