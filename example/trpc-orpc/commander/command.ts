// Run with this custom router
// bun example/trpc-orpc/commander/main.ts my-router.ts

// Or specify the export
// bun example/trpc-orpc/commander/main.ts my-router.ts --export myRouter

// # Use the procedures
// rempts greet --name "Bob"
// rempts calculate --operation add --a 10 --b 5

import { initTRPC } from "@trpc/server";
import { z } from "zod";

const t = initTRPC.create();

const myRouter = t.router({
  greet: t.procedure
    .input(z.object({ name: z.string().optional() }))
    .query(({ input }) => `Hello ${input.name ?? "World"}!`),

  calculate: t.procedure
    .input(
      z.object({
        operation: z.enum(["add", "subtract", "multiply"]),
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
      }
    }),
});

export { myRouter };
