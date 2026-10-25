import { expect, test } from "@playwright/test";

/**
 * Exercises the live scene on desktop. Headless CI has no GPU, so this
 * forces WebGL onto SwiftShader with ?webgl=force; if even that is
 * unavailable the test is skipped rather than failing.
 */
test("the live 3D scene loads on interaction, fades in and follows scroll", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));

  await page.goto("/?webgl=force");
  const hasWebGL2 = await page.evaluate(() => Boolean(document.createElement("canvas").getContext("webgl2")));
  test.skip(!hasWebGL2, "WebGL2 unavailable in this browser");

  await expect(page.locator("html")).toHaveAttribute("data-stage", "3d");
  await page.mouse.move(700, 450);
  await expect(page.locator(".stage canvas")).toHaveCount(1, { timeout: 15_000 });
  await expect(page.locator(".stage")).toHaveAttribute("data-ready", "true", { timeout: 30_000 });
  // While live, the principle stills are hidden because the camera shows those views.
  await expect(page.locator(".principle-figure").first()).toBeHidden();

  await page.mouse.wheel(0, 1600);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(800);
  await page.waitForTimeout(600);
  await expect(page.locator(".stage canvas")).toBeVisible();
  expect(errors).toEqual([]);
});
