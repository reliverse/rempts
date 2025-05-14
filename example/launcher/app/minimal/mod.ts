import { defineArgs, defineCommand } from "~/mod.js";

export default defineCommand({
  meta: {
    name: "minimal",
    description: "hello world",
  },
  args: defineArgs({
    name: {
      type: "string",
      description: "your name",
    },
  }),
  run({ args }) {
    console.log(`Hello, ${args.name}!`);
  },
});
