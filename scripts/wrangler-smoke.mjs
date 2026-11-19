#!/usr/bin/env node
/**
 * Smoke-test the OpenNext bundle with wrangler dev (no deploy).
 * Expects `npm run cf:build` to have been run first.
 */
import { spawn } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";

const port = Number(process.env.WRANGLER_PORT ?? 8787);
const base = `http://127.0.0.1:${port}`;
const paths = ["/", "/projects/wilyabrup-pavilion", "/robots.txt"];

const child = spawn(
  "npx",
  ["wrangler", "dev", ".open-next/worker.js", "--port", String(port), "--local", "--ip", "127.0.0.1"],
  { stdio: ["ignore", "pipe", "pipe"], env: process.env },
);

let log = "";
child.stdout?.on("data", (d) => {
  log += d;
});
child.stderr?.on("data", (d) => {
  log += d;
});

const ready = async () => {
  for (let i = 0; i < 90; i++) {
    if (/Ready on|listening on|wrangler dev/i.test(log)) return;
    try {
      const r = await fetch(`${base}/`);
      if (r.ok) return;
    } catch {
      /* not up yet */
    }
    await sleep(1000);
  }
  throw new Error(`wrangler dev did not become ready:\n${log.slice(-2000)}`);
};

const shutdown = () => {
  child.kill("SIGTERM");
};

process.on("exit", shutdown);
process.on("SIGINT", () => process.exit(1));

try {
  await ready();
  for (const p of paths) {
    const res = await fetch(base + p);
    if (!res.ok) throw new Error(`${p} returned ${res.status}`);
    const robots = res.headers.get("x-robots-tag") ?? "";
    if (p !== "/robots.txt" && !/noindex/i.test(robots)) {
      throw new Error(`${p} missing X-Robots-Tag noindex (got ${robots || "none"})`);
    }
    if (p === "/robots.txt") {
      const body = await res.text();
      if (!/Disallow:\s*\/\s*$/m.test(body)) throw new Error("robots.txt does not disallow /");
    }
  }
  console.log("wrangler dev smoke: OK", paths.join(", "));
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  shutdown();
  // wrangler leaves workerd children holding the pipes open, which would keep this process alive.
  setTimeout(() => process.exit(process.exitCode ?? 0), 500).unref?.();
  process.exit(process.exitCode ?? 0);
}
