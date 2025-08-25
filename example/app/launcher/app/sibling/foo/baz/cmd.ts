import { defineCommand } from "~/mod";

export default defineCommand({
  meta: {
    name: "baz",
    description: "Sibling subcommand: sibling/foo/baz/cmd.ts",
  },
  async run({ args, raw }) {
    console.log("[sibling/foo/baz/cmd.ts] args:", args);
    console.log("[sibling/foo/baz/cmd.ts] raw:", raw);
  },
});
