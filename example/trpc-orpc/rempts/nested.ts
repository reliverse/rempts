// 👉 `bun example/trpc-orpc/rempts/nested.ts`

import { initTRPC } from "@trpc/server";
import { z } from "zod";

import { createCli } from "~/libs/launcher/launcher-mod.js";

// Example tRPC router with nested procedures
const t = initTRPC.create();

const appRouter = t.router({
  user: t.router({
    create: t.procedure
      .input(
        z.object({
          name: z.string(),
          email: z.string().email(),
          age: z.number().min(18),
        }),
      )
      .mutation(({ input }) => {
        return { id: 1, ...input };
      }),

    get: t.procedure.input(z.object({ id: z.number() })).query(({ input }) => {
      return { id: input.id, name: "John Doe", email: "john@example.com" };
    }),

    update: t.procedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          email: z.string().email().optional(),
        }),
      )
      .mutation(({ input }) => {
        return { ...input, updated: true };
      }),
  }),

  post: t.router({
    create: t.procedure
      .input(
        z.object({
          title: z.string(),
          content: z.string(),
          authorId: z.number(),
        }),
      )
      .mutation(({ input }) => {
        return { id: 1, ...input, createdAt: new Date().toISOString() };
      }),

    list: t.procedure
      .input(
        z.object({
          limit: z.number().default(10),
          offset: z.number().default(0),
        }),
      )
      .query(({ input }) => {
        return Array.from({ length: input.limit }, (_, i) => ({
          id: i + 1,
          title: `Post ${i + 1}`,
          content: `Content for post ${i + 1}`,
          authorId: 1,
        }));
      }),
  }),
});

export type AppRouter = typeof appRouter;

// Nested RPC CLI using createCli
await createCli({
  name: "nested-rpc-cli",
  version: "1.0.0",
  description: "A CLI with nested tRPC procedures using createCli",
  rpc: {
    router: appRouter,
    usage: [
      "nested-rpc-cli user create --name John --email john@example.com --age 25",
      "nested-rpc-cli user get --id 1",
      "nested-rpc-cli user update --id 1 --name Jane",
      "nested-rpc-cli post create --title 'Hello World' --content 'My first post' --author-id 1",
      "nested-rpc-cli post list --limit 5",
    ],
  },
});
