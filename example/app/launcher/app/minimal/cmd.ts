import { relinka } from "@reliverse/relinka";

import { defineArgs, defineCommand } from "~/mod";

export default defineCommand({
  meta: {
    name: "minimal",
    description: "hello world",
  },
  args: defineArgs({
    name: {
      type: "string",
      description: "your name",
      allowed: ["John", "Jane", "Jim"],
      required: true,
    },
  }),
  run({ args }) {
    relinka("success", `👋 Hello, ${args.name}!`);
  },
});
