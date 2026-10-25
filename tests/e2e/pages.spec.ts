import { expect, test } from "@playwright/test";
import { CONCEPT_LABEL, CONCEPT_URL, routes } from "./routes";

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

    test("shows the concept label, linking to the concept page", async ({ page }) => {
      await page.goto(route);
      const label = page.locator("[data-concept-label]").first();
      await expect(label).toBeVisible();
      await expect(label).toHaveText(CONCEPT_LABEL);
      await expect(label).toHaveAttribute("href", CONCEPT_URL);
      // It also stays in view after scrolling, because it lives in the fixed header.
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
      await expect(label).toBeInViewport();
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
  await expect(page.locator("[data-concept-label]").first()).toBeVisible();
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
