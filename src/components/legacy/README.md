# Legacy hero (reference only)

`hero-legacy.tsx` (`HeroLegacy`) is the original pyramid-and-dunes hero, kept for reference. It is NOT rendered on the
landing page. Its CSS helpers (`.sky-wash`, `.sky-grain`, `.pyramid-plate`, `.hero-track`, `.edge-label`) remain in
`src/app/globals.css`, and its images remain in `public/images/egypt/` (giza-pyramids.png, dune-overlay.png).
To use it again, import `HeroLegacy` in `src/app/page.tsx` in place of `GypsosHero`.

`hero-rough-smooth-legacy.tsx` (`HeroRoughSmoothLegacy`) is the second hero ("Rough to Smooth" trowel reveal). Also unrendered; its CSS
helpers (`.rough-wall`, `.tape-ticks`) remain in `globals.css`.

`hero-elephant-svg-legacy.tsx` (`HeroElephantSvgLegacy`) is the third hero (hand-drawn SVG elephant charging a plaster wall). Unrendered.

`hero-video-legacy.tsx` (`HeroVideoLegacy`) is the full-bleed autoplay video hero with the sound toggle (uses `public/video/hero-branding-video.mp4` and `hero-poster.jpg`). Unrendered.
