import { defineCommand, runMain } from "~/main.js";

import packageJson from "../package.json" with { type: "json" };

const main = defineCommand({
  meta: {
    name: packageJson.name,
    version: packageJson.version,
    description: packageJson.description,
  },
  setup() {
    console.info("✅ Setup");
  },
  cleanup() {
    console.info("✅ Cleanup");
  },
  subCommands: {
    build: () => import("./src/commands/build.js").then((r) => r.default),
    deploy: () => import("./src/commands/deploy.js").then((r) => r.default),
    debug: () => import("./src/commands/debug.js").then((r) => r.default),
  },
});

await runMain(main);
