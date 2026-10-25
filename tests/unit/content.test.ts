import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { projects } from "@/content/projects";
import manifest from "@/content/image-manifest.json";

const root = path.resolve(__dirname, "../..");
const allText = JSON.stringify(projects) + readFileSync(path.join(root, "src/content/site.ts"), "utf8");

describe("content rules", () => {
  it("every referenced image exists in every format and width", () => {
    const names = new Set<string>(["hero-wide", "hero-square", "hero-mid", "hero-tall", "pavilion-plan"]);
    projects.forEach((p) => Object.values(p.images).forEach((img) => names.add(img.name)));
    for (const name of names) {
      const entry = (manifest as Record<string, { widths: number[] }>)[name];
      expect(entry, name).toBeDefined();
      for (const w of entry.widths) {
        for (const ext of ["avif", "webp"]) {
          expect(existsSync(path.join(root, "public/images", `${name}-${w}.${ext}`)), `${name}-${w}.${ext}`).toBe(true);
        }
      }
    }
  });

  it("makes no testimonial, award, rating or statistic claims", () => {
    expect(allText).not.toMatch(/testimonial|award[- ]winning|\bawards?\b|★|stars? rating|\d+\+?\s*(years|clients|projects completed)/i);
  });

  it("uses reserved fictitious contact details", () => {
    expect(allText).toMatch(/cinderarc\.example/);
    expect(allText).toMatch(/0491 570 156/);
  });

  it("every image has descriptive alt text", () => {
    projects.forEach((p) =>
      Object.values(p.images).forEach((img) => expect(img.alt.length, `${p.slug} ${img.name}`).toBeGreaterThan(40)),
    );
  });
});
