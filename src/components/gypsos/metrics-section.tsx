import { CountUp, ScrubIn } from "@/components/motion/scroll-primitives";

/** Only verified facts are numbers. Everything else is stated as a qualitative highlight. */
export function MetricsSection() {
  return (
    <section aria-label="Company highlights" className="plaster-grain relative overflow-hidden bg-graphite px-6 py-24 text-cream sm:py-32">
      <div className="relative z-10 mx-auto max-w-[1180px]">
        <ScrubIn y={24}>
          <p className="text-[10px] font-medium uppercase tracking-[0.46em] text-ochre">GYPSOS at a glance</p>
        </ScrubIn>
        <dl className="mt-12 grid gap-px bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-graphite py-10 sm:pr-8 lg:py-4">
            <dt className="text-[11px] uppercase tracking-[0.3em] text-white/50">Established</dt>
            <dd className="mt-5 font-serif text-[clamp(64px,8vw,116px)] font-medium leading-none">
              <CountUp from={2000} to={2026} />
            </dd>
            <p className="mt-4 max-w-[220px] text-[13px] leading-6 text-white/65">Founded as GYPSOS Buildtech India Private Limited.</p>
          </div>
          <div className="bg-graphite py-10 sm:pl-8 lg:px-8 lg:py-4">
            <dt className="text-[11px] uppercase tracking-[0.3em] text-white/50">Distribution</dt>
            <dd className="mt-5 font-serif text-[clamp(64px,8vw,116px)] font-medium leading-none text-ochre">India</dd>
            <p className="mt-4 max-w-[220px] text-[13px] leading-6 text-white/65">Gypsum plaster supplied and distributed across the country.</p>
          </div>
          <div className="bg-graphite py-10 sm:pr-8 lg:px-8 lg:py-4">
            <dt className="text-[11px] uppercase tracking-[0.3em] text-white/50">Focused range</dt>
            <dd className="mt-5 font-serif text-[clamp(64px,8vw,116px)] font-medium leading-none">
              <CountUp from={0} to={1} duration={1} />
            </dd>
            <p className="mt-4 max-w-[240px] text-[13px] leading-6 text-white/65">One product, made well: GYPSOS Premium Grade Gypsum Plaster.</p>
          </div>
          <div className="bg-graphite py-10 sm:pl-8 lg:py-4 lg:pl-8">
            <dt className="text-[11px] uppercase tracking-[0.3em] text-white/50">Brand pillars</dt>
            <dd className="mt-5 font-serif text-[clamp(64px,8vw,116px)] font-medium leading-none">
              <CountUp from={0} to={4} duration={1.2} />
            </dd>
            <p className="mt-4 max-w-[240px] text-[13px] leading-6 text-white/65">Premium, professional, affordable and innovative.</p>
          </div>
        </dl>
        <dl className="mt-px grid gap-px bg-white/10 sm:grid-cols-3">
          <div className="bg-graphite py-10 sm:pr-8 lg:py-8">
            <dt className="text-[11px] uppercase tracking-[0.3em] text-white/50">Architects</dt>
            <dd className="mt-5 font-serif text-[clamp(56px,7vw,96px)] font-medium leading-none">
              <CountUp from={0} to={100} />+
            </dd>
          </div>
          <div className="bg-graphite py-10 sm:px-8 lg:py-8">
            <dt className="text-[11px] uppercase tracking-[0.3em] text-white/50">Builders &amp; promoters</dt>
            <dd className="mt-5 font-serif text-[clamp(56px,7vw,96px)] font-medium leading-none text-ochre">
              <CountUp from={0} to={200} />+
            </dd>
          </div>
          <div className="bg-graphite py-10 sm:pl-8 lg:py-8">
            <dt className="text-[11px] uppercase tracking-[0.3em] text-white/50">Individual home owners</dt>
            <dd className="mt-5 font-serif text-[clamp(56px,7vw,96px)] font-medium leading-none">
              <CountUp from={0} to={500} />+
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
