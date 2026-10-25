import { expect, test } from "@playwright/test";

test.describe("hero fallbacks", () => {
  test("without JavaScript the page reads fully and shows the static render", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto("/");
    await expect(page.locator("h1")).toHaveText(/Form\s+follows\s+feeling\./i);
    const poster = page.locator(".stage-poster img");
    await expect(poster).toBeVisible();
    expect(await poster.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
    await expect(page.locator("canvas")).toHaveCount(0);
    // Principle figures stand in for the camera moves.
    await expect(page.locator(".principle-figure").first()).toBeVisible();
    await expect(page.getByTestId("enquiry-form")).toBeVisible();
    await expect(page.locator("[data-concept-label]").first()).toBeVisible();
    await context.close();
  });

  test("with reduced motion the 3D scene never loads", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    const scripts: string[] = [];
    page.on("request", (r) => {
      if (r.resourceType() === "script") scripts.push(r.url());
    });
    await page.goto("/?webgl=force");
    await page.mouse.move(400, 400);
    await page.mouse.wheel(0, 600);
    await page.waitForTimeout(1500);
    await expect(page.locator("canvas")).toHaveCount(0);
    await expect(page.locator(".stage-poster img")).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.dataset.stage)).toBeUndefined();
  });

  test("the hero headline is the first heading and the poster is eager", async ({ page }) => {
    await page.goto("/");
    const img = page.locator(".stage-poster img");
    await expect(img).toHaveAttribute("fetchpriority", "high");
    await expect(img).toHaveAttribute("loading", "eager");
    await expect(img).toHaveAttribute("alt", /arch/);
  });

  test("WebGL context loss falls back to the static poster", async ({ page }) => {
    await page.goto("/?webgl=force");
    const hasWebGL2 = await page.evaluate(() => Boolean(document.createElement("canvas").getContext("webgl2")));
    test.skip(!hasWebGL2, "WebGL2 unavailable in this browser");

    await page.mouse.move(400, 400);
    await expect(page.locator(".stage canvas")).toHaveCount(1, { timeout: 15_000 });
    await expect(page.locator(".stage")).toHaveAttribute("data-ready", "true", { timeout: 30_000 });

    await page.evaluate(() => {
      const canvas = document.querySelector(".stage canvas") as HTMLCanvasElement | null;
      const gl = canvas?.getContext("webgl2");
      const ext = gl?.getExtension("WEBGL_lose_context");
      ext?.loseContext();
    });
    await page.waitForTimeout(500);
    await expect(page.locator(".stage canvas")).toHaveCount(0);
    await expect(page.locator(".stage-poster img")).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.dataset.stage)).toBeUndefined();
  });

  test("scrolling is never prevented", async ({ page }) => {
    await page.goto("/?webgl=force");
    await page.mouse.move(300, 300);
    await page.mouse.wheel(0, 1200);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(600);
    const overflow = await page.evaluate(() => [
      getComputedStyle(document.documentElement).overflowY,
      getComputedStyle(document.body).overflowY,
    ]);
    expect(overflow).not.toContain("hidden");
  });
});
