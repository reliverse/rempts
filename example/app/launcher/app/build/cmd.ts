import { relinka } from "@reliverse/relinka";

import { defineArgs, defineCommand } from "~/mod";

export default defineCommand({
  meta: {
    name: "build",
    version: "1.0.0",
    description: "Build the project from current directory",
  },
  args: defineArgs({
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
    },
    entry: {
      type: "array",
      description: "paths to entrypoints",
      default: ["src/index.ts", "src/index.tsx"],
    },
    dst: {
      type: "positional",
      description: "path to output directory",
      default: ".output",
    },
  }),
  run({ args }) {
    relinka("log", "Build");
    relinka("null", "Parsed args:", args);

    const { entry } = args;

    const strEntry = Array.isArray(entry) ? entry.join(", ") : "";
    relinka("log", "Bundling inputs:", strEntry);
  },
});
