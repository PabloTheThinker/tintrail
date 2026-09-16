import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: [
      "packages/**/*.test.ts",
      "apps/runtime/**/*.test.ts",
      "apps/desk/src/**/*.test.ts",
    ],
    environment: "node",
  },
});
