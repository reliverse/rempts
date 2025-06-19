# RPC Integration in createCli

The `createCli` function supports tRPC/oRPC router integration, allowing you to automatically generate CLI commands from your tRPC procedures. This provides a seamless way to expose your RPC endpoints as command-line tools.

## Basic Usage

```typescript
import { z } from "zod";
import { initTRPC } from "@trpc/server";
import { createCli } from "@reliverse/rempts";

// Define your tRPC router
const t = initTRPC.create();

const appRouter = t.router({
  hello: t.procedure
    .input(z.object({ name: z.string().optional() }))
    .query(({ input }) => {
      return `Hello ${input.name ?? "World"}!`;
    }),
  
  add: t.procedure
    .input(z.object({ a: z.number(), b: z.number() }))
    .mutation(({ input }) => {
      return input.a + input.b;
    })
});

// Create CLI with RPC integration
await createCli({
  name: "my-cli",
  version: "1.0.0",
  description: "A CLI with tRPC integration",
  rpc: {
    router: appRouter,
    usage: [
      "my-cli hello --name Alice",
      "my-cli add --a 5 --b 3"
    ]
  }
});
```

## RPC Options

### `rpc` Object

The `rpc` object contains all RPC-specific configuration:

```typescript
rpc: {
  /** A tRPC router. Procedures will become CLI commands. */
  router: AnyRouter;
  
  /** Context to be supplied when invoking the router. */
  context?: any;
  
  /** The @trpc/server module to use for calling procedures. Required when using trpc v10. */
  trpcServer?: any | Promise<any>;
  
  /** Usage code examples to display in --help output. */
  usage?: string | string[];
  
  /** Dependencies for schema validation libraries */
  "@valibot/to-json-schema"?: {
    toJsonSchema: (input: unknown, options?: { errorMode?: "throw" | "ignore" | "warn" }) => any;
  };
  
  effect?: {
    Schema: { isSchema: (input: unknown) => input is "JSONSchemaMakeable" };
    JSONSchema: { make: (input: "JSONSchemaMakeable") => any };
  };
}
```

### `rpcRunParams` Object

The `rpcRunParams` object allows you to customize the RPC CLI execution:

```typescript
rpcRunParams: {
  /** Custom argv array (defaults to process.argv) */
  argv?: string[];
  
  /** Custom logger interface */
  logger?: {
    info?: (...args: unknown[]) => void;
    error?: (...args: unknown[]) => void;
  };
  
  /** Shell completion support */
  completion?: OmeletteInstanceLike | (() => Promise<OmeletteInstanceLike>);
  
  /** Interactive prompts support */
  prompts?: Promptable;
  
  /** Custom error formatter */
  formatError?: (error: unknown) => string;
  
  /** Custom process object */
  process?: {
    exit: (code: number) => never;
  };
}
```

## Advanced Examples

### Custom Context and Error Handling

```typescript
await createCli({
  name: "my-cli",
  rpc: {
    router: appRouter,
    context: { userId: "123", apiKey: "secret" }
  },
  rpcRunParams: {
    logger: {
      info: console.log,
      error: console.error
    },
    formatError: (error) => `Custom error: ${error}`
  }
});
```

### Mixed CLI with Traditional and RPC Commands

```typescript
await createCli({
  name: "mixed-cli",
  description: "A CLI with both traditional and RPC commands",
  
  // Traditional command
  run: async ({ args }) => {
    console.log("Traditional command executed with args:", args);
  },
  args: {
    message: {
      type: "string",
      description: "A message to display"
    }
  },
  
  // RPC functionality
  rpc: {
    router: appRouter
  }
});
```

### File-based Commands with RPC

```typescript
await createCli({
  name: "file-based-rpc-cli",
  fileBased: {
    enable: true,
    cmdsRootPath: "./app"
  },
  rpc: {
    router: appRouter
  }
});
```

## Procedure Metadata

You can enhance your CLI by adding metadata to your tRPC procedures:

```typescript
const appRouter = t.router({
  hello: t.procedure
    .input(z.object({ name: z.string().optional() }))
    .meta({
      description: "Greet someone by name",
      examples: ["hello --name Alice"],
      aliases: {
        command: ["hi", "greet"],
        options: { name: "n" }
      }
    })
    .query(({ input }) => {
      return `Hello ${input.name ?? "World"}!`;
    })
});
```

## Supported Features

- **Automatic CLI Generation**: tRPC procedures become CLI commands automatically
- **Nested Commands**: Sub-routers create nested command structures
- **Input Validation**: Zod schemas are converted to CLI argument validation
- **Help Generation**: Automatic help text from procedure metadata
- **Type Safety**: Full TypeScript support with proper type inference
- **Error Handling**: Comprehensive error handling and formatting
- **Interactive Prompts**: Support for interactive input when arguments are missing
- **Shell Completion**: Tab completion support via omelette
- **Custom Logging**: Configurable logging interface
- **Context Injection**: Custom context for procedure execution

## Migration from createRpcCli

If you were previously using `createRpcCli` directly, you can now use the integrated version:

```typescript
// Before
import { createRpcCli } from "@reliverse/rempts/trpc-orpc-support";
const cli = createRpcCli({ router: appRouter });
await cli.run();

// After
import { createCli } from "@reliverse/rempts";
await createCli({ rpc: { router: appRouter } });
```

The integrated version provides all the same functionality while also supporting traditional CLI commands, file-based commands, and other launcher features.
