import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { contrast } from "@/lib/contrast";

const css = readFileSync(path.resolve(__dirname, "../../src/app/globals.css"), "utf8");
const token = (name: string) => {
  const m = css.match(new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6})`));
  if (!m) throw new Error(`Token --${name} not found`);
  return m[1];
};

const wash = token("wash");
const paper = token("paper");
const lime = token("lime");
const sky = token("sky");
const sunWash = token("sun-wash");
const sun = token("sun");
const ink = token("ink");

/** Every text/background pairing the stylesheet uses for normal-size text (AA: 4.5:1). */
const textPairs: Array<[string, string, string]> = [
  ["ink on wash", ink, wash],
  ["ink on paper", ink, paper],
  ["ink on lime", ink, lime],
  ["ink on sky", ink, sky],
  ["ink on sun wash", ink, sunWash],
  ["ink on sun (concept notice, tags)", ink, sun],
  ["ink-soft on wash", token("ink-soft"), wash],
  ["ink-soft on paper", token("ink-soft"), paper],
  ["ink-soft on lime", token("ink-soft"), lime],
  ["ink-soft on sky", token("ink-soft"), sky],
  ["ink-soft on sun wash", token("ink-soft"), sunWash],
  ["sun-ink on paper", token("sun-ink"), paper],
  ["sun-ink on wash", token("sun-ink"), wash],
  ["sun-ink on sun wash", token("sun-ink"), sunWash],
  ["sun-ink on lime", token("sun-ink"), lime],
  ["link on wash", token("link"), wash],
  ["link on paper", token("link"), paper],
  ["link on lime", token("link"), lime],
  ["link on sky", token("link"), sky],
  ["link on sun wash", token("link"), sunWash],
  ["error on paper", token("error"), paper],
  ["paper on ink (buttons)", paper, ink],
];

/** Non-text UI (field borders, focus rings) needs 3:1. */
const uiPairs: Array<[string, string, string]> = [
  ["field border on paper", token("field-border"), paper],
  ["focus ring on wash", token("focus"), wash],
  ["focus ring on paper", token("focus"), paper],
  ["focus ring on lime", token("focus"), lime],
  ["focus ring on sun", token("focus"), sun],
];

describe("palette contrast (WCAG 2.2 AA)", () => {
  it.each(textPairs)("%s meets 4.5:1", (_, fg, bg) => {
    expect(contrast(fg, bg)).toBeGreaterThanOrEqual(4.5);
  });

  it.each(uiPairs)("%s meets 3:1", (_, fg, bg) => {
    expect(contrast(fg, bg)).toBeGreaterThanOrEqual(3);
  });

  it("keeps clear of the OFF/SHIFT studio colours", () => {
    const studio = ["#0f1114", "#c9b89c", "#f4f1ec"];
    const used = css.match(/#[0-9a-fA-F]{6}\b/g)?.map((h) => h.toLowerCase()) ?? [];
    for (const hex of studio) expect(used).not.toContain(hex);
  });
});
