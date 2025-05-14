import { relinka } from "@reliverse/relinka";

import { defineCommand } from "~/mod.js";

export default defineCommand({
  meta: {
    name: "deploy",
    description: "Deploy the bundle output to the cloud.",
    version: "1.0.0",
  },
  args: {
    exclude: {
      type: "string",
      valueHint: "PATTERNS",
      description: "Exclude files that match this pattern",
    },
    include: {
      type: "string",
      valueHint: "PATTERNS",
      description: "Only upload files that match this pattern",
    },
    importMap: {
      type: "string",
      valueHint: "FILE",
      description: "Use import map file",
    },
    static: {
      type: "boolean",
      description: "Don't include the files in the CWD as static files",
      default: false,
    },
    prod: {
      type: "boolean",
      description:
        "Create a production deployment (default is preview deployment)",
    },
    project: {
      type: "string",
      alias: "p",
      valueHint: "NAME",
      description: "The project to deploy to",
    },
    token: {
      type: "string",
      valueHint: "TOKEN",
      description: "The API token to use (defaults to DEPLOY_TOKEN env var)",
    },
    dryRun: {
      type: "boolean",
      description: "Dry run the deployment process",
    },
    provider: {
      type: "positional",
      description: "Deployment provider",
      valueHint: "foo|bar|baz|qux",
    },
  },
  run({ args }) {
    relinka("log", "Build");
    relinka("null", "Parsed args:", args);
  },
});
