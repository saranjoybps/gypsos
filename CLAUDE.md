# GYPSOS Buildtech India website (gypsos-v2)

Single-page cinematic marketing site for GYPSOS (gypsum plaster brand, est. 2020). One route (`/`) plus `POST /api/enquiry`. Optional server env var `ENQUIRY_WEBHOOK_URL` forwards enquiries; without it they are validated but not delivered. The hero is a scroll-driven pyramid scene: the sunrise pyramid plate (`public/images/egypt/pyramids-sunrise.webp`) stays anchored while one dune layer (`dunes-sand.webp`, real alpha cut-out) rises with scroll, plus drifting dust motes (sticky track, `motion/react`); the older heroes, including the video hero, are kept unrendered in `src/components/legacy/`.

## Stack (verified from package.json / node_modules)
Next.js 16.4.4 (App Router, Turbopack) · React 19.3.0 · TypeScript 5.9 (strict) · Tailwind CSS 4.3 (`@tailwindcss/turbopack`) · `motion` 12.43 (import from `motion/react`) · `lucide-react` 0.554 · ESLint 9 + `eslint-config-next`.
Fonts via `next/font/google`: Manrope (sans), Cormorant Garamond (serif).

> Next.js 16 differs from older versions. Per AGENTS.md, check `node_modules/next/dist/docs/` before writing Next-specific code.

## Where things live
- `src/app/page.tsx` composes: FloatingNav, PyramidHero (`src/components/hero/pyramid-hero.tsx`; old heroes incl. HeroVideoLegacy preserved unrendered in `src/components/legacy/`), CostCalculator, BrandIntro, MetricsSection, WhyGypsos, GypsumHistory (pinned horizontal on lg+), ProductSection, BenefitsSection, ApplicationsSection, DirectorsSection, VisionMission, CoreValues, ContactSection, SiteFooter.
- `src/components/gypsos/` new sections, `logo.tsx` (crops transparent padding only), `bag-image.tsx` (supplied bag PNG, `public/images/gypsos/gypsos-bag.png`), nav + menu overlay.
- `src/components/motion/scroll-primitives.tsx` shared animation helpers: WordReveal, ScrubIn, Parallax, ClipReveal, CountUp, useDesktop, useReduced.
- `src/lib/plaster-estimate.ts` calculator rules (residential x3.5, commercial x3, rate 45); `src/lib/enquiry.ts` shared form validation; `src/app/api/enquiry/route.ts`.
- `public/images/gypsos/` logo + photos; `public/images/egypt/` hero plates only.
- Anchors: #top #about #why #history #product #benefits #applications #directors #vision #values #calculator #contact.

## Animation rules (important)
- Only `motion/react`. Scroll progress via `useScroll`; every `useTransform` range must span 0..1 explicitly (native scroll-timeline opacity otherwise bounces back).
- Use `useReduced()` from scroll-primitives, NOT motion's `useReducedMotion` (hydration mismatch leaves SSR inline styles stuck). Elements that conditionally take motion styles carry `key={String(Boolean(cond))}` so React remounts a clean node.
- Animations run on every screen size (phones included): history is pinned horizontally with svh-fitted panels; other effects scale amplitude by `useDesktop()` instead of switching off. Only `prefers-reduced-motion` gives static layouts. Distances in svh/vw.

## Conventions
- Interaction utilities in globals.css: `.btn-sweep` (+ `[--sweep:var(--color-x)]`) sliding-fill buttons, `.link-underline` nav links, `.total-pop` calculator total, `.value-card` hover.
- `"use client"` only where needed where scroll/state needs it (hero, header, animated sections, calculator, contact); metrics/footer stay server components.
- Styling: Tailwind utilities inline. Tokens in globals.css. Headings `font-serif`, body Manrope. Tiny uppercase wide-tracked eyebrow labels (`text-[10px] tracking-[0.4em]`).
- Palette tokens: graphite, gypsum, bone, ochre, teal-night (plus hero sand/teal). Alternate dark and light sections. Flat, square-cornered.
- Images: `next/image` with `fill` + `sizes` + object-position class; meaningful `alt` text.
- Animation: `motion/react`; always honor reduced motion via `useReduced()`.
- Accessibility: aria labels, Escape closes overlays, global focus-visible outline.
- Path alias `@/*` → `src/*`.

## Restrictions
- Don't redesign the look/feel or change the hero parallax unless asked.
- Don't add/remove dependencies, or run build/lint/tests, unless the task needs it.
- Never print or commit secrets/env values (`.env*` is gitignored).
- Don't touch unrelated sections.

## For future sessions
1. Read this file first. Read `.claude/project-architecture.md` only when technical detail is needed.
2. Do NOT rescan the whole codebase; open only files relevant to the task and avoid re-reading them.
3. Preserve existing architecture; make minimal, targeted changes.
4. Put task progress notes in `.claude/tasks/<task-name>.md`.

## Content rules
- Never invent certifications, numbers, contacts, bios or product specs. Gypsum plaster is for interior walls/ceilings. Pyramids were not built of gypsum plaster (it was mortar/coating).
