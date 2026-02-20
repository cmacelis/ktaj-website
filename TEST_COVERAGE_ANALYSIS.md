# Test Coverage Analysis — KTAJ Website

## Current State

**Coverage: 0% — no tests existed before this commit.**

The project is a single-page Astro site with three source files:

| File | Role |
|---|---|
| `src/pages/index.astro` | Main page — all HTML, CSS, and inline JS |
| `src/components/Welcome.astro` | Unused Astro starter template component |
| `src/layouts/Layout.astro` | Unused Astro starter template layout |

No test framework, no test files, and no `test` script were present in
`package.json` prior to this change.

---

## What Was Added in This Commit

| Added file | Purpose |
|---|---|
| `src/utils/verseFetcher.js` | Extracted the daily-verse fetch logic into a pure, injectable module |
| `src/__tests__/verseFetcher.test.js` | Unit tests for the verse-fetcher (6 tests) |
| `src/__tests__/pageStructure.test.js` | Structural smoke tests parsed directly from source (18 tests) |
| `vitest.config.js` | Vitest configuration with coverage settings |
| `package.json` scripts | `test`, `test:watch`, `test:coverage` |

Run the suite:

```bash
npm test            # single run
npm run test:watch  # watch mode (development)
npm run test:coverage # generate HTML coverage report
```

---

## Areas Identified for Further Improvement

The tests added here are a starting point. The following areas represent the
most valuable next steps, ordered by impact.

---

### 1. End-to-End (E2E) Tests — Highest Priority

**Why:** The site's behaviour in a real browser cannot be confirmed by parsing
source files. E2E tests would catch regressions in rendering, JavaScript
execution, and network interactions.

**Recommended tool:** [Playwright](https://playwright.dev) — official Astro
recommendation, cross-browser, excellent async support.

**Scenarios to cover:**

| Scenario | Why it matters |
|---|---|
| Page loads and `<title>` is correct | Basic smoke test |
| Hero section renders with correct heading text | Core brand content |
| Daily verse loads from API and replaces "Loading today's word..." | The only client-side JS on the page |
| Daily verse fallback (John 3:16) shows when API is down | Error-handling correctness |
| Clicking "Join the Community" scrolls to `#connect` | Anchor nav works |
| All nav links are present and point to correct targets | Regression safety |
| Prayer form rejects submission without a message | `required` attribute enforcement |
| Prayer form submits and redirects back to the site | Happy-path form flow |
| Social links open the correct URLs | Prevents broken community links |
| Merch images load without 404 errors | Asset integrity |

**Setup skeleton:**

```bash
npm install --save-dev @playwright/test
npx playwright install chromium
```

```js
// e2e/homepage.spec.js
import { test, expect } from "@playwright/test";

test("daily verse loads from API", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#verse-text")).not.toHaveText("Loading today's word...");
});

test("daily verse shows fallback on API failure", async ({ page, context }) => {
  await context.route("**/ourmanna.com/**", (route) => route.abort());
  await page.goto("/");
  await expect(page.locator("#verse-text")).toContainText("God so loved the world");
});
```

---

### 2. Accessibility (a11y) Tests — High Priority

**Why:** The site has several accessibility gaps that automated tools can catch
quickly and that affect real users.

**Issues to address:**

| Element | Gap |
|---|---|
| Navigation logo `<a>` | Contains only an `<img>` — the `alt` text ("KTAJ Logo") serves as the link label; verify it is sufficient |
| Social link icons | No icons currently, but if added later they need `aria-label` |
| Prayer form inputs | `name` and `placeholder` are present, but `<label>` elements are absent — screen readers rely on labels |
| Merch "Buy Now" links | All three say "Buy Now" with no distinguishing context; screen readers will announce them identically |
| YouTube iframe | Has `title="KTAJ Ministry Video"` — good; verify this is preserved |

**Recommended tool:** [axe-core](https://github.com/dequelabs/axe-core) via
`@axe-core/playwright` for Playwright integration.

```bash
npm install --save-dev @axe-core/playwright
```

```js
import AxeBuilder from "@axe-core/playwright";

test("homepage has no critical a11y violations", async ({ page }) => {
  await page.goto("/");
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter(v => v.impact === "critical")).toHaveLength(0);
});
```

---

### 3. Link Integrity Tests — Medium Priority

**Why:** External social/community links are the primary way users connect
with the ministry. A broken link has direct real-world impact.

**Recommended tool:** A lightweight link-checker script run in CI, or
Playwright's `page.request` for targeted checks.

**Links to verify regularly:**

- PayPal Donate (`paypal.com/donate?business=Ktajministries@gmail.com`)
- Discord invite (`discord.gg/JzZdKn8KHy`) — Discord invites expire
- TikTok profile (`tiktok.com/@_wyldeman_`)
- Instagram (`instagram.com/ktajministries`)
- YouTube (`youtube.com/@ktajministries`)

**Suggestion:** Run a nightly CI job that checks each URL returns a 2xx
status code and alerts if any are broken.

---

### 4. Visual Regression Tests — Medium Priority

**Why:** The site is visually driven. CSS changes can break layout silently.

**Recommended tool:** Playwright's built-in screenshot comparison.

```js
test("homepage matches visual snapshot", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveScreenshot("homepage.png", { fullPage: true });
});
```

Screenshots should be committed to the repository and reviewed on each PR.

---

### 5. Component Tests for Unused Templates — Low Priority

`Welcome.astro` and `Layout.astro` are the unmodified Astro starter template
files and are not used by the main page. Before they are either deleted or
adopted:

- If **deleted**: no tests needed.
- If **adopted**: test them with
  [`@astrojs/test-utils`](https://docs.astro.build/en/guides/testing/) to
  assert that the slot renders correctly and `<title>` is configurable.

---

### 6. Build / CI Smoke Test — Low Priority (but quick win)

Add a CI step that runs `astro build` and fails the pipeline if the build
exits non-zero. This catches broken imports and syntax errors before deploy.

```yaml
# .github/workflows/ci.yml (example)
- name: Build
  run: npm run build
- name: Test
  run: npm test
```

---

## Coverage Summary

| Area | Current coverage | Recommended target |
|---|---|---|
| Verse-fetch utility | ~100% (unit tests) | Maintain |
| Page structure (source-level) | ~100% (smoke tests) | Maintain |
| Client-side JS behaviour | 0% | E2E tests |
| Accessibility | 0% | axe-core via Playwright |
| External link integrity | 0% | Nightly CI checker |
| Visual regression | 0% | Playwright screenshots |
| Form submission flow | 0% | E2E tests |
