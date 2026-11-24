import { expect, test } from "@playwright/test";
import { CONCEPT_DISCLOSURE, CONCEPT_URL, STUDIO_CTA_URL, routes } from "./routes";

for (const route of routes) {
  test.describe(`page ${route}`, () => {
    test("renders with one h1, landmarks and no console errors", async ({ page }) => {
      const errors: string[] = [];
      page.on("console", (msg) => {
        if (msg.type() === "error") errors.push(msg.text());
      });
      page.on("pageerror", (err) => errors.push(err.message));

      const response = await page.goto(route);
      expect(response?.status()).toBe(200);
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.locator("h1")).toBeVisible();
      await expect(page.locator("header.site-header")).toBeVisible();
      await expect(page.locator("main#main")).toBeVisible();
      await expect(page.locator("footer.site-footer")).toBeAttached();
      expect(await page.title()).toContain("Cinder Arc");
      expect(errors).toEqual([]);
    });

    test("is noindex via meta robots and X-Robots-Tag", async ({ page }) => {
      const response = await page.goto(route);
      const header = response?.headers()["x-robots-tag"] ?? "";
      expect(header).toMatch(/noindex/);
      expect(header).toMatch(/nofollow/);
      const robots = page.locator('meta[name="robots"]');
      await expect(robots).toHaveCount(1);
      const content = (await robots.getAttribute("content")) ?? "";
      expect(content).toMatch(/noindex/);
      expect(content).toMatch(/nofollow/);
    });

    test("shows the studio strip: disclosure, return link and enquiry link", async ({ page }) => {
      await page.goto(route);
      const strip = page.locator(".concept-strip");
      await expect(strip.locator("[data-concept-disclosure]")).toHaveText(CONCEPT_DISCLOSURE);
      const back = strip.locator("[data-concept-return]");
      await expect(back).toBeVisible();
      await expect(back).toHaveAttribute("href", CONCEPT_URL);
      await expect(back).toHaveAccessibleName("Back to the concept");
      const cta = strip.locator("[data-concept-cta]");
      await expect(cta).toBeVisible();
      await expect(cta).toHaveAttribute("href", STUDIO_CTA_URL);
      await expect(cta).toHaveAccessibleName("Want a website like this?");
      // The footer repeats both links.
      await expect(page.locator(".site-footer [data-concept-return]")).toHaveAttribute("href", CONCEPT_URL);
      await expect(page.locator(".site-footer [data-concept-cta]")).toHaveAttribute("href", STUDIO_CTA_URL);
      // On wide screens it stays in view after scrolling, in the fixed header.
      if ((page.viewportSize()?.width ?? 0) >= 960) {
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
        await expect(cta).toBeInViewport();
      }
    });

    test("has no horizontal overflow at 320px", async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 640 });
      await page.goto(route);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow).toBeLessThanOrEqual(0);
    });

    test("every image has alt text", async ({ page }) => {
      await page.goto(route);
      const missing = await page.locator("img:not([alt])").count();
      expect(missing).toBe(0);
    });
  });
}

test("robots.txt disallows everything", async ({ request }) => {
  const res = await request.get("/robots.txt");
  expect(res.status()).toBe(200);
  const body = await res.text();
  expect(body).toMatch(/User-agent:\s*\*/);
  expect(body).toMatch(/Disallow:\s*\/\s*$/m);
  expect(res.headers()["x-robots-tag"]).toMatch(/noindex/);
});

test("unknown routes return a noindex 404 with the concept label", async ({ page }) => {
  const res = await page.goto("/no-such-page");
  expect(res?.status()).toBe(404);
  await expect(page.locator("[data-concept-cta]").first()).toBeVisible();
  // Next.js adds its own robots meta to 404s alongside ours; every one must say noindex.
  const contents = await page.locator('meta[name="robots"]').evaluateAll((els) => els.map((el) => el.getAttribute("content") ?? ""));
  expect(contents.length).toBeGreaterThan(0);
  for (const c of contents) expect(c).toMatch(/noindex/);
  expect(contents.join(",")).toMatch(/nofollow/);
  expect(res?.headers()["x-robots-tag"]).toMatch(/noindex/);
});

test("project cards link to every project page", async ({ page }) => {
  await page.goto("/");
  const links = page.locator("#projects .project-card-link");
  await expect(links).toHaveCount(4);
  await links.first().click();
  await expect(page).toHaveURL(/\/projects\/wilyabrup-pavilion$/);
  await expect(page.locator("h1")).toHaveText("Wilyabrup Pavilion");
});

test("footer credits OFF/SHIFT Studio with a link home and the canonical wordmark", async ({ page }) => {
  await page.goto("/");
  const credit = page.locator(".site-footer [data-footer-credit] a");
  await expect(credit).toHaveAttribute("href", "https://offshiftstudio.com.au");
  await expect(credit).toHaveAttribute("rel", "noopener");
  await expect(credit.locator("img")).toHaveAttribute("alt", "OFF/SHIFT Studio");
  await expect(credit.locator("img")).toHaveAttribute("src", "/brand/offshift-wordmark-dark.svg");
});
