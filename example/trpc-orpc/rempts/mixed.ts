// 👉 `bun example/trpc-orpc/rempts/mixed.ts`

import { initTRPC } from "@trpc/server";
import { z } from "zod";

import { createCli } from "~/libs/launcher/launcher-mod.js";

// Example tRPC router
const t = initTRPC.create();

const appRouter = t.router({
  calculate: t.procedure
    .input(
      z.object({
        operation: z.enum(["add", "subtract", "multiply", "divide"]),
        a: z.number(),
        b: z.number(),
      }),
    )
    .mutation(({ input }) => {
      switch (input.operation) {
        case "add":
          return input.a + input.b;
        case "subtract":
          return input.a - input.b;
        case "multiply":
          return input.a * input.b;
        case "divide":
          if (input.b === 0) throw new Error("Division by zero");
          return input.a / input.b;
      }
    }),

  greet: t.procedure
    .input(z.object({ name: z.string().optional() }))
    .query(({ input }) => {
      return `Hello ${input.name ?? "World"}!`;
    }),
});

export type AppRouter = typeof appRouter;

// Mixed CLI with both traditional commands and RPC functionality
await createCli({
  name: "mixed-cli",
  version: "1.0.0",
  description: "A CLI with both traditional and RPC commands using createCli",

  // Traditional command
  run: async ({ args }) => {
    console.log("Traditional command executed with args:", args);
    console.log("You can also use RPC commands like:");
    console.log("  mixed-cli calculate --operation add --a 5 --b 3");
    console.log("  mixed-cli greet --name Alice");
  },
  args: {
    message: {
      type: "string",
      description: "A message to display",
    },
  },

  // RPC functionality
  rpc: {
    router: appRouter,
    usage: [
      "mixed-cli calculate --operation add --a 5 --b 3",
      "mixed-cli greet --name Alice",
      "mixed-cli --message 'Hello from traditional command'",
    ],
  },
});
