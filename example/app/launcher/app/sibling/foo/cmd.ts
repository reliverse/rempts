import { defineCommand } from "~/mod";

export default defineCommand({
  meta: {
    name: "foo",
    description: "Sibling command: sibling/foo/cmd.ts",
  },
  async run({ args, raw }) {
    console.log("[sibling/foo/cmd.ts] args:", args);
    console.log("[sibling/foo/cmd.ts] raw:", raw);
  },
});
