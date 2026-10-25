import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const srcRoot = path.resolve(__dirname, "../../src");

/** Decorative glyphs that must not appear in user-facing source (passAB). */
const FORBIDDEN = /[→←↑↓⇒➜➤▶►•✓★☆\u{1F300}-\u{1FAFF}]/u;

const CSS_FORBIDDEN_CONTENT = /content:\s*["'][^"']*[→←↑↓»›•✓★☆]/;

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const p = path.join(dir, name);
    if (statSync(p).isDirectory()) walk(p).forEach((f) => out.push(f));
    else if (/\.(tsx?|css)$/.test(name)) out.push(p);
  }
  return out;
}

describe("no decorative text glyphs in src/", () => {
  const files = walk(srcRoot);

  it.each(files)("%s has no forbidden Unicode glyphs", (file) => {
    const text = readFileSync(file, "utf8");
    const withoutBlockComments = text.replace(/\/\*[\s\S]*?\*\//g, "");
    const withoutLineComments = withoutBlockComments.replace(/^\s*\/\/.*$/gm, "");
    expect(FORBIDDEN.test(withoutLineComments)).toBe(false);
    if (file.endsWith(".css")) expect(CSS_FORBIDDEN_CONTENT.test(text)).toBe(false);
  });
});
