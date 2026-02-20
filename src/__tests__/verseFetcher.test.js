import { describe, it, expect, vi } from "vitest";
import {
  fetchDailyVerse,
  FALLBACK_VERSE,
  VERSE_API_URL,
} from "../utils/verseFetcher.js";

describe("fetchDailyVerse", () => {
  it("returns the verse text and reference from a successful API response", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      json: () =>
        Promise.resolve({
          verse: {
            details: {
              text: "I can do all things through Christ who strengthens me.",
              reference: "Philippians 4:13",
            },
          },
        }),
    });

    const result = await fetchDailyVerse(mockFetch);

    expect(result.text).toBe(
      "I can do all things through Christ who strengthens me."
    );
    expect(result.reference).toBe("Philippians 4:13");
    expect(mockFetch).toHaveBeenCalledWith(VERSE_API_URL);
  });

  it("falls back to John 3:16 when the network request fails", async () => {
    const mockFetch = vi.fn().mockRejectedValue(new Error("Network error"));

    const result = await fetchDailyVerse(mockFetch);

    expect(result).toEqual(FALLBACK_VERSE);
    expect(result.reference).toBe("John 3:16");
  });

  it("falls back to John 3:16 when the API returns malformed JSON", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ unexpected: "shape" }),
    });

    const result = await fetchDailyVerse(mockFetch);

    expect(result).toEqual(FALLBACK_VERSE);
  });

  it("falls back to John 3:16 when response.json() rejects", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      json: () => Promise.reject(new Error("Invalid JSON")),
    });

    const result = await fetchDailyVerse(mockFetch);

    expect(result).toEqual(FALLBACK_VERSE);
  });

  it("calls the correct API URL", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      json: () =>
        Promise.resolve({
          verse: { details: { text: "Test", reference: "Test 1:1" } },
        }),
    });

    await fetchDailyVerse(mockFetch);

    expect(mockFetch).toHaveBeenCalledWith(
      "https://beta.ourmanna.com/api/v1/get/?format=json&order=daily"
    );
  });
});

describe("FALLBACK_VERSE", () => {
  it("contains the expected John 3:16 text and reference", () => {
    expect(FALLBACK_VERSE.text).toContain("God so loved the world");
    expect(FALLBACK_VERSE.reference).toBe("John 3:16");
  });
});
