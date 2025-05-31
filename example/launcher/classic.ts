// 👉 `bun example/classic.ts`

import { relinka } from "@reliverse/relinka";

import { defineArgs, defineCommand, runMain } from "~/mod.js";

const main = defineCommand({
  meta: {
    name: "rempts",
    version: "1.0.0",
    description: "Rempts Launcher Playground CLI",
  },
  args: defineArgs({
    name: {
      type: "positional",
      description: "Your name",
    },
  }),
  setup() {
    relinka("success", "Setup");
  },
  cleanup() {
    relinka("success", "Cleanup");
  },
  commands: {
    build: () => import("./app/build/cmd.js").then((r) => r.default),
    deploy: () => import("./app/deploy/cmd.js").then((r) => r.default),
    debug: () => import("./app/debug/cmd.js").then((r) => r.default),
  },
  run({ args }) {
    if (args.name) {
      relinka("success", `Hello ${args.name}`);
    } else {
      relinka("error", "Hello, Reliverse :)");
    }
  },
});

await runMain(main);
