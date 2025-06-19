// 👉 `bun example/trpc-orpc/rempts/effect-primary.ts`
//
// To run this example, you would need to install Effect:
//   bun add effect @trpc/server

import { initTRPC } from "@trpc/server";
import * as Effect from "effect";
import { Schema, pipe } from "effect";

import { createCli } from "~/libs/launcher/launcher-mod.js";

const t = initTRPC.create();

const appRouter = t.router({
  add: t.procedure
    .input(Schema.standardSchemaV1(Schema.Tuple(Schema.Number, Schema.Number)))
    .query(({ input }) => {
      return input[0] + input[1];
    }),

  // Example with object input using Schema.Struct
  createUser: t.procedure
    .input(
      Schema.standardSchemaV1(
        Schema.Struct({
          name: Schema.String,
          age: Schema.Number,
          email: Schema.String,
        }),
      ),
    )
    .mutation(({ input }) => {
      return {
        id: Math.random().toString(36).slice(2, 11),
        name: input.name,
        age: input.age,
        email: input.email,
        createdAt: new Date().toISOString(),
      };
    }),

  // Example with enum validation using Schema.Literal
  setStatus: t.procedure
    .input(
      Schema.standardSchemaV1(
        Schema.Struct({
          id: Schema.String,
          status: Schema.Literal("active", "inactive", "pending"),
        }),
      ),
    )
    .mutation(({ input }) => {
      return {
        id: input.id,
        status: input.status,
        updatedAt: new Date().toISOString(),
      };
    }),

  // Example with complex validation using pipe
  validateAge: t.procedure
    .input(
      Schema.standardSchemaV1(
        pipe(
          Schema.Number,
          Schema.greaterThan(0),
          Schema.lessThanOrEqualTo(120),
        ),
      ),
    )
    .query(({ input }) => {
      if (input < 18) {
        return { valid: false, reason: "Too young" };
      }
      if (input > 65) {
        return { valid: false, reason: "Too old" };
      }
      return { valid: true, reason: "Age is acceptable" };
    }),

  // Example with optional fields using Schema.optional
  createProfile: t.procedure
    .input(
      Schema.standardSchemaV1(
        Schema.Struct({
          name: Schema.String,
          age: Schema.optional(Schema.Number),
          bio: Schema.optional(Schema.String),
          tags: Schema.optional(Schema.Array(Schema.String)),
        }),
      ),
    )
    .mutation(({ input }) => {
      return {
        id: Math.random().toString(36).slice(2, 11),
        name: input.name,
        age: input.age ?? 0,
        bio: input.bio ?? "",
        tags: input.tags ?? [],
        createdAt: new Date().toISOString(),
      };
    }),
});

export type AppRouter = typeof appRouter;

// Effect example
await createCli({
  name: "effect-primary-cli",
  version: "1.0.0",
  description: "A CLI with tRPC and Effect schema integration",
  rpc: {
    router: appRouter,
    // Effect integration
    effect: {
      Schema: {
        // Function to check if a value is an Effect schema
        isSchema: (input: unknown): input is "JSONSchemaMakeable" => {
          // Use the actual Effect.isSchema function
          return Schema.isSchema(input);
        },
      },
      JSONSchema: {
        // Function to convert Effect schemas to JSON Schema
        make: (input: "JSONSchemaMakeable") => {
          return Effect.JSONSchema.make(input as any);
        },
      },
    },
    trpcServer: import("@trpc/server"),
    usage: [
      "effect-primary-cli add 5 3",
      "effect-primary-cli create-user --name 'John Doe' --age 30 --email 'john@example.com'",
      "effect-primary-cli set-status --id 'user123' --status active",
      "effect-primary-cli validate-age 25",
      "effect-primary-cli create-profile --name 'Jane Smith' --age 28 --bio 'Software Engineer' --tags 'developer,typescript'",
    ],
  },
  rpcRunParams: {
    formatError: (error) => {
      if (error instanceof Error) {
        return `Error: ${error.message}`;
      }
      return `Unknown error: ${String(error)}`;
    },
  },
});

/*
 * EFFECT INTEGRATION PATTERN:
 *
 * KEY REQUIREMENTS:
 *
 * 1. Effect Schema Usage:
 *    - Use `Schema.standardSchemaV1` helper from Effect
 *    - Requires `effect >= 3.14.2`
 *    - Requires `@trpc/server >= 11.0.1` if passing custom trpcServer
 *
 * 2. Official Example Pattern:
 *    ```ts
 *    import {Schema} from 'effect'
 *    import {type TrpcCliMeta} from '@reliverse/rempts'
 *
 *    const t = initTRPC.meta<TrpcCliMeta>().create()
 *
 *    const router = t.router({
 *      add: t.procedure
 *        .input(Schema.standardSchemaV1(Schema.Tuple(Schema.Number, Schema.Number)))
 *        .query(({input}) => input.left + input.right),
 *    })
 *
 *    const cli = createCli({router, trpcServer: import('@trpc/server')})
 *    cli.run() // e.g. `mycli add 1 2`
 *    ```
 *
 * 3. Critical Setup Requirements:
 *    - MUST use `Schema.standardSchemaV1()` wrapper for Effect schemas
 *    - MUST pass `trpcServer: import('@trpc/server')` to createCli
 *    - MUST ensure compatible versions: Effect >= 3.14.2, @trpc/server >= 11.0.1
 *
 * 4. Installation Commands:
 *    ```bash
 *    bun add effect @trpc/server
 *    ```
 *
 * 5. Real Effect Schema Examples Used:
 *    ```ts
 *    // Tuple input (positional arguments)
 *    .input(Schema.standardSchemaV1(Schema.Tuple(Schema.Number, Schema.Number)))
 *
 *    // Object input (options)
 *    .input(Schema.standardSchemaV1(Schema.Struct({
 *      name: Schema.String,
 *      age: Schema.Number,
 *      email: Schema.String
 *    })))
 *
 *    // Enum input
 *    .input(Schema.standardSchemaV1(Schema.Literal("active", "inactive")))
 *
 *    // Complex validation with pipe
 *    .input(Schema.standardSchemaV1(pipe(
 *      Schema.Number,
 *      Schema.greaterThan(0),
 *      Schema.lessThanOrEqualTo(120)
 *    )))
 *
 *    // Optional fields
 *    .input(Schema.standardSchemaV1(Schema.Struct({
 *      name: Schema.String,
 *      age: Schema.optional(Schema.Number),
 *      bio: Schema.optional(Schema.String)
 *    })))
 *    ```
 *
 * 6. Benefits of Official Pattern:
 *    - Full type safety with Effect schemas
 *    - Advanced validation with pipe and refinements
 *    - Automatic CLI argument generation
 *    - Standard schema compatibility
 *    - Better error messages and validation
 */
