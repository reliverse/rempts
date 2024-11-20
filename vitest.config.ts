import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["examples/**/*.test.ts"],
    exclude: ["dist", "node_modules", "output"],
    alias: {
// @ts-expect-error -- TODO: The 'import.meta' meta-property is only allowed when the '--module' option is 'es2020', 'es2022', 'esnext', 'system', 'node16', or 'nodenext'.
      "~/": new URL("./src/", import.meta.url).pathname,
// @ts-expect-error -- TODO: The 'import.meta' meta-property is only allowed when the '--module' option is 'es2020', 'es2022', 'esnext', 'system', 'node16', or 'nodenext'.
      "@/*": new URL("./examples/*", import.meta.url).pathname,
// @ts-expect-error -- TODO: The 'import.meta' meta-property is only allowed when the '--module' option is 'es2020', 'es2022', 'esnext', 'system', 'node16', or 'nodenext'.
      "#/*": new URL("./addons/*", import.meta.url).pathname,
    },
    watch: false,
  },
});
