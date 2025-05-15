import { defineCommand } from "@reliverse/rempts";

export default defineCommand({
  meta: {
    name: "bar",
    description: "Sibling subcommand: sibling/foo/bar/cmd.ts",
  },
  async run({ args, raw }) {
    console.log("[sibling/foo/bar/cmd.ts] args:", args);
    console.log("[sibling/foo/bar/cmd.ts] raw:", raw);
  },
});
