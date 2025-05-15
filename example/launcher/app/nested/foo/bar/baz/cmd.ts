import { defineCommand } from "@reliverse/rempts";

export default defineCommand({
  meta: {
    name: "baz",
    description: "Deep nested command: nested/foo/bar/baz/cmd.ts",
  },
  async run({ args, raw }) {
    console.log("[nested/foo/bar/baz/cmd.ts] args:", args);
    console.log("[nested/foo/bar/baz/cmd.ts] raw:", raw);
  },
});
