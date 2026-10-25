import { expect, test, type Page, type Request } from "@playwright/test";

async function fillValid(page: Page) {
  const form = page.getByTestId("enquiry-form");
  await form.getByLabel("Your name").fill("Alex Rivers");
  await form.getByLabel("Email").fill("alex@example.com");
  await form.getByLabel("Phone").fill("0400 000 000");
  await form.getByLabel("Suburb or site location").fill("Fremantle");
  await form.getByRole("radio", { name: "Renovation or addition" }).check();
  await form.getByLabel("Indicative budget").selectOption({ index: 2 });
  await form.getByLabel("Ideal timing").selectOption({ index: 1 });
  await form.getByRole("radio", { name: "At my site" }).check();
  await form.getByLabel("About the project").fill("A 1930s cottage that needs light, a garden room and a calmer kitchen.");
}

/** Counts every script-level way data could leave the page: fetch, XHR, beacons and form submits. */
const spyScript = () => {
  const w = window as unknown as { __sent: string[] };
  w.__sent = [];
  const origFetch = window.fetch.bind(window);
  window.fetch = (...args: Parameters<typeof fetch>) => {
    w.__sent.push(`fetch ${String(args[0])}`);
    return origFetch(...args);
  };
  const origSend = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.send = function (...args) {
    w.__sent.push("xhr");
    return origSend.apply(this, args);
  };
  const origBeacon = navigator.sendBeacon?.bind(navigator);
  if (origBeacon)
    navigator.sendBeacon = (url, data) => {
      w.__sent.push(`beacon ${String(url)}`);
      return origBeacon(url, data);
    };
  const origSubmit = HTMLFormElement.prototype.submit;
  HTMLFormElement.prototype.submit = function () {
    w.__sent.push("form.submit");
    return origSubmit.call(this);
  };
};

test.describe("consultation form (demo only)", () => {
  test.use({ reducedMotion: "reduce" });

  test("makes no network request at all while filling and submitting", async ({ page }) => {
    await page.addInitScript(spyScript);
    await page.goto("/#consultation");
    await page.waitForLoadState("networkidle");

    const requests: Request[] = [];
    page.on("request", (r) => requests.push(r));
    await page.evaluate(() => ((window as unknown as { __sent: string[] }).__sent = []));

    await fillValid(page);
    await page.getByRole("button", { name: "Request a consultation" }).click();
    await expect(page.getByTestId("enquiry-success")).toBeVisible();
    await expect(page.getByTestId("enquiry-success")).toContainText("Nothing was sent or stored");
    // Give any stray beacon or fetch time to fire before asserting.
    await page.waitForTimeout(1000);

    const sent = await page.evaluate(() => (window as unknown as { __sent: string[] }).__sent);
    expect(sent).toEqual([]);

    // Lazy images further down the page may load as the success panel changes height.
    // Nothing else may: no navigations, no fetch/XHR/beacons, no bodies, no form values in URLs.
    const leaks = requests.filter((r) => {
      const url = decodeURIComponent(r.url());
      return (
        r.method() !== "GET" ||
        r.postData() !== null ||
        !["image", "font", "stylesheet", "script"].includes(r.resourceType()) ||
        /Alex|alex@example|Fremantle|cottage/i.test(url)
      );
    });
    expect(leaks.map((r) => `${r.method()} ${r.resourceType()} ${r.url()}`)).toEqual([]);
    await expect(page).toHaveURL(/\/#consultation$/);
  });

  test("shows accessible errors and focuses the summary when invalid", async ({ page }) => {
    await page.goto("/#consultation");
    const requests: Request[] = [];
    page.on("request", (r) => requests.push(r));

    await page.getByRole("button", { name: "Request a consultation" }).click();
    const summary = page.getByTestId("enquiry-form").getByRole("alert");
    await expect(summary).toBeVisible();
    await expect(summary).toBeFocused();
    await expect(summary).toContainText("Your name");
    await expect(summary).toContainText("Email");
    await expect(summary).toContainText("Type of project");
    await expect(summary).toContainText("About the project");

    const name = page.getByLabel("Your name");
    await expect(name).toHaveAttribute("aria-invalid", "true");
    await expect(name).toHaveAccessibleDescription(/Enter your name/);

    await page.getByLabel("Email").fill("not-an-email");
    await page.getByRole("button", { name: "Request a consultation" }).click();
    await expect(page.getByLabel("Email")).toHaveAccessibleDescription(/name@example\.com/);
    expect(requests).toHaveLength(0);
  });

  test("success state can be reset to a fresh form", async ({ page }) => {
    await page.goto("/#consultation");
    await fillValid(page);
    await page.getByRole("button", { name: "Request a consultation" }).click();
    await expect(page.getByRole("heading", { name: /This was a demonstration/ })).toBeFocused();
    await page.getByRole("button", { name: "Start a new enquiry" }).click();
    await expect(page.getByLabel("Your name")).toHaveValue("");
  });

  test("service links preselect the project type", async ({ page }) => {
    await page.goto("/?service=interiors#consultation");
    await expect(page.getByRole("radio", { name: "Interiors" })).toBeChecked();
  });

  test("the form has no action and cannot navigate", async ({ page }) => {
    await page.goto("/");
    const form = page.getByTestId("enquiry-form");
    expect(await form.getAttribute("action")).toBeNull();
    expect(await form.getAttribute("method")).toBe("dialog");
  });
});

test("with motion allowed, submitting sends nothing either", async ({ page }) => {
  await page.goto("/#consultation");
  await page.waitForLoadState("networkidle");
  const sent: Request[] = [];
  page.on("request", (r) => {
    // The 3D hero may lazy-load its script chunk on first interaction and lazy
    // images load as fields scroll into view; both are same-origin static GETs.
    // Anything else, or anything carrying form data, fails.
    const url = new URL(r.url());
    const isStaticGet =
      r.method() === "GET" &&
      url.origin === new URL(page.url()).origin &&
      /^\/(_next\/static|images)\//.test(url.pathname) &&
      url.search === "";
    if (!isStaticGet || r.postData()) sent.push(r);
  });
  await fillValid(page);
  await page.getByRole("button", { name: "Request a consultation" }).click();
  await expect(page.getByTestId("enquiry-success")).toBeVisible();
  await page.waitForTimeout(1000);
  expect(sent.map((r) => `${r.method()} ${r.url()}`)).toEqual([]);
});
