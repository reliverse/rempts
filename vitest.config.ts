import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["examples/**/*.test.ts"],
    exclude: ["dist", "node_modules", "output"],
    alias: {
      "~/": new URL("./src/", import.meta.url).pathname,
    },
    watch: false,
  },
});
