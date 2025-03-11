import { defineCommand, runMain } from "~/main.js";

import packageJson from "../../../package.json" with { type: "json" };

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
    build: () => import("./cmds/build.js").then((r) => r.default),
    deploy: () => import("./cmds/deploy.js").then((r) => r.default),
    debug: () => import("./cmds/debug.js").then((r) => r.default),
  },
});

await runMain(main);
