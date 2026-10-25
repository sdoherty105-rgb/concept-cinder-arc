#!/usr/bin/env node
/**
 * Captures review screenshots into docs/screens at 390, 768 and 1440 px.
 * Expects the production server on BASE_URL (default http://localhost:3000).
 *
 *   npm run build && npm run start   # in another terminal
 *   npm run screens
 *
 * - `{page}-{w}-viewport.png`: first paint, before any interaction, so the
 *   hero shows the static poster exactly as a first-time visitor sees it.
 * - `{page}-{w}-full.jpg`: full page with reduced motion. A full-page capture
 *   cannot show the sticky 3D backdrop, so it records the static fallback.
 * - `home-1440-camera-{n}.png`: the live WebGL hero at each scroll stop.
 */
import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const base = process.env.BASE_URL ?? "http://localhost:3000";
const out = path.resolve("docs/screens");
const widths = [
  { w: 390, h: 844, scale: 2, mobile: true },
  { w: 768, h: 1024, scale: 2, mobile: true },
  { w: 1440, h: 900, scale: 1, mobile: false },
];
const pages = [
  { name: "home", url: "/" },
  { name: "project", url: "/projects/wilyabrup-pavilion" },
];
const only = process.argv[2];

await mkdir(out, { recursive: true });
const browser = await chromium.launch({
  args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"],
});

const contextFor = (vp, extra = {}) =>
  browser.newContext({
    viewport: { width: vp.w, height: vp.h },
    deviceScaleFactor: vp.scale,
    isMobile: vp.mobile,
    hasTouch: vp.mobile,
    ...extra,
  });

async function settle(page) {
  await page.evaluate(() => document.fonts.ready);
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(300);
}

if (!only || only === "pages") {
  for (const vp of widths) {
    for (const p of pages) {
      const first = await contextFor(vp);
      const page = await first.newPage();
      await page.goto(base + p.url, { waitUntil: "networkidle" });
      await settle(page);
      await page.screenshot({ path: path.join(out, `${p.name}-${vp.w}-viewport.png`) });
      await first.close();

      const still = await contextFor(vp, { reducedMotion: "reduce" });
      const full = await still.newPage();
      await full.goto(base + p.url, { waitUntil: "networkidle" });
      // Walk the page so every lazy image loads, then return to the top.
      await full.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += window.innerHeight / 2) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 60));
        }
        window.scrollTo(0, 0);
      });
      await settle(full);
      await full.screenshot({
        path: path.join(out, `${p.name}-${vp.w}-full.jpg`),
        fullPage: true,
        type: "jpeg",
        quality: 78,
      });
      await still.close();
      console.log(`${p.name} @ ${vp.w}px`);
    }
  }
}

if (!only || only === "camera") {
  const vp = widths[2];
  const ctx = await contextFor(vp);
  const page = await ctx.newPage();
  await page.goto(base + "/?webgl=force", { waitUntil: "networkidle" });
  await page.mouse.move(vp.w / 2, vp.h / 2);
  await page.waitForSelector(".stage[data-ready]", { timeout: 120_000 });
  // Same anchors as cameraAnchors() in src/components/Scene3D.tsx.
  const stops = await page.evaluate(() =>
    Array.from(document.querySelectorAll("[data-camera-stop]"))
      .sort((a, b) => Number(a.dataset.cameraStop) - Number(b.dataset.cameraStop))
      .map((el, i) => {
        if (i === 0) return 0;
        const r = el.getBoundingClientRect();
        return Math.max(0, r.top + window.scrollY + r.height / 2 - window.innerHeight / 2);
      }),
  );
  for (const [i, y] of stops.entries()) {
    await page.evaluate((top) => window.scrollTo({ top, behavior: "instant" }), y);
    // Software rendering is slow; give the damped camera time to arrive.
    await page.waitForTimeout(Number(process.env.CAMERA_WAIT ?? 15000));
    await page.screenshot({ path: path.join(out, `home-1440-camera-${i + 1}.png`) });
    console.log(`camera stop ${i + 1}`);
  }
  await ctx.close();
}

await browser.close();
