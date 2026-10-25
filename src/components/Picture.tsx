import manifest from "@/content/image-manifest.json";

type Entry = { width: number; height: number; widths: number[] };
const images = manifest as Record<string, Entry>;

export function imageEntry(name: string): Entry {
  const entry = images[name];
  if (!entry) throw new Error(`Missing image "${name}". Run npm run render:stills.`);
  return entry;
}

export function srcSet(name: string, format: "avif" | "webp") {
  return imageEntry(name)
    .widths.map((w) => `/images/${name}-${w}.${format} ${w}w`)
    .join(", ");
}

export function fallbackSrc(name: string, maxWidth = 1280) {
  const { widths } = imageEntry(name);
  const w = [...widths].reverse().find((x) => x <= maxWidth) ?? widths[0];
  return `/images/${name}-${w}.webp`;
}

type PictureProps = {
  name: string;
  alt: string;
  sizes: string;
  className?: string;
  priority?: boolean;
};

/** Intrinsic dimensions for layout; use a typical rendered width so Lighthouse does not over-fetch. */
export function layoutDimensions(name: string, layoutWidth: number) {
  const { width, height } = imageEntry(name);
  return { width: layoutWidth, height: Math.round(height * (layoutWidth / width)) };
}

export function Picture({
  name,
  alt,
  sizes,
  className,
  priority = false,
  layoutWidth,
}: PictureProps & { layoutWidth?: number }) {
  const entry = imageEntry(name);
  const layout = layoutWidth ?? entry.widths[0];
  const { width, height } = layoutDimensions(name, layout);
  return (
    <picture className={className}>
      <source type="image/avif" srcSet={srcSet(name, "avif")} sizes={sizes} />
      <source type="image/webp" srcSet={srcSet(name, "webp")} sizes={sizes} />
      <img
        src={fallbackSrc(name, layout)}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? "eager" : "lazy"}
        decoding={priority ? "sync" : "async"}
        fetchPriority={priority ? "high" : "low"}
      />
    </picture>
  );
}
