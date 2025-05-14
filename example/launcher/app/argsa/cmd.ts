import { relinka } from "@reliverse/relinka";

import { defineArgs, defineCommand } from "~/mod.js";

export default defineCommand({
  meta: {
    name: "hello",
    version: "1.0.0",
    description: "My Awesome CLI App",
  },
  args: defineArgs({
    name: {
      type: "positional",
      description: "Your name",
      required: true,
    },
    friendly: {
      type: "boolean",
      description: "Use friendly greeting",
    },
    age: {
      type: "number",
      description: "Your age",
    },
    adj: {
      type: "array",
      description: "Adjective to use in greeting",
      options: ["awesome", "cool", "nice"],
      default: ["awesome", "cool"],
    },
  }),
  run({ args }) {
    relinka("log", "", args);
    const msg = [
      args.friendly ? "Hi" : "Greetings",
      args.adj || "",
      args.name,
      args.age ? `You are ${args.age} years old.` : "",
    ]
      .filter(Boolean)
      .join(" ");

    relinka("log", msg);
  },
});
