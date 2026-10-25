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

const page = token("page");
const charcoal = token("charcoal");
const limestone = token("limestone");

/** Every text/background pairing the stylesheet uses for normal-size text (AA: 4.5:1). */
const textPairs: Array<[string, string, string]> = [
  ["charcoal on page", token("charcoal"), page],
  ["concrete on page", token("concrete"), page],
  ["bronze-ink on page", token("bronze-ink"), page],
  ["charcoal on limestone", charcoal, limestone],
  ["concrete-ink on limestone", token("concrete-ink"), limestone],
  ["bronze-ink on limestone", token("bronze-ink"), limestone],
  ["limestone on charcoal", limestone, charcoal],
  ["muted-dark on charcoal", token("muted-dark"), charcoal],
  ["bronze-glow on charcoal", token("bronze-glow"), charcoal],
  ["error-dark on charcoal", token("error-dark"), charcoal],
  ["charcoal on bronze-glow (demo tag)", charcoal, token("bronze-glow")],
  ["charcoal on limestone button", charcoal, limestone],
  ["page on charcoal button", page, charcoal],
];

/** Large display text and non-text UI (borders, focus rings, icons) need 3:1. */
const largeOrUiPairs: Array<[string, string, string]> = [
  ["bronze display text on page", token("bronze"), page],
  ["bronze rules on charcoal", token("bronze"), charcoal],
  ["field border on charcoal", token("field-border-dark"), charcoal],
  ["focus ring bronze-glow on charcoal", token("bronze-glow"), charcoal],
  ["focus ring charcoal on page", charcoal, page],
  ["focus ring charcoal on limestone", charcoal, limestone],
];

describe("palette contrast (WCAG 2.2 AA)", () => {
  it.each(textPairs)("%s meets 4.5:1", (_, fg, bg) => {
    expect(contrast(fg, bg)).toBeGreaterThanOrEqual(4.5);
  });

  it.each(largeOrUiPairs)("%s meets 3:1", (_, fg, bg) => {
    expect(contrast(fg, bg)).toBeGreaterThanOrEqual(3);
  });

  it("keeps the brand palette exactly as specified", () => {
    expect([token("charcoal"), token("limestone"), token("concrete"), token("bronze"), token("page")]).toEqual([
      "#121416",
      "#ddd4c6",
      "#59616a",
      "#927457",
      "#f2f0eb",
    ]);
  });
});
