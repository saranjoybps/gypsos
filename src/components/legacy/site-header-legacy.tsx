"use client";

import { LayoutGrid } from "lucide-react";
import { useCallback, useState } from "react";
import { Logo } from "@/components/gypsos/logo";
import { MenuOverlay } from "@/components/gypsos/menu-overlay";
import { NAV_LINKS } from "@/components/gypsos/nav-links";

export function SiteHeaderLegacy() {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  return (
    <header className="relative z-20 mx-auto grid w-full max-w-[1180px] grid-cols-[1fr_auto_1fr] items-center px-5 pt-7 sm:px-8">
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
    </header>
  );
}
