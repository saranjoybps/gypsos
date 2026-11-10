# Project Architecture (verified one-time analysis, 2026-11-04)

## Build/config
- Scripts: `dev`, `build`, `start`, `lint` (eslint). No test runner.
- `next.config.ts`: only a `turbopack.rules` entry sending `*.css` to the `@tailwindcss/turbopack` loader. No image domains, redirects, or env.
- `tsconfig.json`: strict, bundler resolution, `@/*` → `./src/*`.
- `eslint.config.mjs`: next core-web-vitals + typescript; ignores `.next`, `out`, `build`.
- `.gitignore` ignores `.env*`, `.next`, `*.tsbuildinfo`, `next-env.d.ts`. Directory is NOT currently a git repo.
- Stray root files: `shot.mjs` (CDP screenshot script using localhost:3010 and Chrome debug port 9223), `hero-*.png` screenshots. Dev tooling only.

## Routing
Single route: `src/app/page.tsx` (`Home`). No other pages, route handlers, loading/error files, or proxy/middleware. Navigation is in-page hash anchors with `scroll-behavior: smooth` (disabled under reduced motion).

## Landing page hierarchy
```
layout.tsx (fonts, metadata)
└ page.tsx <main>
  ├ GypsosHero           (client) id=top      full-bleed elephant video hero (older heroes in components/legacy/, unrendered)
  │  └ SiteHeader        (client) logo, desktop nav (md+), menu button → portal fullscreen menu
  ├ AncientCivilization  (server) id=explore  heading, 2-col text, giant "Egypt" watermark
  │  └ FilmFrame         (client) poster image + play button → modal dialog (no video: FILM_SRC = "")
  ├ ArtifactSection      (server) id=articles two alternating articles (Tut mask rectangle, Anubis circle) + "Show more"
  ├ EgyptGallery         (client) id=galleries 3-item carousel (buttons + drag), 3 destinations
  ├ PartnersSection      (server) text-only placeholder partner names + "Book now" (#contact)
  └ SiteFooter           (server) id=contact  nav, blurb, image-credit line, watermark
```
"Discover more"/"Show more" link to `#galleries`; "Book now" to `#contact` (no booking flow).

## Animation architecture
Library: **motion** (`motion/react`) only. No GSAP, Lenis, or CSS keyframe animations.

**Hero parallax (`legacy, unrendered: src/components/legacy/hero-legacy.tsx`)**
- `<section class="hero-track">` is a tall scroll track (188vh; 158vh at ≤760px; 100svh under reduced motion; defined in `globals.css`).
- Inside, a `sticky top-0 h-svh` stage holds the layered scene. `useScroll({ target: trackRef, offset: ["start start","end start"] })` → `scrollYProgress` drives `useTransform` values:
  - `copyY` 0→-78px (progress 0–0.7), `copyOpacity` 1→0 (0–0.5): headline block
  - `navOpacity` 1→0 (0.28–0.72): header fades out
  - `sandY` 0→-120px: dune overlay and "Walker" SVG figure
  - `pyramidY` 0→-40px: pyramid plate
  - `skyOpacity` 1→0.15 (0.18–0.92): sky gradient + 86 procedurally placed stars (deterministic sin-hash, rounded to avoid hydration mismatch)
- Layers (z-index): sky-wash (`.sky-wash`, stars SVG, `.sky-grain` noise) → pyramid image (z1, `.pyramid-plate` filter + mask) → dune overlay PNG (z2, 196% width, centered) → sand fade gradient (z3) → Walker (z4) → copy (z10) → header (z20); edge labels "Scroll"/"Giza" (z12, hidden ≤760px).
- Reduced motion: `useReducedMotion()` → motion styles omitted (static layers).
- Hero images use the `preload` prop on `next/image`.

**Other motion use**: `egypt-gallery.tsx`: `motion.ul` horizontal drag (±48px threshold changes slide); `motion.li` with `layout` and spring (stiffness 260, damping 32; duration 0 if reduced motion). Header menu and film modal are not animated.

