import { fallbackSrc, layoutDimensions, srcSet } from "./Picture";

/** Match typical mobile render width (≈100vw) so Lighthouse image-size-responsive passes. */
const tallLayout = layoutDimensions("hero-tall", 800);

/**
 * The hero's static image: the scene's own first frame, rendered offline
 * by scripts/render-stills.mjs at each composition breakpoint the live
 * camera uses. It is what loads first, what the LCP measures, and all
 * that shows without JavaScript, without WebGL or under reduced motion.
 */
const sources = [
  { media: "(min-aspect-ratio: 5/4)", name: "hero-wide" },
  { media: "(min-aspect-ratio: 9/10)", name: "hero-square" },
  { media: "(min-aspect-ratio: 2/3)", name: "hero-mid" },
  { media: undefined, name: "hero-tall" },
];

export const HERO_ALT =
  "Rendered view at dusk of the Cinder Arc pavilion: a board-formed concrete wall pierced by a round arch, a long still pool, a limestone wing with a glowing slot window and a glass room beneath a cantilevered concrete roof.";

export function HeroPoster() {
  return (
    <picture className="stage-poster">
      {sources.flatMap(({ media, name }) => [
        <source key={`${name}-avif`} media={media} type="image/avif" srcSet={srcSet(name, "avif")} sizes="100vw" />,
        <source key={`${name}-webp`} media={media} type="image/webp" srcSet={srcSet(name, "webp")} sizes="100vw" />,
      ])}
      <img
        src={fallbackSrc("hero-tall", 480)}
        alt={HERO_ALT}
        width={tallLayout.width}
        height={tallLayout.height}
        fetchPriority="high"
        loading="eager"
        decoding="async"
      />
    </picture>
  );
}
