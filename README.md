# concept-cinder-arc

**Cinder Arc** is a fictional architecture and interiors studio in Perth, built as a concept website by OFF/SHIFT Studio. Every page opens with the OFF/SHIFT studio strip, which says "Fictional business — a concept site by OFF/SHIFT Studio", links back to the concept page (`https://offshiftstudio.com.au/concepts/cinder-arc`) and offers "Want a website like this?" (`https://offshiftstudio.com.au/?concept=cinder-arc#contact`). The footer repeats both links. Every page is `noindex, nofollow` (meta tag, `X-Robots-Tag` header and `robots.txt`).

The studio, its projects, prices, people and contact details are all invented. The site contains no testimonials, awards, ratings, statistics or client logos.

## Stack

- Next.js 16 (App Router, TypeScript). Every route is statically generated.
- Cloudflare Workers via `@opennextjs/cloudflare`. The worker is named `concept-cinder-arc` in `wrangler.jsonc`.
- React Three Fiber and three.js for the hero, using an original procedural model. No model files are downloaded.
- Instrument Serif and Geist, self-hosted through `next/font/local` (both under the OFL).
- No analytics, trackers or third-party requests.

## Pages

| Route | Contents |
| --- | --- |
| `/` | Hero, approach, selected projects, services, process, consultation enquiry form |
| `/projects` | Index of the four fictional projects |
| `/projects/[slug]` | Project story, facts, materials, generated ground plan, next project |

## The 3D hero

The headline and a pre-rendered still of the pavilion ship in the HTML, so either can be the LCP element. The live scene only replaces the still when all of the following hold:

- JavaScript is running.
- `prefers-reduced-motion` is not set.
- WebGL2 is available without a major performance caveat.
- The visitor interacts (pointer, touch, wheel, scroll or key), or a large fine-pointer screen goes idle.

The still and the live scene come from the same code in `src/three/`. `npm run render:stills` renders the scene offline in headless Chromium, so the poster matches the first live frame exactly.

Behaviour once the live scene is running:

- **Scroll camera.** Three camera stops (hero, arch, axonometric plan) are tied to elements marked `data-camera-stop`; each stop is reached when its card is centred in the viewport. The page scrolls natively and is never pinned, prevented or smoothed by script; the camera follows the scroll position with damping.
- **Pointer tilt.** Eased tilt of at most 8° horizontally and 5° vertically. Only for mouse input on the standard tier.
- **Quality tiers.** Phones, coarse pointers and low-memory or low-core devices get the `light` tier: device pixel ratio 1–1.25, a 1024 shadow map, no ambient occlusion and no tilt. Other devices get `standard`: device pixel ratio up to 1.75, a 2048 shadow map and GTAO.
- **Idle cost.** Rendering is on demand and stops when the hero is off screen.

## Performance notes (mobile LCP)

- The mobile LCP element is the hero lede text, not the poster. In a real (DevTools-throttled) trace, LCP equals FCP, at about 1.1 s unthrottled and 1.8 s with 4x CPU on slow 4G.
- Lighthouse's simulated LCP is higher because its pessimistic graph counts every request that starts before that paint. That includes about 145 KB gzipped of Next.js/React runtime chunks (fixed framework cost) and the HTML. The recorded 2.69 s warning came from this.
- `experimental.inlineCss` repeats the stylesheet three times per HTML document (a `<style>` tag plus twice in the RSC payload). An A/B test on 2026-11-10 (5 interleaved runs each) still favoured inlining: median simulated LCP was 2.80 s inline against 3.40 s with an external stylesheet. It stays on.
- The root layout used to preload `hero-tall-800.avif` on every route. Project pages and desktop visits fetched it without ever showing it, so the preload was removed. The poster `<img>` keeps `fetchpriority="high"`.
- Local Lighthouse scores swing widely when the machine is busy: watch `benchmarkIndex` in the report. On 2026-11-10 it dropped to about 300–700 with a load average above 400, and TBT swung between 0.4 s and 11 s.

## Scripts

```bash
npm run dev            # local dev server
npm run build          # production build
npm run start          # serve the build on :3000
npm run lint
npm run typecheck
npm run test:unit      # Vitest: contrast tokens, form validation, content rules
npm run test:e2e       # Playwright: routes, noindex, studio strip links, 320px overflow, form network isolation, hero fallbacks
npm run lhci           # Lighthouse CI, mobile preset
npm run render:stills  # re-render poster and project stills (writes AVIF/WebP to public/images)
npm run screens        # capture docs/screens at 390, 768 and 1440px
npm run cf:build       # build the OpenNext Cloudflare bundle (does not deploy)
```

CI (`.github/workflows/ci.yml`) runs the following in order: lint, typecheck, unit tests, build, Playwright, Lighthouse CI on mobile, then the OpenNext build.

## Deployment

Nothing in this repository deploys. CI (`.github/workflows/ci.yml`) only builds and tests: it runs `opennextjs-cloudflare build` and a local `wrangler dev` smoke test, never `wrangler deploy`, and it holds no Cloudflare credentials. Pushing a branch or opening a pull request therefore cannot change production.

The demo is nonetheless live at <https://cinder-arc.offshiftstudio.com.au> as the Cloudflare Worker `concept-cinder-arc` (OpenNext; responses carry `x-opennext-cache`). It was deployed from outside this repository's CI, so a new version goes live only when someone runs `npm run cf:build && npx wrangler deploy` (or the equivalent) by hand.

| Checked | Live URL serves | How it was checked |
| --- | --- | --- |
| 2026-11-10 | `main` at `666d883` (tree identical to `155f262`, the PR #1 head) | The live home page references exactly the same hashed CSS and JS chunks as a local `npm run build` of `main`. |

Branch `redesign/2026-11` (studio strip, LCP fix) is **not** live yet; deploying it is the owner's decision.

## Assets

`ASSETS.md` lists the source and licence of every asset.
