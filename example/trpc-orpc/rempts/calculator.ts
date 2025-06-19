// 👉 `bun example/trpc-orpc/rempts/calculator.ts`

import { initTRPC } from "@trpc/server";
import { z } from "zod";

import { createCli } from "~/libs/launcher/launcher-mod.js";

// Example tRPC router for a calculator CLI
const t = initTRPC.create();

const appRouter = t.router({
  add: t.procedure
    .input(z.tuple([z.number(), z.number()]))
    .query(({ input }) => input[0] + input[1]),

  subtract: t.procedure
    .input(z.tuple([z.number(), z.number()]))
    .query(({ input }) => input[0] - input[1]),

  multiply: t.procedure
    .input(z.tuple([z.number(), z.number()]))
    .query(({ input }) => input[0] * input[1]),

  divide: t.procedure
    .input(
      z.tuple([
        z.number(),
        z.number().refine((n) => n !== 0, "Cannot divide by zero"),
      ]),
    )
    .query(({ input }) => input[0] / input[1]),

  power: t.procedure
    .input(z.tuple([z.number(), z.number()]))
    .query(({ input }) => input[0] ** input[1]),

  sqrt: t.procedure
    .input(
      z
        .number()
        .refine((n) => n >= 0, "Cannot take square root of negative number"),
    )
    .query(({ input }) => Math.sqrt(input)),

  factorial: t.procedure
    .input(z.number().int().min(0).max(20))
    .query(({ input }) => {
      if (input === 0 || input === 1) return 1;
      let result = 1;
      for (let i = 2; i <= input; i++) {
        result *= i;
      }
      return result;
    }),

  // Complex operations
  solve: t.procedure
    .input(
      z.object({
        operation: z.enum(["quadratic", "linear"]),
        coefficients: z.array(z.number()),
      }),
    )
    .query(({ input }) => {
      if (input.operation === "linear" && input.coefficients.length === 2) {
        const a = input.coefficients[0]!;
        const b = input.coefficients[1]!;
        if (a === 0) throw new Error("Not a linear equation (a cannot be 0)");
        return { x: -b / a };
      }

      if (input.operation === "quadratic" && input.coefficients.length === 3) {
        const a = input.coefficients[0]!;
        const b = input.coefficients[1]!;
        const c = input.coefficients[2]!;
        if (a === 0)
          throw new Error("Not a quadratic equation (a cannot be 0)");

        const discriminant = b * b - 4 * a * c;
        if (discriminant < 0) {
          return {
            type: "complex",
            x1: `${-b / (2 * a)} + ${Math.sqrt(-discriminant) / (2 * a)}i`,
            x2: `${-b / (2 * a)} - ${Math.sqrt(-discriminant) / (2 * a)}i`,
          };
        }

        const x1 = (-b + Math.sqrt(discriminant)) / (2 * a);
        const x2 = (-b - Math.sqrt(discriminant)) / (2 * a);
        return { x1, x2 };
      }

      throw new Error("Invalid operation or number of coefficients");
    }),
});

export type AppRouter = typeof appRouter;

// Calculator CLI using createCli
await createCli({
  name: "calculator",
  version: "1.0.0",
  description: "A calculator CLI with tRPC integration using createCli",
  rpc: {
    router: appRouter,
    usage: [
      "calculator add 5 3",
      "calculator multiply 4 7",
      "calculator divide 10 2",
      "calculator power 2 8",
      "calculator sqrt 16",
      "calculator factorial 5",
      "calculator solve --operation linear --coefficients 2 -6",
      "calculator solve --operation quadratic --coefficients 1 -5 6",
    ],
  },
});
