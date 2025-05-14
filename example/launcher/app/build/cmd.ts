import { relinka } from "@reliverse/relinka";

import { defineCommand } from "~/mod.js";

export default defineCommand({
  meta: {
    name: "build",
    version: "1.0.0",
    description: "Build the project from current directory",
  },
  args: {
    prod: {
      type: "boolean",
      description: "production mode",
      alias: "p",
    },
    bundler: {
      type: "string",
      default: "rollup",
      description: "bundler name",
    },
    hmr: {
      type: "boolean",
      description: "disable hot module replacement",
      default: true,
    },
    workDir: {
      type: "string",
      description: "working directory",
      required: true,
    },
    entry: {
      type: "positional",
      description: "path to entrypoint",
    },
    dst: {
      type: "positional",
      description: "path to output directory",
      default: ".output",
    },
  },
  run({ args }) {
    relinka("log", "Build");
    relinka("null", "Parsed args:", args);
  },
});
