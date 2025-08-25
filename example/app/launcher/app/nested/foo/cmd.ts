import { defineCommand } from "~/mod";

export default defineCommand({
  meta: {
    name: "foo",
    description: "Parent command: nested/foo/cmd.ts",
  },
  async run({ args, raw }) {
    console.log("[nested/foo/cmd.ts] args:", args);
    console.log("[nested/foo/cmd.ts] raw:", raw);
  },
});
