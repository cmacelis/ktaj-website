import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/__tests__/**/*.test.{js,ts}"],
    coverage: {
      provider: "v8",
      include: ["src/utils/**"],
      reporter: ["text", "html"],
    },
  },
});
