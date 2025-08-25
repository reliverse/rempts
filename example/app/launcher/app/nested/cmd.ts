import { defineCommand } from "~/mod";

export default defineCommand({
  meta: {
    name: "foo",
    description: "First-level command: nested/cmd.ts",
  },
  async run({ args, raw }) {
    console.log("[nested/cmd.ts] args:", args);
    console.log("[nested/cmd.ts] raw:", raw);
  },
});
