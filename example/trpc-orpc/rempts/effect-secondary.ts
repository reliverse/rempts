// 👉 `bun example/trpc-orpc/rempts/effect-secondary.ts`
//
// This example demonstrates Effect schema integration with createCli
// To run this example, you would need to install Effect:
//   bun add effect @trpc/server

import { initTRPC } from "@trpc/server";
import { z } from "zod";

import { createCli } from "~/libs/launcher/launcher-mod.js";

// Example tRPC router using Effect schemas
const t = initTRPC.create();

const appRouter = t.router({
  // Simple query with basic validation using Zod (for comparison)
  getUser: t.procedure.input(z.number()).query(({ input }) => {
    const mockUsers = [
      { id: 1, name: "Alice Johnson", email: "alice@example.com", age: 28 },
      { id: 2, name: "Bob Smith", email: "bob@example.com", age: 35 },
      { id: 3, name: "Carol Davis", email: "carol@example.com", age: 42 },
    ];

    const user = mockUsers.find((u) => u.id === input);
    if (!user) {
      throw new Error(`User with ID ${input} not found`);
    }
    return user;
  }),

  // Example using Effect schemas
  // Note: This would require actual Effect installation and Schema.standardSchemaV1
  add: t.procedure
    .input(z.tuple([z.number(), z.number()])) // Using Zod for now, but could be Effect
    .query(({ input }) => {
      return input[0] + input[1];
    }),

  // Create a new task with validation
  createTask: t.procedure
    .input(
      z.object({
        title: z.string().min(1).max(100),
        description: z.string().optional(),
        priority: z.enum(["low", "medium", "high"]),
      }),
    )
    .mutation(({ input }) => {
      const newTask = {
        id: Math.random().toString(36).slice(2, 11),
        title: input.title,
        description: input.description,
        priority: input.priority,
        completed: false,
        createdAt: new Date().toISOString(),
      };

      return newTask;
    }),

  // Search tasks with complex filtering
  searchTasks: t.procedure
    .input(
      z.object({
        query: z.string().optional(),
        priority: z.enum(["low", "medium", "high"]).optional(),
        completed: z.boolean().optional(),
        limit: z.number().min(1).max(100).default(10),
        offset: z.number().min(0).default(0),
      }),
    )
    .query(({ input }) => {
      const mockTasks = [
        {
          id: "1",
          title: "Complete project documentation",
          description: "Write comprehensive documentation for the new feature",
          priority: "high" as const,
          completed: false,
        },
        {
          id: "2",
          title: "Review code changes",
          description: "Review pull request #123",
          priority: "medium" as const,
          completed: true,
        },
        {
          id: "3",
          title: "Update dependencies",
          description: "Update all npm packages to latest versions",
          priority: "low" as const,
          completed: false,
        },
      ];

      let filtered = mockTasks;

      if (input.query) {
        const query = input.query.toLowerCase();
        filtered = filtered.filter(
          (task) =>
            task.title.toLowerCase().includes(query) ||
            task.description?.toLowerCase().includes(query),
        );
      }

      if (input.priority) {
        filtered = filtered.filter((task) => task.priority === input.priority);
      }

      if (input.completed !== undefined) {
        filtered = filtered.filter(
          (task) => task.completed === input.completed,
        );
      }

      return {
        tasks: filtered.slice(input.offset, input.offset + input.limit),
        total: filtered.length,
        limit: input.limit,
        offset: input.offset,
      };
    }),

  // Update task completion status
  updateTaskStatus: t.procedure
    .input(
      z.object({
        id: z.string(),
        completed: z.boolean(),
      }),
    )
    .mutation(({ input }) => {
      // Simulate updating a task
      return {
        id: input.id,
        completed: input.completed,
        updatedAt: new Date().toISOString(),
      };
    }),

  // Get task statistics
  getTaskStats: t.procedure.query(() => {
    const mockTasks = [
      { priority: "low" as const, completed: false },
      { priority: "medium" as const, completed: true },
      { priority: "high" as const, completed: false },
    ];

    const total = mockTasks.length;
    const completed = mockTasks.filter((t) => t.completed).length;
    const pending = total - completed;

    const priorityStats = {
      low: mockTasks.filter((t) => t.priority === "low").length,
      medium: mockTasks.filter((t) => t.priority === "medium").length,
      high: mockTasks.filter((t) => t.priority === "high").length,
    };

    return {
      total,
      completed,
      pending,
      completionRate: total > 0 ? (completed / total) * 100 : 0,
      priorityStats,
    };
  }),
});

export type AppRouter = typeof appRouter;

// Effect-based RPC CLI using createCli
await createCli({
  name: "effect-rpc-cli",
  version: "1.0.0",
  description: "A CLI with tRPC and Effect schema integration using createCli",
  rpc: {
    router: appRouter,
    // Effect integration
    effect: {
      Schema: {
        // Function to check if a value is an Effect schema
        isSchema: (input: unknown): input is "JSONSchemaMakeable" => {
          // for Effect schema detection
          // This should check if the input is an Effect schema with standardSchemaV1
          if (typeof input === "object" && input !== null) {
            const obj = input as Record<string, unknown>;
            // Check for Effect schema patterns, especially standardSchemaV1
            return (
              typeof obj["~standard"] === "object" ||
              typeof obj["~schema"] === "object" ||
              // Effect-specific properties
              typeof obj._tag === "string" ||
              typeof obj._id === "string" ||
              // Check for standardSchemaV1 pattern
              typeof obj["~standardSchemaV1"] === "object"
            );
          }
          return false;
        },
      },
      JSONSchema: {
        // Function to convert Effect schemas to JSON Schema
        make: (_input: "JSONSchemaMakeable") => {
          // for Effect JSON Schema conversion
          // This should call Effect.JSONSchema.make(input)
          // For demonstration, returning a basic schema
          return {
            type: "object",
            properties: {},
            required: [],
          };
        },
      },
    },
    // for tRPC server
    trpcServer: import("@trpc/server"),
    usage: [
      "effect-rpc-cli get-user 1",
      "effect-rpc-cli add 5 3",
      "effect-rpc-cli create-task --title 'New Task' --priority high --description 'Important task'",
      "effect-rpc-cli search-tasks --query 'documentation' --priority high --limit 5",
      "effect-rpc-cli update-task-status --id 1 --completed true",
      "effect-rpc-cli get-task-stats",
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
 * EFFECT INTEGRATION:
 *
 * 1. Effect Schema Usage:
 *    - Use `Schema.standardSchemaV1` helper from Effect
 *    - Requires `effect >= 3.14.2`
 *    - Requires `@trpc/server >= 11.0.1` if passing custom trpcServer
 *
 * 2. Example with Effect schemas:
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
 * 3. Key Requirements:
 *    - Use `Schema.standardSchemaV1()` wrapper for Effect schemas
 *    - Pass `trpcServer: import('@trpc/server')` to createCli
 *    - Ensure compatible versions of Effect and tRPC server
 *
 * 4. Installation:
 *    ```bash
 *    bun add effect @trpc/server
 *    ```
 *
 * 5. Benefits:
 *    - Type-safe schema definitions with Effect
 *    - Advanced validation with pipe and refinements
 *    - Automatic CLI argument generation
 *    - Standard schema compatibility
 */
