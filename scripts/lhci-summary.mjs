#!/usr/bin/env node
/**
 * Prints a Markdown table of median Lighthouse results for the CI job summary.
 *
 *   node scripts/lhci-summary.mjs [reportDir] [title]
 *
 * Reads LHCI filesystem uploads (*.report.json) or raw collect output (lhr-*.json).
 */
import { readdirSync, readFileSync, existsSync } from "node:fs";
import path from "node:path";

const dir = path.resolve(process.argv[2] ?? "lighthouse-reports/applied");
const title = process.argv[3] ?? "Lighthouse (mobile, median of runs)";
if (!existsSync(dir)) {
  console.log(`No Lighthouse results found in ${dir}.`);
  process.exit(0);
}

const reports = readdirSync(dir)
  .filter((f) => (f.startsWith("lhr-") || f.endsWith(".report.json")) && f.endsWith(".json"))
  .map((f) => JSON.parse(readFileSync(path.join(dir, f), "utf8")));

const byUrl = new Map();
for (const r of reports) {
  const url = r.finalDisplayedUrl ?? r.finalUrl;
  byUrl.set(url, [...(byUrl.get(url) ?? []), r]);
}

const median = (xs) => {
  const s = [...xs].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
};
const pct = (x) => Math.round(x * 100);

console.log(`### ${title}\n`);
console.log("| URL | Runs | Perf | A11y | Best practices | SEO | LCP | CLS | TBT | SEO audits failing |");
console.log("|---|---|---|---|---|---|---|---|---|---|");
for (const [url, runs] of byUrl) {
  const cat = (k) => pct(median(runs.map((r) => r.categories[k].score)));
  const audit = (k) => median(runs.map((r) => r.audits[k].numericValue));
  const seoFails = runs[0].categories.seo.auditRefs
    .filter((a) => a.weight > 0 && runs[0].audits[a.id].score !== null && runs[0].audits[a.id].score < 1)
    .map((a) => a.id)
    .join(", ");
  console.log(
    `| ${new URL(url).pathname} | ${runs.length} | ${cat("performance")} | ${cat("accessibility")} | ${cat("best-practices")} | ${cat("seo")} | ${(audit("largest-contentful-paint") / 1000).toFixed(2)} s | ${audit("cumulative-layout-shift").toFixed(3)} | ${Math.round(audit("total-blocking-time"))} ms | ${seoFails || "none"} |`,
  );
}
