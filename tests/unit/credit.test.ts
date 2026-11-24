import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(__dirname, "../..");
const footer = readFileSync(path.join(root, "src/components/SiteFooter.tsx"), "utf8");

describe("OFF/SHIFT footer credit", () => {
  it("links to the studio home page with the canonical wordmark", () => {
    expect(footer).toMatch(/href="https:\/\/offshiftstudio\.com\.au"/);
    expect(footer).toMatch(/rel="noopener"/);
    expect(footer).toMatch(/alt="OFF\/SHIFT Studio"/);
    expect(footer).toMatch(/src="\/brand\/offshift-wordmark-dark\.svg"/);
    expect(footer).toMatch(/Designed by/);
  });

  it("ships the wordmark byte for byte as the canonical file (sha256 of offshift-studio public/brand)", () => {
    
    const bytes = readFileSync(path.join(root, "public/brand/offshift-wordmark-dark.svg"));
    expect(createHash("sha256").update(bytes).digest("hex")).toBe("0cca7e7a612d12dcff0e62dce083ce3ab101cdc75cec32a02bdb075e7594dc1d");
  });
});

describe("copy tells", () => {
  const copy = readFileSync(path.join(root, "src/content/site.ts"), "utf8") + readFileSync(path.join(root, "src/app/layout.tsx"), "utf8");
  it("uses no em dashes outside the shared studio disclosure", () => {
    const withoutDisclosure = copy.replace(/conceptDisclosure:.*\n/, "");
    expect(withoutDisclosure).not.toMatch(/—/);
  });
});
