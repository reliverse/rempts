# tRPC/oRPC CLI Examples using `createCli`

This directory contains examples of using `createCli` with RPC functionality instead of directly calling `createRpcCli()`. These examples demonstrate how to integrate tRPC routers into CLI applications using the unified `createCli` API.

## Examples Overview

### 1. Basic Example (`basic.ts`)

A simple example showing basic tRPC procedures with `createCli`.

```bash
bun example/trpc-orpc/rempts/basic.ts hello --name Alice
bun example/trpc-orpc/rempts/basic.ts add --a 5 --b 3
```

**Features:**

- Simple query and mutation procedures
- Basic input validation with Zod
- Usage examples in help output

### 2. Nested Router Example (`nested.ts`)

Demonstrates nested tRPC router structures with `createCli`.

```bash
bun example/trpc-orpc/rempts/nested.ts user create --name John --email john@example.com --age 25
bun example/trpc-orpc/rempts/nested.ts user get --id 1
bun example/trpc-orpc/rempts/nested.ts post create --title "Hello World" --content "My first post" --author-id 1
bun example/trpc-orpc/rempts/nested.ts post list --limit 5
```

**Features:**

- Nested router structures (`user.*`, `post.*`)
- Complex input schemas with validation
- Default values and optional parameters

### 3. Mixed CLI Example (`mixed.ts`)

Shows how to combine traditional CLI commands with RPC functionality.

```bash
bun example/trpc-orpc/rempts/mixed.ts --message "Hello from traditional command"
bun example/trpc-orpc/rempts/mixed.ts calculate --operation add --a 5 --b 3
bun example/trpc-orpc/rempts/mixed.ts greet --name Alice
```

**Features:**

- Traditional CLI commands with `run()` handler
- RPC procedures alongside traditional commands
- Mixed argument parsing

### 4. Advanced Example (`advanced.ts`)

Demonstrates advanced features like context, error handling, and complex validation.

```bash
bun example/trpc-orpc/rempts/advanced.ts profile
bun example/trpc-orpc/rempts/advanced.ts create-task --title "New Task" --priority high --description "Important task"
bun example/trpc-orpc/rempts/advanced.ts search-tasks --query "documentation" --limit 5
bun example/trpc-orpc/rempts/advanced.ts admin-stats
```

**Features:**

- Custom context with user information
- Complex input validation with enums and arrays
- Custom error formatting
- Admin-only procedures with access control

### 5. Calculator Example (`calculator.ts`)

A comprehensive calculator CLI with various mathematical operations.

```bash
bun example/trpc-orpc/rempts/calculator.ts add 5 3
bun example/trpc-orpc/rempts/calculator.ts multiply 4 7
bun example/trpc-orpc/rempts/calculator.ts divide 10 2
bun example/trpc-orpc/rempts/calculator.ts power 2 8
bun example/trpc-orpc/rempts/calculator.ts sqrt 16
bun example/trpc-orpc/rempts/calculator.ts factorial 5
bun example/trpc-orpc/rempts/calculator.ts solve --operation linear --coefficients 2 -6
bun example/trpc-orpc/rempts/calculator.ts solve --operation quadratic --coefficients 1 -5 6
```

**Features:**

- Tuple inputs for simple operations
- Complex mathematical operations
- Input validation with custom error messages
- Equation solving capabilities

### 6. Effect Schema Example (`effect.ts`)

Demonstrates integration with Effect library schemas for advanced validation and type safety.

```bash
bun example/trpc-orpc/rempts/effect.ts get-user 1
bun example/trpc-orpc/rempts/effect.ts create-task --title "New Task" --priority high --description "Important task"
bun example/trpc-orpc/rempts/effect.ts search-tasks --query "documentation" --priority high --limit 5
bun example/trpc-orpc/rempts/effect.ts update-task-status --id 1 --completed true
bun example/trpc-orpc/rempts/effect.ts get-task-stats
```

**Features:**

- Effect library schema integration
- Advanced validation with pipe and refinements
- Type-safe schema definitions
- Automatic CLI argument generation
- Custom error formatting

### 7. Real Effect Integration Example (`effect-secondary.ts`)

A comprehensive example showing how to properly integrate Effect schemas with tRPC CLI, including detailed implementation notes.

```bash
# bun add effect @trpc/server

bun example/trpc-orpc/rempts/effect-secondary.ts get-user 1
bun example/trpc-orpc/rempts/effect-secondary.ts create-task --title "New Task" --priority high
bun example/trpc-orpc/rempts/effect-secondary.ts search-tasks --query "documentation" --limit 5
bun example/trpc-orpc/rempts/effect-secondary.ts update-task-status --id 1 --completed true
bun example/trpc-orpc/rempts/effect-secondary.ts get-task-stats
```

**Features:**

- Complete Effect integration example
- Proper schema detection and conversion
- Detailed implementation notes
- Real-world usage patterns
- Installation and setup instructions

### 8. Official Effect Integration Example (`effect-primary.ts`)

Demonstrates Effect integration, by showing the use of `Schema.standardSchemaV1` and required setup.

```bash
# First install Effect and tRPC server (required for official pattern):
# bun add @effect/schema @effect/data
# bun add @trpc/server@^11.0.1

bun example/trpc-orpc/rempts/effect-primary.ts add 5 3
bun example/trpc-orpc/rempts/effect-primary.ts create-user --name "John Doe" --age 30 --email "john@example.com"
bun example/trpc-orpc/rempts/effect-primary.ts set-status --id "user123" --status active
bun example/trpc-orpc/rempts/effect-primary.ts validate-age 25
```

**Features:**

- Uses `Schema.standardSchemaV1` pattern
- Demonstrates proper tRPC server integration
- Shows critical setup requirements
- Includes real Effect schema examples
- Official pattern compliance

## Key Differences from Direct `createRpcCli()`

### Using `createCli` with RPC

```typescript
await createCli({
  name: "my-cli",
  version: "1.0.0",
  description: "My CLI with RPC",
  rpc: {
    router: myRouter,
    usage: ["my-cli command --arg value"],
  },
});
```

### Direct `createRpcCli()`

```typescript
const cli = createRpcCli({ router: myRouter });
await cli.run({ argv: process.argv.slice(2) });
```

## Benefits of Using `createCli` with RPC

1. **Unified API**: Same function for both traditional and RPC CLIs
2. **Automatic tsx Support**: Automatically loads TypeScript support when RPC is used
3. **Better Integration**: Seamless integration with other CLI features
4. **Consistent Error Handling**: Unified error handling across all CLI types
5. **Future-Proof**: Easier to migrate between CLI types as needed

## Running the Examples

All examples can be run directly with bun:

```bash
# Basic example
bun example/trpc-orpc/rempts/basic.ts

# Nested router example
bun example/trpc-orpc/rempts/nested.ts

# Mixed CLI example
bun example/trpc-orpc/rempts/mixed.ts

# Advanced example
bun example/trpc-orpc/rempts/advanced.ts

# Calculator example
bun example/trpc-orpc/rempts/calculator.ts

# Effect schema example
bun example/trpc-orpc/rempts/effect.ts

# Primary effect integration example
bun example/trpc-orpc/rempts/effect-primary.ts

# Secondary effect integration example
bun example/trpc-orpc/rempts/effect-secondary.ts
```

## TypeScript Support

All examples automatically include TypeScript support through tsx when available. The `createCli`
