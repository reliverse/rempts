import { createMain } from "~/main.js";
import { defineCommand } from "~/main.js";

const command = defineCommand({
  meta: {
    name: "hello",
    version: "1.0.0",
    description: "My Awesome CLI App",
  },
  args: {
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
      required: false,
    },
    adj: {
      type: "enum",
      description: "Adjective to use in greeting",
      options: ["awesome", "cool", "nice"],
      default: "awesome",
      required: false,
    },
  },
  run({ args }) {
    console.log(args);
    const msg = [
      args.friendly ? "Hi" : "Greetings",
      args.adj || "",
      args.name,
      args.age ? `You are ${args.age} years old.` : "",
    ]
      .filter(Boolean)
      .join(" ");

    console.log(msg);
  },
});

await createMain(command)({});
