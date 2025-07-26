// 👉 `bun example/trpc-orpc/rempts/advanced.ts`

import { initTRPC } from "@trpc/server";
import { z } from "zod";

import { createCli } from "~/libs/launcher/launcher-mod.js";

// Example tRPC router with context and middleware
const t = initTRPC
  .context<{
    userId: string;
    isAdmin: boolean;
    timestamp: Date;
  }>()
  .create();

// Context type
interface Context {
  userId: string;
  isAdmin: boolean;
  timestamp: Date;
}

// Middleware to add context
const createContext = (): Context => ({
  userId: "user-123",
  isAdmin: false,
  timestamp: new Date(),
});

const appRouter = t.router({
  // Simple query with context
  profile: t.procedure.query(({ ctx }) => {
    return {
      userId: ctx.userId,
      isAdmin: ctx.isAdmin,
      lastAccessed: ctx.timestamp,
    };
  }),

  // Mutation with complex input validation
  createTask: t.procedure
    .input(
      z.object({
        title: z.string().min(1).max(100),
        description: z.string().optional(),
        priority: z.enum(["low", "medium", "high"]).default("medium"),
        dueDate: z.iso.datetime().optional(),
        tags: z.array(z.string()).default([]),
      }),
    )
    .mutation(({ input, ctx }) => {
      return {
        id: Math.random().toString(36).slice(2, 11),
        ...input,
        createdBy: ctx.userId,
        createdAt: ctx.timestamp.toISOString(),
        status: "pending",
      };
    }),

  // Query with optional parameters and defaults
  searchTasks: t.procedure
    .input(
      z.object({
        query: z.string().optional(),
        status: z.enum(["pending", "in-progress", "completed"]).optional(),
        priority: z.enum(["low", "medium", "high"]).optional(),
        limit: z.number().min(1).max(100).default(10),
        offset: z.number().min(0).default(0),
      }),
    )
    .query(({ input, ctx }) => {
      // Simulate database search
      const mockTasks = [
        {
          id: "1",
          title: "Complete project documentation",
          description: "Write comprehensive docs",
          priority: "high" as const,
          status: "pending" as const,
          createdBy: ctx.userId,
        },
        {
          id: "2",
          title: "Review code changes",
          description: "Code review for PR #123",
          priority: "medium" as const,
          status: "in-progress" as const,
          createdBy: ctx.userId,
        },
      ];

      let filtered = mockTasks;

      if (input.query) {
        filtered = filtered.filter(
          (task) =>
            task.title.toLowerCase().includes(input.query!.toLowerCase()) ||
            task.description
              ?.toLowerCase()
              .includes(input.query!.toLowerCase()),
        );
      }

      if (input.status) {
        filtered = filtered.filter((task) => task.status === input.status);
      }

      if (input.priority) {
        filtered = filtered.filter((task) => task.priority === input.priority);
      }

      return {
        tasks: filtered.slice(input.offset, input.offset + input.limit),
        total: filtered.length,
        limit: input.limit,
        offset: input.offset,
      };
    }),

  // Admin-only procedure
  adminStats: t.procedure.query(({ ctx }) => {
    if (!ctx.isAdmin) {
      throw new Error("Admin access required");
    }
    return {
      totalUsers: 150,
      activeTasks: 45,
      systemUptime: "99.9%",
      lastBackup: new Date().toISOString(),
    };
  }),
});

export type AppRouter = typeof appRouter;

// Advanced RPC CLI using createCli with custom context and error handling
await createCli({
  name: "advanced-rpc-cli",
  version: "1.0.0",
  description: "An advanced CLI with tRPC integration using createCli",
  rpc: {
    router: appRouter,
    context: createContext(),
    usage: [
      "advanced-rpc-cli profile",
      "advanced-rpc-cli create-task --title 'New Task' --priority high --description 'Important task'",
      "advanced-rpc-cli search-tasks --query 'documentation' --limit 5",
      "advanced-rpc-cli admin-stats",
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