## Styling system
- Tailwind v4 CSS-first: `@import "tailwindcss"` + `@theme inline` in `globals.css`. Tokens: sky #17474a, sky-deep #10383b, sand #ebb87c, sand-light #e9cba5, beige #f0d8b8, ink #654a35, cream #fff8ec, gold #b79a6b. Literal hexes also used: footer `#d7a56c`, image placeholders `#c9965c`, `#1a1410`.
- Fonts: `--font-manrope` and `--font-cormorant` (400/500/600) exposed as `font-sans` / `font-serif`.
- Custom CSS classes in globals.css: `.sky-wash`, `.sky-grain` (inline SVG feTurbulence), `.pyramid-plate`, `.hero-track`, `.edge-label`.
- Typography: fluid `clamp()` headings; micro uppercase eyebrow labels with very wide tracking; square corners except the circular Anubis image and round play/close buttons.

## Responsive
- Tailwind default breakpoints (`sm` 640, `md` 768) plus one CSS media query at 760px (hero track height, edge labels).
- Header: inline nav at `md+`; menu button always visible (fullscreen overlay at all sizes).
- Gallery: only the featured slide (78% width) below `md`; 3 items at `md+`.
- Artifact section stacks on mobile, 2 columns at `md`.

## Assets (`public/images/egypt/`)
giza-pyramids.png (2.0MB), dune-overlay.png (1.2MB, 2172×724), camel-rider.jpg (1.4MB), tut-mask.jpg (1.4MB), valley.jpg (0.97MB), giza-gallery.jpg (0.67MB), red-pyramid.jpg (0.3MB), anubis.jpg (56KB). All served via `next/image`. No video. Photos credited to Wikimedia Commons (CC) in the footer.

## Known issues / observations (not fixed)
1. `FilmFrame` has no video (`FILM_SRC = ""`); modal shows the still plus text saying the film is not on the page yet.
2. Placeholder partner names; "Book now", "Discover more", "Show more" lack real destinations.
3. Modals (`FilmFrame`, `SiteHeader` menu): no focus trap, no background scroll lock; header menu does not restore focus on close.
4. Header fades out with the hero (`navOpacity`), so there is no persistent nav after scrolling; the menu button also shows on desktop alongside the inline nav.
5. Gallery: drag combined with `layout` animation on a reordered list may cause visual jumps (not verified in a browser).
6. Several source images exceed 1MB; the hero PNGs are heaviest and are `preload`ed.
7. Unusual Tailwind setup (Turbopack rule + `@tailwindcss/turbopack` instead of the usual PostCSS plugin); works as configured but untested with webpack builds.
8. Stray dev files in root (`shot.mjs`, `hero-*.png`, `tsconfig.tsbuildinfo`).
9. No favicon or OG image configuration found in `src/app` or `public`.
10. Not a git repository.
Build/lint/tests were intentionally not run, so type and lint status is unknown.

## Hero rework (2026-11-04) — supersedes the hero details above
- `useScroll` offset is now `["start start","end end"]` (progress 1 = sticky stage released). Track heights use `svh`.
- ALL `useTransform` ranges must span 0..1 explicitly (motion runs opacity natively on the scroll timeline; a missing end keyframe interpolates back to the base value, causing fade-out/fade-in glitches).
- Parallax distances are in `svh` (sand -14, pyramid -5, copy -9) so they scale with the screen; no JS measurement.
- Dune layer: width `max(196%, 260svh)`, `left:33%` + `x:-41.5%`, so the walker (child of this layer, `left:41.5% bottom:33.5%`) stays on the dunes at every size. A sand ground div (z1) plus a bottom fade on `.pyramid-plate` removes the old mobile seam.
- Sky no longer fades (it made an olive band over the sand). Header/copy get `pointer-events:none` once faded.
- Verification harness: headless Chrome via CDP (scratch script, not in repo); checked 360–2560px wide, no horizontal overflow.


## GYPSOS transformation (2026-11-04) — supersedes the Egypt section list above
See CLAUDE.md for the current component map. History section: sticky track of four 100vw chapters driven by one scrollYProgress (track x, bg colour, photo counter-shift, process line). Applications cards fan out from an overlapped stack (reference video). Image credits live in site-footer.tsx. Removed: Egypt gallery/artifact/film/partners components.
