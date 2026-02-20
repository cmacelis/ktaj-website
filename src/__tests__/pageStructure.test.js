/**
 * Page structure smoke tests.
 *
 * These tests parse the raw index.astro source to assert that critical
 * structural elements (sections, links, form attributes, meta tags) are
 * present and correctly configured, without requiring a running browser or
 * a full Astro build.
 *
 * NOTE: A more thorough alternative is end-to-end testing with Playwright
 * against `astro dev` or `astro preview` (see TEST_COVERAGE_ANALYSIS.md).
 */

import { describe, it, expect, beforeAll } from "vitest";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const indexSource = readFileSync(
  resolve(__dirname, "../../src/pages/index.astro"),
  "utf-8"
);

describe("Page meta tags", () => {
  it("sets the correct page title", () => {
    expect(indexSource).toContain(
      "<title>KTAJ - Keep Talking About Jesus</title>"
    );
  });

  it("includes a charset declaration", () => {
    expect(indexSource).toContain('charset="utf-8"');
  });

  it("includes a viewport meta tag", () => {
    expect(indexSource).toContain('name="viewport"');
  });
});

describe("Navigation links", () => {
  it("links to the About section", () => {
    expect(indexSource).toContain('href="#about"');
  });

  it("links to the Connect section", () => {
    expect(indexSource).toContain('href="#connect"');
  });

  it("links to the Prayer section", () => {
    expect(indexSource).toContain('href="#prayer"');
  });

  it("includes a Donate button pointing to PayPal", () => {
    expect(indexSource).toContain("paypal.com/donate");
    expect(indexSource).toContain("Ktajministries@gmail.com");
  });

  it("opens the Donate link in a new tab", () => {
    // The donate link should have target="_blank" for security/UX
    const donateRegex =
      /href="https:\/\/www\.paypal\.com\/donate[^"]*"[^>]*target="_blank"/;
    expect(indexSource).toMatch(donateRegex);
  });
});

describe("Page sections", () => {
  it("has a daily-verse section", () => {
    expect(indexSource).toContain('id="daily-verse"');
  });

  it("has an about section", () => {
    expect(indexSource).toContain('id="about"');
  });

  it("has a connect section", () => {
    expect(indexSource).toContain('id="connect"');
  });

  it("has a merch section", () => {
    expect(indexSource).toContain('id="merch"');
  });

  it("has a prayer section", () => {
    expect(indexSource).toContain('id="prayer"');
  });
});

describe("Social media links", () => {
  it("links to TikTok", () => {
    expect(indexSource).toContain("tiktok.com/@_wyldeman_");
  });

  it("links to Discord", () => {
    expect(indexSource).toContain("discord.gg/JzZdKn8KHy");
  });

  it("links to Instagram", () => {
    expect(indexSource).toContain("instagram.com/ktajministries");
  });

  it("links to YouTube", () => {
    expect(indexSource).toContain("youtube.com/@ktajministries");
  });
});

describe("Prayer request form", () => {
  it("submits to the web3forms API", () => {
    expect(indexSource).toContain(
      'action="https://api.web3forms.com/submit"'
    );
  });

  it("uses POST method", () => {
    expect(indexSource).toContain('method="POST"');
  });

  it("includes the web3forms access key", () => {
    expect(indexSource).toContain('name="access_key"');
  });

  it("includes a redirect hidden field", () => {
    expect(indexSource).toContain('name="redirect"');
  });

  it("marks the message textarea as required", () => {
    expect(indexSource).toContain(
      '<textarea name="message" required'
    );
  });
});

describe("Merch section", () => {
  it("displays three merch items", () => {
    const merchCardMatches = (indexSource.match(/class="merch-card"/g) || [])
      .length;
    expect(merchCardMatches).toBe(3);
  });

  it("includes alt text on all merch images", () => {
    const imgTags = indexSource.match(/<img[^>]+class="merch-img"[^>]*>/g) || [];
    imgTags.forEach((tag) => {
      expect(tag).toMatch(/alt="[^"]+"/);
    });
  });
});

describe("Verse display elements", () => {
  it("has a verse-text placeholder element", () => {
    expect(indexSource).toContain('id="verse-text"');
  });

  it("has a verse-reference placeholder element", () => {
    expect(indexSource).toContain('id="verse-reference"');
  });

  it("shows a loading state by default", () => {
    expect(indexSource).toContain("Loading today's word...");
  });
});
