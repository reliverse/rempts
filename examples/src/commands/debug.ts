import relinka from "@reliverse/relinka";

import { defineCommand } from "~/main.js";

export default defineCommand({
  meta: {
    name: "debug",
    description: "Debug the project",
    hidden: true,
  },
  args: {
    verbose: {
      type: "boolean",
      description: "Output more detailed debugging information",
    },
    feature: {
      type: "string",
      default: "database-query",
      description: "Only debug a specific function",
    },
  },
  run({ args }) {
    relinka.log("Debug");
    relinka.log("Parsed args:", args);
  },
});
