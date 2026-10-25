# Asset register

Every visual and typographic asset used by the Cinder Arc concept site, with its source and licence.
No stock photography, downloaded 3D models, people or faces are used anywhere on the site.

## 3D scene and rendered images

| Asset | Files | Source | Licence |
|---|---|---|---|
| Live 3D hero (pavilion, arch wall, pool, fins, lighting, camera moves) | `src/three/*.ts`, `src/components/Scene3D.tsx` | Original procedural geometry written for this project with three.js primitives (`BoxGeometry`, `ExtrudeGeometry`, `CylinderGeometry`, `IcosahedronGeometry`). No external models, HDRIs or textures. | Original work by OFF/SHIFT Studio for this concept |
| Surface textures (concrete, limestone, oak, plaster, brick, ground) | Generated at runtime in `src/three/textures.ts` | Procedural canvas noise from a seeded PRNG | Original work |
| Dusk sky reflections | Generated at runtime in `src/three/kit.ts` (`createDuskEnvironment`) | Procedural gradient shader baked to a PMREM environment | Original work |
| Hero fallback images: `hero-wide`, `hero-square`, `hero-mid`, `hero-tall` | `public/images/hero-*.{avif,webp}` | Offline renders of the same procedural scene by `scripts/render-stills.mjs` (headless Chromium, three.js) | Original work |
| Project and principle stills: `pavilion-*`, `courtyard-*`, `cottage-*`, `interior-*` | `public/images/*.{avif,webp}` | Offline renders of four procedural scenes (`buildPavilion`, `buildCourtyard`, `buildCottage`, `buildInterior`) by `scripts/render-stills.mjs` | Original work |
| Ground plans on project pages | `src/components/PlanDrawing.tsx` + plan data in `src/content/projects.ts` | Hand-authored SVG drawn from the same dimensions as the 3D scenes | Original work |
| Film grain over the hero | Inline SVG `feTurbulence` in `src/app/globals.css` | Generated | Original work |
| Logo glyph and favicon (arch mark) | `src/components/Wordmark.tsx`, `src/app/icon.svg` | Hand-drawn SVG | Original work |

To regenerate every image: `npm run render:stills` (about 15 minutes on a CPU-only machine).

## Fonts (self-hosted, no third-party requests)

| Font | Files | Source | Licence |
|---|---|---|---|
| Instrument Serif Regular and Italic (display) | `src/fonts/instrument-serif-latin-400-{normal,italic}.woff2` | [Instrument Serif](https://github.com/Instrument/instrument-serif) via the `@fontsource/instrument-serif@5.3.0` package, Latin subset | SIL Open Font License 1.1, see `src/fonts/OFL-InstrumentSerif.txt` |
| Geist (variable, body) | `src/fonts/geist-latin-wght-normal.woff2` | [Geist](https://github.com/vercel/geist-font) via the `@fontsource-variable/geist@5.3.0` package, Latin subset | SIL Open Font License 1.1, see `src/fonts/OFL-Geist.txt` |

Fonts are served from the site's own origin through `next/font/local`.

To keep the mobile LCP budget, all three files were subset with [fonttools](https://github.com/fonttools/fonttools) 4.67 to Basic Latin, Latin-1 and common punctuation, with hinting removed. Geist's weight axis was also limited to 400–700, the range the site uses. Neither font declares a Reserved Font Name, so the OFL permits these modified versions under the same licence:

```bash
pyftsubset <file>.woff2 --flavor=woff2 --layout-features='*' --no-hinting --desubroutinize \
  --unicodes="U+0020-007E,U+00A0-00FF,U+0131,U+0152-0153,U+2013-2014,U+2018-201E,U+2022,U+2026,U+2032-2033,U+2039-203A,U+20AC,U+2122,U+2190-2193,U+2197,U+2212"
fonttools varLib.instancer geist-latin-wght-normal.woff2 wght=400:700
```

## Fictional content

All studio details, projects, prices, process timings and contact details are invented.
The email domain uses the reserved `.example` TLD, and the phone number `0491 570 156` is from the range the
Australian Communications and Media Authority reserves for use in fiction. Suburb names are real places used
only as fictional project locations.
