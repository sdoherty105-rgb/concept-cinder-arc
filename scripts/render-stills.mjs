#!/usr/bin/env node
/**
 * Renders every still image on the site from the procedural scenes in
 * src/three, using the exact code the live hero runs. Output goes to
 * public/images as AVIF + WebP at several widths, plus a manifest the
 * <Picture> component reads for intrinsic sizes.
 *
 *   npm run render:stills            # everything
 *   npm run render:stills -- pavilion # only jobs whose name contains "pavilion"
 */
import { build } from "esbuild";
import { chromium } from "@playwright/test";
import sharp from "sharp";
import { mkdir, writeFile, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const work = path.join(root, "scripts/.render");
const out = path.join(root, "public/images");
const manifestPath = path.join(root, "src/content/image-manifest.json");

/** Supersampling factor: render larger, downsample with Lanczos for clean edges. */
const PREVIEW = process.env.PREVIEW === "1";
const SS = PREVIEW ? 0.4 : 1.5;

const jobs = [
  // Hero fallback posters, one per composition breakpoint used by the live scene.
  { name: "hero-wide", variant: "pavilion", shot: "hero", framed: true, quality: "standard", w: 2560, h: 1600, widths: [1280, 1920, 2560] },
  { name: "hero-square", variant: "pavilion", shot: "hero", framed: true, quality: "standard", w: 1600, h: 1500, widths: [1080, 1600] },
  { name: "hero-mid", variant: "pavilion", shot: "hero", framed: true, quality: "light", w: 1536, h: 2048, widths: [768, 1152, 1536] },
  { name: "hero-tall", variant: "pavilion", shot: "hero", framed: true, quality: "light", w: 1080, h: 2340, widths: [480, 800, 1080] },

  { name: "pavilion-hero", variant: "pavilion", shot: "hero", w: 2400, h: 1500, widths: [800, 1280, 1920, 2400] },
  { name: "pavilion-arch", variant: "pavilion", shot: "arch", w: 1200, h: 1500, widths: [600, 900, 1200] },
  { name: "pavilion-fins", variant: "pavilion", shot: "fins", w: 2400, h: 1500, widths: [800, 1280, 1920, 2400] },
  { name: "pavilion-plan", variant: "pavilion", shot: "axo", w: 1200, h: 1500, widths: [600, 900, 1200] },

  { name: "courtyard-hero", variant: "courtyard", shot: "hero", w: 2400, h: 1500, widths: [800, 1280, 1920, 2400] },
  { name: "courtyard-court", variant: "courtyard", shot: "court", w: 1200, h: 1500, widths: [600, 900, 1200] },
  { name: "courtyard-pergola", variant: "courtyard", shot: "pergola", w: 2400, h: 1500, widths: [800, 1280, 1920, 2400] },

  { name: "cottage-hero", variant: "cottage", shot: "hero", w: 2400, h: 1500, widths: [800, 1280, 1920, 2400] },
  { name: "cottage-fins", variant: "cottage", shot: "fins", w: 1200, h: 1500, widths: [600, 900, 1200] },
  { name: "cottage-garden", variant: "cottage", shot: "garden", w: 2400, h: 1500, widths: [800, 1280, 1920, 2400] },

  { name: "interior-hero", variant: "interior", shot: "hero", w: 2400, h: 1500, widths: [800, 1280, 1920, 2400] },
  { name: "interior-island", variant: "interior", shot: "island", w: 1200, h: 1500, widths: [600, 900, 1200] },
  { name: "interior-window", variant: "interior", shot: "window", w: 2400, h: 1500, widths: [800, 1280, 1920, 2400] },
];

const filter = process.argv[2];
const selected = filter ? jobs.filter((j) => j.name.includes(filter)) : jobs;

await mkdir(work, { recursive: true });
await mkdir(out, { recursive: true });

await build({
  entryPoints: [path.join(root, "scripts/render/entry.ts")],
  bundle: true,
  format: "iife",
  target: "es2022",
  outfile: path.join(work, "bundle.js"),
  logLevel: "warning",
});
await writeFile(
  path.join(work, "index.html"),
  `<!doctype html><meta charset="utf-8"><body style="margin:0;background:#000"><script src="bundle.js"></script></body>`,
);

const browser = await chromium.launch({
  args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"],
});
const page = await browser.newPage();
page.on("console", (m) => console.log(`[page] ${m.text()}`));
page.on("pageerror", (e) => console.error(`[page error] ${e.message}`));
await page.goto(pathToFileURL(path.join(work, "index.html")).href);
await page.waitForFunction(() => typeof window.renderStill === "function");

const manifest = existsSync(manifestPath) ? JSON.parse(await readFile(manifestPath, "utf8")) : {};

for (const job of selected) {
  const t0 = Date.now();
  const width = Math.round(job.w * SS);
  const height = Math.round(job.h * SS);
  const dataUrl = await page.evaluate(
    (j) => window.renderStill(j),
    {
      variant: job.variant,
      shot: job.shot,
      width,
      height,
      framed: Boolean(job.framed),
      quality: job.quality ?? "high",
      override: process.env.SHOT ? JSON.parse(process.env.SHOT) : undefined,
    },
  );
  const png = Buffer.from(dataUrl.split(",")[1], "base64");
  await writeFile(path.join(work, `${job.name}.png`), png);
  if (PREVIEW) {
    console.log(`${job.name}: preview ${width}x${height} in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
    continue;
  }

  for (const w of job.widths) {
    const h = Math.round((w * job.h) / job.w);
    const resized = sharp(png).resize(w, h, { kernel: "lanczos3" });
    await resized.clone().avif({ quality: 52, effort: 6 }).toFile(path.join(out, `${job.name}-${w}.avif`));
    await resized.clone().webp({ quality: 78, effort: 6 }).toFile(path.join(out, `${job.name}-${w}.webp`));
  }
  manifest[job.name] = { width: job.w, height: job.h, widths: job.widths };
  console.log(`${job.name}: ${width}x${height} in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
}

await browser.close();
if (PREVIEW) process.exit(0);
await mkdir(path.dirname(manifestPath), { recursive: true });
const sorted = Object.fromEntries(Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b)));
await writeFile(manifestPath, JSON.stringify(sorted, null, 2) + "\n");
console.log(`Wrote ${selected.length} stills and ${path.relative(root, manifestPath)}`);
