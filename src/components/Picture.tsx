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

/** Pre-rendered AVIF/WebP image with intrinsic dimensions, so it never shifts layout. */
export function Picture({ name, alt, sizes, className, priority = false }: PictureProps) {
  const { width, height } = imageEntry(name);
  return (
    <picture className={className}>
      <source type="image/avif" srcSet={srcSet(name, "avif")} sizes={sizes} />
      <source type="image/webp" srcSet={srcSet(name, "webp")} sizes={sizes} />
      <img
        src={fallbackSrc(name)}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? "eager" : "lazy"}
        decoding={priority ? "sync" : "async"}
        fetchPriority={priority ? "high" : "auto"}
      />
    </picture>
  );
}
