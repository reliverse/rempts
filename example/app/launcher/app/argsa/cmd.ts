import { relinka } from "@reliverse/relinka";

import { defineArgs, defineCommand } from "~/mod";

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
      allowed: ["awesome", "cool", "nice"],
      default: ["awesome", "cool"],
    },
  }),
  run({ args }) {
    relinka("log", "", args);

    const { friendly, adj, name, age } = args;
    const strFriendly = String(friendly);
    const intAge = Number(age);
    const strAdj = Array.isArray(adj) ? adj.join(", ") : "";
    const strName = String(name);
    const strAge = intAge ? `You are ${intAge} years old.` : "";

    const msg = [strFriendly ? "Hi" : "Greetings", strAdj, strName, strAge]
      .filter(Boolean)
      .join(" ");

    relinka("log", msg);
  },
});
