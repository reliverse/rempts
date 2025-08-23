// 👉 `bun example/trpc-orpc/rempts/effect.ts`

import { initTRPC } from "@trpc/server";
import { z } from "zod";

import { createCli } from "~/libs/launcher/launcher-mod";

// Example tRPC router demonstrating Effect integration
const t = initTRPC.create();

const appRouter = t.router({
  // Simple query with basic validation
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
        filtered = filtered.filter((task) => task.completed === input.completed);
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
// This demonstrates how to integrate Effect schemas with tRPC CLI
await createCli({
  name: "effect-rpc-cli",
  version: "1.0.0",
  description: "A CLI with tRPC and Effect schema integration using createCli",
  rpc: {
    router: appRouter,
    // Effect integration - this allows the CLI to understand Effect schemas
    // when they are used in tRPC procedures
    effect: {
      Schema: {
        // Function to check if a value is an Effect schema
        isSchema: (input: unknown): input is "JSONSchemaMakeable" => {
          // This would typically check if the input is an Effect schema
          // For this example, we're showing the interface
          return false; // Placeholder - would check Effect.isSchema(input)
        },
      },
      JSONSchema: {
        // Function to convert Effect schemas to JSON Schema
        make: (_input: "JSONSchemaMakeable") => {
          // This would typically call Effect.JSONSchema.make(input)
          // For this example, we're showing the interface
          return {} as any; // Placeholder - would return Effect.JSONSchema.make(input)
        },
      },
    },
    usage: [
      "effect-rpc-cli get-user 1",
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
