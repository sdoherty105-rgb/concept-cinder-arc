import { fallbackSrc, layoutDimensions, srcSet } from "./Picture";

const layout = layoutDimensions("hero-square", 640);

/**
 * The hero's static image: the scene's own first frame in afternoon sun,
 * rendered offline by scripts/render-stills.mjs. The render pane is close to
 * square at every breakpoint, so one poster serves them all. It is what loads
 * first, what the LCP measures, and all that shows without JavaScript,
 * without WebGL or under reduced motion.
 */
export const HERO_ALT =
  "Rendered view in afternoon sun of the Cinder Arc pavilion: a board-formed concrete wall pierced by a round arch, a long still pool, a limestone wing and a glass room beneath a cantilevered concrete roof.";

export function HeroPoster() {
  return (
    <picture className="stage-poster">
      <source type="image/avif" srcSet={srcSet("hero-square", "avif")} sizes="(min-width: 64rem) 52vw, 100vw" />
      <source type="image/webp" srcSet={srcSet("hero-square", "webp")} sizes="(min-width: 64rem) 52vw, 100vw" />
      <img
        src={fallbackSrc("hero-square", 640)}
        alt={HERO_ALT}
        width={layout.width}
        height={layout.height}
        fetchPriority="high"
        loading="eager"
        decoding="async"
      />
    </picture>
  );
}
