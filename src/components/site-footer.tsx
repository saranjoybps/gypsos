import { Logo } from "@/components/gypsos/logo";

const LINKS = [
  { href: "#top", label: "Home" },
  { href: "#about", label: "About" },
  { href: "#why", label: "Why GYPSOS" },
  { href: "#history", label: "Gypsum history" },
  { href: "#product", label: "Product" },
  { href: "#benefits", label: "Benefits" },
  { href: "#applications", label: "Applications" },
  { href: "#directors", label: "Directors" },
  { href: "#calculator", label: "Cost calculator" },
  { href: "#contact", label: "Contact" },
];

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden bg-teal-night px-6 pb-10 pt-20 text-cream">
      <p aria-hidden="true" className="outline-text pointer-events-none absolute -bottom-[3vw] left-1/2 -translate-x-1/2 select-none whitespace-nowrap font-serif text-[22vw] leading-none text-white/10">
        GYPSOS
      </p>
      <div className="relative mx-auto max-w-[1180px]">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr_1fr]">
          <div>
            <a href="#top" aria-label="GYPSOS home" className="inline-block">
              <Logo className="w-[180px]" />
            </a>
            <p className="mt-6 text-[13px] uppercase tracking-[0.22em] text-cream/80">GYPSOS Buildtech India Private Limited</p>
            <p className="mt-4 max-w-sm text-[14px] leading-7 text-cream/65">
              A gypsum plaster brand established in 2020: premium, professional, affordable and innovative plastering solutions for builders, contractors and homeowners
              across India.
            </p>
          </div>
          <nav aria-label="Footer">
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-ochre">Explore</p>
            <ul className="mt-5 grid grid-cols-2 gap-x-8 gap-y-3">
              {LINKS.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="text-[13px] text-cream/75 transition-colors hover:text-cream">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-ochre">Our product</p>
            <a href="#product" className="mt-5 block font-serif text-[26px] leading-tight text-cream transition-colors hover:text-ochre">
              GYPSOS Premium Grade Gypsum Plaster
            </a>
            <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.3em] text-ochre">Enquiries</p>
            <a href="#contact" className="mt-3 inline-block border border-cream/40 px-6 py-3 text-[11px] uppercase tracking-[0.26em] transition-colors btn-sweep [--sweep:var(--color-cream)] hover:text-graphite">
              Send an enquiry
            </a>
          </div>
        </div>

        <div className="mt-16 border-t border-white/15 pt-6">
          <p className="text-[12px] text-cream/65">© 2026 GYPSOS Buildtech India Private Limited. All rights reserved.</p>
          <p className="mt-4 max-w-4xl text-[10.5px] leading-5 text-cream/40">
            Image credits (Wikimedia Commons): selenite by Bryan Barnes (CC BY-SA 4.0); apartment towers by Joel Samuel Raj (CC BY-SA 4.0); residential buildings by
            Oviyan2014 (CC BY-SA 4.0); office towers by Mohammad Anees Qamar (CC0); interior room by aismallard (CC BY-SA 3.0); tomb painting fragment is in the public
            domain.
          </p>
        </div>
      </div>
    </footer>
  );
}
