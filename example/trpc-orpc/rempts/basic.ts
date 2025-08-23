// 👉 `bun example/trpc-orpc/rempts/basic.ts`

import { initTRPC } from "@trpc/server";
import { z } from "zod";

import { createCli } from "~/libs/launcher/launcher-mod";

// Example tRPC router
const t = initTRPC.create();

const appRouter = t.router({
  hello: t.procedure.input(z.object({ name: z.string().optional() })).query(({ input }) => {
    return `Hello ${input.name ?? "World"}!`;
  }),

  add: t.procedure
    .input(
      z.object({
        a: z.number(),
        b: z.number(),
      }),
    )
    .mutation(({ input }) => {
      return input.a + input.b;
    }),
});

export type AppRouter = typeof appRouter;

// Basic RPC CLI using createCli
await createCli({
  name: "basic-rpc-cli",
  version: "1.0.0",
  description: "A basic CLI with tRPC integration using createCli",
  rpc: {
    router: appRouter,
    usage: ["basic-rpc-cli hello --name Alice", "basic-rpc-cli add --a 5 --b 3"],
  },
});
