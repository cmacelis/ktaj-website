const FALLBACK_VERSE = {
  text: "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.",
  reference: "John 3:16",
};

const VERSE_API_URL =
  "https://beta.ourmanna.com/api/v1/get/?format=json&order=daily";

/**
 * Fetches the daily Bible verse from the OurManna API.
 * Falls back to John 3:16 on any error.
 *
 * @param {typeof fetch} fetchFn - The fetch function to use (injectable for testing)
 * @returns {Promise<{text: string, reference: string}>}
 */
export async function fetchDailyVerse(fetchFn = fetch) {
  try {
    const response = await fetchFn(VERSE_API_URL);
    const data = await response.json();
    return {
      text: data.verse.details.text,
      reference: data.verse.details.reference,
    };
  } catch {
    return FALLBACK_VERSE;
  }
}

export { FALLBACK_VERSE, VERSE_API_URL };
