"use client";

import { signOut } from "firebase/auth";
import { LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { Logo } from "@/components/gypsos/logo";
import { authFor } from "@/lib/portal/client";

export interface NavItem {
  href: string;
  label: string;
  badge?: number;
}

/** Sidebar (desktop) / scrolling tab bar (mobile) frame shared by the vendor and admin portals. */
export function PortalShell({ role, nav, loginHref, userLabel, children }: { role: string; nav: NavItem[]; loginHref: string; userLabel: string; children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const active = (href: string) => (href === nav[0].href ? pathname === href : pathname.startsWith(href));

  async function logout() {
    await signOut(authFor(loginHref.startsWith("/admin") ? "admin" : "vendor"));
    router.replace(loginHref);
  }

  return (
    <div className="min-h-svh bg-sand text-graphite lg:grid lg:grid-cols-[240px_minmax(0,1fr)]">
      <aside className="sticky top-0 z-40 bg-graphite text-cream print:hidden lg:flex lg:h-svh lg:flex-col">
        <div className="flex items-center justify-between gap-3 px-4 py-3 lg:block lg:px-6 lg:py-7">
          <Link href="/" aria-label="GYPSOS website" className="shrink-0">
            <Logo className="w-[96px] lg:w-[130px]" />
          </Link>
          <div className="flex min-w-0 items-center gap-3 lg:block">
            <p className="truncate text-[10px] uppercase tracking-[0.24em] text-ochre sm:tracking-[0.32em] lg:mt-4">{role}</p>
            <button type="button" onClick={logout} className="grid h-9 w-9 shrink-0 place-items-center text-cream/80 hover:text-ochre lg:hidden" aria-label="Sign out">
              <LogOut size={16} aria-hidden="true" />
            </button>
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:flex-1 lg:flex-col lg:overflow-visible lg:px-3 lg:pb-0" aria-label={`${role} sections`}>
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active(item.href) ? "page" : undefined}
              className={`flex shrink-0 items-center justify-between gap-3 px-3 py-2.5 text-[12px] uppercase tracking-[0.16em] transition-colors ${
                active(item.href) ? "bg-ochre text-graphite" : "text-cream/75 hover:bg-white/10 hover:text-cream"
              }`}
            >
              {item.label}
              {item.badge ? <span className="bg-cream px-1.5 py-0.5 text-[10px] font-bold text-graphite">{item.badge}</span> : null}
            </Link>
          ))}
        </nav>
        <div className="hidden border-t border-white/10 px-5 py-5 lg:block">
          <p className="truncate text-[12px] text-cream/60" title={userLabel}>
            {userLabel}
          </p>
          <button type="button" onClick={logout} className="mt-3 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-cream/80 hover:text-ochre">
            <LogOut size={14} aria-hidden="true" /> Sign out
          </button>
        </div>
      </aside>
      <div className="relative min-w-0 px-5 py-8 sm:px-8 lg:px-12 lg:py-12 print:p-0">{children}</div>
    </div>
  );
}
