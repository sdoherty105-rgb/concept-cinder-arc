import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from "three";

/** Small deterministic PRNG so every render of a surface is identical. */
export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type SurfaceOptions = {
  base: string;
  seed: number;
  size?: number;
  /** 0..1 strength of fine grain. */
  grain?: number;
  /** 0..1 strength of large soft mottling. */
  mottle?: number;
  /** Horizontal board-form marks, in pixels between lines (concrete). */
  boardSpacing?: number;
  /** Vertical joints, in pixels between lines (stone cladding, timber). */
  jointSpacing?: number;
  /** Long streaks along the U axis (timber grain). */
  streaks?: number;
};

export function createSurfaceTexture(opts: SurfaceOptions): CanvasTexture {
  const size = opts.size ?? 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const rand = mulberry32(opts.seed);

  ctx.fillStyle = opts.base;
  ctx.fillRect(0, 0, size, size);

  const mottle = opts.mottle ?? 0.5;
  for (let i = 0; i < 26; i++) {
    const x = rand() * size;
    const y = rand() * size;
    const r = size * (0.15 + rand() * 0.35);
    const light = rand() > 0.5;
    const alpha = (0.012 + rand() * 0.025) * mottle;
    for (const [ox, oy] of [
      [0, 0],
      [size, 0],
      [-size, 0],
      [0, size],
      [0, -size],
    ]) {
      const g = ctx.createRadialGradient(x + ox, y + oy, 0, x + ox, y + oy, r);
      const c = light ? "255,250,240" : "20,18,16";
      g.addColorStop(0, `rgba(${c},${alpha})`);
      g.addColorStop(1, `rgba(${c},0)`);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, size, size);
    }
  }

  if (opts.streaks) {
    for (let i = 0; i < 70; i++) {
      const y = rand() * size;
      ctx.fillStyle = `rgba(${rand() > 0.5 ? "40,28,18" : "255,240,220"},${0.04 * opts.streaks})`;
      ctx.fillRect(0, y, size, 0.6 + rand() * 1.6);
    }
  }

  if (opts.boardSpacing) {
    for (let y = 0; y < size; y += opts.boardSpacing) {
      ctx.fillStyle = "rgba(0,0,0,0.07)";
      ctx.fillRect(0, y, size, 1);
      ctx.fillStyle = "rgba(255,255,255,0.035)";
      ctx.fillRect(0, y + 1, size, 1);
    }
  }

  if (opts.jointSpacing) {
    for (let x = 0; x < size; x += opts.jointSpacing) {
      ctx.fillStyle = "rgba(0,0,0,0.06)";
      ctx.fillRect(x, 0, 1, size);
    }
  }

  const grain = opts.grain ?? 0.5;
  const img = ctx.getImageData(0, 0, size, size);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = (rand() - 0.5) * 22 * grain;
    d[i] = Math.max(0, Math.min(255, d[i] + n));
    d[i + 1] = Math.max(0, Math.min(255, d[i + 1] + n));
    d[i + 2] = Math.max(0, Math.min(255, d[i + 2] + n));
  }
  ctx.putImageData(img, 0, 0);

  const tex = new CanvasTexture(canvas);
  tex.wrapS = RepeatWrapping;
  tex.wrapT = RepeatWrapping;
  tex.colorSpace = SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}
