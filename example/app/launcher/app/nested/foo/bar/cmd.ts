import { defineCommand } from "~/mod";

export default defineCommand({
  meta: {
    name: "bar",
    description: "Mid-level command: nested/foo/bar/cmd.ts",
  },
  async run({ args, raw }) {
    console.log("[nested/foo/bar/cmd.ts] args:", args);
    console.log("[nested/foo/bar/cmd.ts] raw:", raw);
  },
});
