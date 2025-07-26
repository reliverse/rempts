# 📃 rempts • powerful js/ts cli builder

[sponsor](https://github.com/sponsors/blefnk) — [discord](https://discord.gg/Pb8uKbwpsJ) — [repo](https://github.com/reliverse/rempts) — [npm](https://npmjs.com/@reliverse/rempts)

> @reliverse/rempts is a modern, type-safe toolkit for building delightful cli experiences. it's fast, flexible, and made for developer happiness. file-based commands keep things simple—no clutter, just clean and easy workflows. this is how cli should feel.

## Features

- 😘 drop-in to libraries like `unjs/citty` and `@clack/prompts`
- 📝 includes comprehensive set of built-in cli prompts
- 📂 file-based commands (app-router style by default)
- 🫂 rempts keeps you from fighting with your CLI tool
- 🏎️ prompt engine that *feels* modern — and actually is
- ✨ rempts is your end-to-end CLI UI + command framework
- 🌿 multi-level file-based subcommands (sibling + nested)
- 💪 built for DX precision and high-context terminal UX
- 🎭 looks great in plain scripts or full CLI apps
- 🎨 customizable themes and styled output
- 📦 built-in output formatter and logger
- 🚨 crash-safe (Ctrl+C, SIGINT, errors)
- ⚡ blazing-fast, zero runtime baggage
- 🧩 router + argument parser built-in
- 🧠 type-safe from args to prompts
- 📐 smart layout for small terminals
- 🎛️ override styles via prompt options
- 🪄 minimal API surface, maximum expressiveness
- 🧪 scriptable for testing, stable for production
- 🏞️ no more hacking together `inquirer`/`citty`/`commander`/`chalk`
- 🆕 automatic command creation (`bun dler rempts --init cmd1 cmd2`)
- 🐦‍🔥 automatic creation of `src/app/cmds.ts` file (`bun dler rempts`)
- 🔌 tRPC/ORPC router integration - automatically generate CLI commands from your RPC procedures

## Installation

```bash
bun add @reliverse/rempts
```

## Usage Examples

- [Prompts](#prompts)
- [Launcher](#launcher)

## Screenshot

![Rempts Example CLI Screenshot](./example/example.png)

## API Overview

All main prompts APIs are available from the package root:

```ts
import {
  // ...prompts
  inputPrompt, selectPrompt, multiselectPrompt, numberPrompt,
  confirmPrompt, togglePrompt, taskSpinPrompt, taskProgressPrompt,
  startPrompt, endPrompt, resultPrompt, nextStepsPrompt,
  // ...hooks
  useSpinner,
  // ...launcher
  createCli, defineCommand, defineArgs,
  // ...types
  // ...more
} from "@reliverse/rempts";
```

> See [`src/mod.ts`](./src/mod.ts) for the full list of exports.

## Prompts

### Built-in Prompts

| Prompt                    | Description                                               |
|---------------------------|-----------------------------------------------------------|
| `useSpinner`              | Start/stop spinner |
| `inputPrompt`             | Single-line input (with mask support, e.g. for passwords) |
| `selectPrompt`            | Single-choice radio menu                                  |
| `multiselectPrompt`       | Multi-choice checkbox menu                                |
| `numberPrompt`            | Type-safe number input                                    |
| `confirmPrompt`           | Yes/No toggle                                             |
| `togglePrompt`            | Custom on/off toggles                                     |
| `taskProgressPrompt`      | Progress bar for async tasks                              |
| `resultPrompt`            | Show results in a styled box                              |
| `nextStepsPrompt`         | Show next steps in a styled list                          |
| `startPrompt`/`endPrompt` | Makes CLI start/end flows look nice                       |
| `taskSpinPrompt`       | Async loader with spinner (possibly will be deprecated)   |
| `datePrompt`              | Date input with format validation                         |
| `anykeyPrompt`            | Wait for any keypress                                     |

### Aliases

To help you migrate from the different CLI frameworks, `@reliverse/rempts` has some aliases for the most popular prompts.

| Prompt                | Aliases          |
|-----------------------|------------------|
| `createCli`           | `runMain`        |
| `onCmdInit`           | `setup`          |
| `onCmdExit`           | `cleanup`        |
| `useSpinner`          | `spinner`        |
| `selectPrompt`        | `select`         |
| `multiselectPrompt`   | `multiselect`    |
| `inputPrompt`         | `text`, `input`  |
| `confirmPrompt`       | `confirm`        |
| `introPrompt`         | `intro`, `start` |
| `outroPrompt`         | `outro`, `end`   |
| `log`                 | `relinka`        |

### Prompts Usage Example

```ts
import { relinka } from "@reliverse/relinka";

import {
  startPrompt,
  inputPrompt,
  selectPrompt,
  defineCommand,
  runMain
} from "@reliverse/rempts";

async function main() {
  await startPrompt({ title: "Project Setup" });

  const name = await inputPrompt({
    title: "What's your project name?",
    defaultValue: "my-cool-project",
  });

  const spinner = useSpinner({
    text: "Loading...",
    indicator: "timer", // or "dots"
    frames: ["◒", "◐", "◓", "◑"], // custom frames
    delay: 80, // custom delay
    onCancel: () => {
      console.log("Operation cancelled");
    },
    cancelMessage: "Operation cancelled by user",
    errorMessage: "Operation failed",
    signal: abortController.signal,
  }).start();

  // The spinner will show:
  // ◒  Loading... [5s]
  // With animated frames and timer

  const framework = await selectPrompt({
    title: "Pick your framework",
    options: [
      { value: "next", label: "Next.js" },
      { value: "svelte", label: "SvelteKit" },
      { value: "start", label: "TanStack Start" },
    ],
    defaultValue: "next",
  });

  console.log("Your result:", { name, framework });
};

await main();
```

**Available spinner options:**

| Option | Description |
|--------|-------------|
| `cancelMessage` | The message to display when the spinner is cancelled |
| `color` | The color of the spinner |
| `delay` | The delay between frames |
| `errorMessage` | The message to display when the spinner fails |
| `failText` | The text to display when the spinner fails |
| `frames` | The frames to use for the spinner |
| `hideCursor` | Whether to hide the cursor |
| `indicator` | The indicator to use for the spinner |
| `onCancel` | The function to call when the spinner is cancelled |
| `prefixText` | The text to display before the spinner |
| `signal` | The signal to use for the spinner |
| `silent` | Whether to hide the spinner |
| `spinner` | The spinner to use for the spinner |
| `successText` | The text to display when the spinner succeeds |
| `text` | The text to display next to the spinner |

**Available indicator options:**

| Option | Description |
|--------|-------------|
| `timer` | The timer indicator |
| `dots` | The dots indicator |

**Available signal options:**

| Option | Description |
|--------|-------------|
| `abortController.signal` | The signal to use for the spinner |

**Available frames options:**

| Option | Description |
|--------|-------------|
| `["◒", "◐", "◓", "◑"]` | The frames to use for the spinner |

**Available delay options:**

| Option | Description |
|--------|-------------|
| `80` | The delay between frames |

**Available onCancel options:**

| Option | Description |
|--------|-------------|
| `() => { console.log("Operation cancelled"); }` | The function to call when the spinner is cancelled |

## Launcher

> **Note**: `runMain` is now an alias for `createCli` and is still supported for backward compatibility. The new `createCli` API provides a more intuitive object-based configuration format.

### Automatic command creation

```bash
bun add -D @reliverse/dler
bun dler rempts --init cmd1 cmd2 # creates `src/app/cmd1/cmd.ts` and `src/app/cmd2/cmd.ts` files
bun dler rempts # creates `src/app/cmds.ts` file
```

### Terminology

- **Launcher/Router**: The main entry point for your CLI. Visit [CLI Launcher (Router)](#cli-launcher-router) section to learn more.
- **Command**: A command is a function that defines the inner script launched by the main script where runMain() is used or by some other command.
- **Argument**: An argument is a value that is passed to a command.
- **Flag**: A flag is a boolean argument that is used to enable or disable a feature.
- **Option**: An option is a named argument that is used to configure a command.

#### Launcher Usage Example

**Important**: Ensure your commands don't have `await main();`, `await createCli();`, or something like that — to prevent any unexpected behavior. Only main command should have it.

```ts
import { relinka } from "@reliverse/relinka";

import { defineCommand, createCli } from "@reliverse/rempts";

const main = defineCommand({
  meta: {
    name: "rempts",
    version: "1.0.0",
    description: "Rempts Launcher Playground CLI",
  },
  onCmdInit() {
    relinka("success", "Setup");
  },
  onCmdExit() {
    relinka("success", "Cleanup");
  },
  commands: {
    build: () => import("./app/build/cmd.js").then((r) => r.default),
    deploy: () => import("./app/deploy/cmd.js").then((r) => r.default),
    debug: () => import("./app/debug/cmd.js").then((r) => r.default),
  },
});

// New object format (recommended)
await createCli({
  mainCommand: main,
  fileBased: {
    enable: true,
    cmdsRootPath: "my-cmds", // default is `./app`
  },
  // Optionally disable auto-exit to handle errors manually:
  autoExit: false,
});

// Legacy format (still supported)
await createCli(main, {
  fileBased: {
    enable: true,
    cmdsRootPath: "my-cmds", // default is `./app`
  },
  // Optionally disable auto-exit to handle errors manually:
  autoExit: false,
});
```

This flexibility allows you to easily build a rich, multi-command CLI with minimal boilerplate. The launcher even supports nested commands, making it simple to construct complex CLI applications.

#### File-Based Commands

Drop a `./src/cli/app/add/index.ts` and it's live.

```ts
import { defineArgs, defineCommand } from "@reliverse/rempts";
export default defineCommand({
  meta: {
    name: "add",
    version: "1.0.0",
    description: "Add stuff to your project",
  },
  args: {
    name: defineArgs({ // 💡 PRO TIP: use defineArgs() to get fully correct intellisense
      type: "string",
      required: true,
      description: "Name of what to add",
    }),
  },
  async run({ args }) {
    relinka("log", "Adding:", args.name);
  },
});
```

**Supports**:

- `arg-cmdName.{ts,js}`,
- `cmdName/index.{ts,js}`,
- `cmdName/cmdName-mod.{ts,js}`,
- **Multi-level subcommands:** `foo/bar/baz/cmd.ts` → `my-cli foo bar baz`
- And more — with automatic usage output.

**Hint**:

- Install `bun add -D @reliverse/dler`
- Use `bun dler rempts --init cmd1 cmd2` to init commands for rempts launcher's automatically

### Advanced Launcher Usage

```ts
defineCommand({
  meta: { name: "cli", version: "1.0.0" },
  args: {
    name: { type: "string", required: true },
    verbose: { type: "boolean", default: false },
    animals: { type: "array", default: ["cat","dog"] },
  },
  async run({ args, raw }) { // or `async run(ctx)`
    relinka("log", args.name, args.verbose, args.animals); // or `relinka("log", ctx.args.name, ...);`
  },
});
```

**Supports**:

- `positional` args
- `array` types (`--tag foo --tag bar`)
- Default values, validations, descriptions
- Full help rendering from metadata

**By the way! Multi-level subcommands!**

You can also nest subcommands arbitrarily deep:

```bash
app/
  foo/
    bar/
      baz/
        cmd.ts
```

Invoke with:

```bash
my-cli foo bar baz --some-flag
```

The launcher will recursively traverse subfolders for each non-flag argument, loading the deepest `cmd.ts`/`cmd.js` it finds, and passing the remaining arguments to it.

See [example/launcher/app/nested](./example/launcher/app/nested/) and [example/launcher/app/sibling](./example/launcher/app/sibling/) folders to learn more.

When playing with the example, you can run e.g. `bun dev:modern nested foo bar baz` to see the result in action.

## RPC Integration

Rempts now supports seamless integration with tRPC and ORPC routers, allowing you to automatically generate CLI commands from your RPC procedures. This provides a powerful way to expose your API endpoints as command-line tools.

```typescript
import { z } from "zod";
import { initTRPC } from "@trpc/server";
import { createCli } from "@reliverse/rempts";

const t = initTRPC.create();

const appRouter = t.router({
  hello: t.procedure
    .input(z.object({ name: z.string().optional() }))
    .query(({ input }) => `Hello ${input.name ?? "World"}!`),
  
  add: t.procedure
    .input(z.object({ a: z.number(), b: z.number() }))
    .mutation(({ input }) => input.a + input.b)
});

// Automatically generates CLI commands from your tRPC procedures
await createCli({
  name: "my-cli",
  rpc: { router: appRouter }
});
```

**Features:**

- 🚀 Automatic CLI generation from tRPC procedures
- 🔄 Support for both tRPC v10 and v11
- 🏗️ Nested command structures from sub-routers
- ✅ Input validation from Zod schemas
- 📖 Automatic help generation from procedure metadata
- 🎯 Full TypeScript support with type inference
- 🎨 Interactive prompts for missing arguments
- ⌨️ Shell completion support
- 🔧 Customizable logging and error handling

See [RPC Integration Guide](./docs/launcher-rpc.md) for detailed documentation and examples.

### Playground

```bash
git clone https://github.com/reliverse/rempts
cd rempts
bun i
bun dev
```

- `bun dev:prompts`: This example will show you a `multiselectPrompt()` where you can choose which CLI prompts you want to play with.
- `bun dev:modern`: This example will show you a modern CLI launcher usage with file-based commands.
- `bun dev:classic`: This example will show you a classic CLI launcher usage with programmatic commands.

### tRPC/oRPC Integration Example Commands

```bash
bun example/trpc-orpc/rempts/effect-primary.ts create-profile --name 'Jane Smith' --age 28 --bio 'Software Engineer' --tags 'developer,typescript'
```

### Launcher Usage Examples

#### Minimal Usage Example

**1 Create a `src/mod.ts` file:**

```ts
import { createCli, defineCommand } from "@reliverse/rempts";

// New object format (recommended)
await createCli({
  mainCommand: defineCommand({}),
});

// Legacy format (still supported)
await createCli(defineCommand({}));
```

**2 Run the following:**

```bash
bun add -D @reliverse/dler
bun dler rempts --init my-cmd-1 # or: dler rempts --init my-cmd-1 my-cmd-2 --main src/mod.ts
# * `--main` is optional, default is `./src/mod.ts`
# * you can specify multiple commands at once
```

**3 Visit `src/app/my-cmd-1/mod.ts` and edit it:**

```ts
export default defineCommand({
  run() { console.log("Hello, world!"); },
});
```

**4. Test it:**

```bash
bun src/mod.ts
```

#### Medium Usage Example

```ts
import { defineCommand, createCli } from "@reliverse/rempts";

const main = defineCommand({
  meta: {
    name: "mycli",
  },
  run() {
    console.log("Happy, Reliversing!");
  },
});

// New object format (recommended)
await createCli({
  mainCommand: main,
});

// Legacy format (still supported)
await createCli(main);
```

#### Classic Usage Example

```ts
import { relinka } from "@reliverse/relinka";

import {
  startPrompt,
  inputPrompt,
  selectPrompt,
  defineCommand,
  createCli
} from "@reliverse/rempts";

const main = defineCommand({
  meta: {
    name: "mycli",
    version: "1.0.0",
    description: "CLI powered by Rempts",
  },
  args: {
    name: {
      type: "string",
      required: true,
      description: "The name of the project",
    },
  },
  async run({ args }) {
    await startPrompt({
      title: "Project Setup",
    });

    const name = await inputPrompt({
      title: "What's your project name?",
      placeholder: args.name,
    });

    const framework = await selectPrompt({
      title: "Pick your framework",
      options: [
        { value: "next", label: "Next.js" },
        { value: "svelte", label: "SvelteKit" },
        { value: "start", label: "TanStack Start" },
      ],
    });

    relinka("log", "You have selected:", { name, framework });
  },
});

// New object format (recommended)
await createCli({
  mainCommand: main,
});

// Legacy format (still supported)
await createCli(main);
```

#### Advanced Usage Example

```ts
import { relinka } from "@reliverse/relinka";

import {
  startPrompt,
  inputPrompt,
  selectPrompt,
  defineCommand,
  runMain,
} from "@reliverse/rempts";

/**
 * Main command defined using `defineCommand()`.
 *
 * This command demonstrates the full range of launcher features along with all supported argument types:
 *
 * - Global Usage Handling: Automatically processes `--help` and `--version`.
 * - File-Based Commands: Scans "app" for commands (e.g., `init`).
 * - Comprehensive Argument Parsing: Supports positional, boolean, string, number, and array arguments.
 * - Interactive Prompts: Uses built-in prompt functions for an engaging CLI experience.
 */
const mainCommand = defineCommand({
  meta: {
    name: "rempts",
    version: "1.6.0",
    description:
      "An example CLI that supports file-based commands and all argument types.",
  },
  args: {
    // Positional arguments
    inputFile: {
      type: "positional",
      description: "Path to the input file (only for the main command).",
    },
    config: {
      type: "positional",
      description: "Path to the configuration file.",
    },
    // Boolean arguments
    verbose: {
      type: "boolean",
      default: false,
      description: "Whether to print verbose logs in the main command.",
    },
    debug: {
      type: "boolean",
      default: false,
      description: "Enable debug mode for additional logging.",
    },
    // String argument
    name: {
      type: "string",
      description: "The name of the project.",
    },
    // Number argument
    timeout: {
      type: "number",
      default: 30,
      description: "Timeout in seconds for the CLI operation.",
    },
    // Array argument
    tags: {
      type: "array",
      default: ["cli", "rempts"],
      description: "List of tags associated with the project.",
    },
  },
  async run({ args, raw }) {
    // Display invocation details and parsed arguments.
    relinka("log", "Main command was invoked!");
    relinka("log", "Parsed main-command args:", args);
    relinka("log", "Raw argv:", raw);
    relinka("log", "\nHelp: `rempts --help`, `rempts cmdName --help`");

    // Begin interactive session with a prompt.
    await startPrompt({
      title: "Project Setup",
    });

    // Ask for the project name, falling back to provided argument or a default.
    const projectName = await inputPrompt({
      title: "What's your project name?",
      placeholder: args.name ?? "my-cool-cli",
    });

    // Let the user pick a framework from a select prompt.
    const framework = await selectPrompt({
      title: "Pick your framework",
      options: [
        { value: "next", label: "Next.js" },
        { value: "svelte", label: "SvelteKit" },
        { value: "start", label: "TanStack Start" },
      ],
    });

    // Log all gathered input details.
    relinka("log", "You have selected:", {
      projectName,
      framework,
      inputFile: args.inputFile,
      config: args.config,
      verbose: args.verbose,
      debug: args.debug,
      timeout: args.timeout,
      tags: args.tags,
    });
  },
});

/**
 * The `createCli()` function sets up the launcher with several advanced features:
 *
 * - File-Based Commands: Enables scanning for commands within the "app" directory.
 * - Alias Mapping: Shorthand flags (e.g., `-v`) are mapped to their full names (e.g., `--verbose`).
 * - Strict Mode & Unknown Flag Warnings: Unknown flags are either warned about or handled via a callback.
 * - Negated Boolean Support: Allows flags to be negated (e.g., `--no-verbose`).
 * - Custom Unknown Flag Handler: Provides custom handling for unrecognized flags.
 */
// New object format (recommended)
await createCli({
  mainCommand: mainCommand,
  fileBased: {
    enable: true, // Enables file-based command detection.
    cmdsRootPath: "app", // Directory to scan for commands.
  },
  alias: {
    v: "verbose", // Maps shorthand flag -v to --verbose.
  },
  strict: false, // Do not throw errors for unknown flags.
  warnOnUnknown: false, // Warn when encountering unknown flags.
  negatedBoolean: true, // Support for negated booleans (e.g., --no-verbose).
  // unknown: (flagName) => {
  //   relinka("warn", "Unknown flag encountered:", flagName);
  //   return false;
  // },
});

// Legacy format (still supported)
await createCli(mainCommand, {
  fileBased: {
    enable: true, // Enables file-based command detection.
    cmdsRootPath: "app", // Directory to scan for commands.
  },
  alias: {
    v: "verbose", // Maps shorthand flag -v to --verbose.
  },
  strict: false, // Do not throw errors for unknown flags.
  warnOnUnknown: false, // Warn when encountering unknown flags.
  negatedBoolean: true, // Support for negated booleans (e.g., --no-verbose).
  // unknown: (flagName) => {
  //   relinka("warn", "Unknown flag encountered:", flagName);
  //   return false;
  // },
});
```

### CLI Launcher (Router)

Finally, a full-featured CLI launcher without the ceremony. `@reliverse/rempts`'s so called "launcher" is a uniquely powerful and ergonomic CLI toolkit—one that helps you build delightful developer experiences with less code and more confidence. The launcher supports both programmatically defined commands and file-based routing, so you can structure your CLI however you like. It automatically detects and loads commands from your filesystem and provides robust usage and error handling out-of-the-box. The launcher is more than just a command runner—it's a robust, developer-friendly engine with several advanced features and thoughtful design choices:

- **File-Based & Defined Commands:**  
  Use `commands` in your command definition or let the launcher automatically load commands from a specified directory.

- **Automatic Command Detection:**  
  The launcher scans your specified `cmdsRootPath` for command files matching common patterns such as:
  - `arg-cmdName.{ts,js}`
  - `cmdName/index.{ts,js}`
  - `cmdName/cmdName-mod.{ts,js}`
  - And more — with automatic usage output if a command file is not found.

- **Built-In Flag Handling:**  
  Automatically processes global flags such as:
  - `--help` and `-h` to show usage details.
  - `--version` and `-v` to display version information.
  - `--debug` for verbose logging during development.

- **Unified Argument Parsing:**  
  Seamlessly combines positional and named arguments with zero configuration, auto-parsing booleans, strings, numbers, arrays, and even supporting negated flags like `--no-flag`.

- **Customizable Behavior:**  
  Options such as `fileBased.enable`, `cmdsRootPath`, and `autoExit` allow you to tailor the launcher's behavior. For example, you can choose whether the process should exit automatically on error or allow manual error handling.

- **Error Management & Usage Output:**  
  The launcher provides clear error messages for missing required arguments, invalid types, or command import issues, and it automatically displays usage information for your CLI.

- **Lifecycle Hooks:**
  You can define optional lifecycle hooks in your main command:
  - `onLauncherInit` and `onLauncherExit` (global, called once per CLI process)
  - `onCmdInit` and `onCmdExit` (per-command, called before/after each command, but NOT for the main `run()` handler)

  **Global Hooks:**
  - `onLauncherInit`: Called once, before any command/run() is executed.
  - `onLauncherExit`: Called once, after all command/run() logic is finished (even if an error occurs).

  **Per-Command Hooks:**
  - `onCmdInit`: Called before each command (not for main `run()`).
  - `onCmdExit`: Called after each command (not for main `run()`).

  This means:
  - If your CLI has multiple commands, `onCmdInit` and `onCmdExit` will be called for each command invocation, not just once for the whole CLI process.
  - If your main command has a `run()` handler (and no command is invoked), these hooks are **not** called; use the `run()` handler itself or the global hooks for such logic.
  - This allows you to perform setup/teardown logic specific to each command execution.
  - If you want logic to run only once for the entire CLI process, use `onLauncherInit` and `onLauncherExit`.

  **Example:**

  ```ts
  const main = defineCommand({
    onLauncherInit() { relinka('info', 'Global setup (once per process)'); },
    onLauncherExit() { relinka('info', 'Global cleanup (once per process)'); },
    onCmdInit() { relinka('info', 'Setup for each command'); },
    onCmdExit() { relinka('info', 'Cleanup for each command'); },
    commands: { ... },
    run() { relinka('info', 'Main run handler (no command)'); },
  });
  // onLauncherInit/onLauncherExit are called once per process
  // onCmdInit/onCmdExit are called for every command (not for main run())
  // If you want per-run() logic, use the run() handler or global hooks
  ```

- **Deprecation Notice**
  - The legacy `setup` and `cleanup` names are still supported as aliases for per-command hooks, but will be removed in a future major version. Prefer `onCmdInit` and `onCmdExit` going forward.
  - The `subCommands` property is deprecated as well. Please use `commands` instead. `subCommands` will be removed in a future major version.

- **Dynamic Usage Examples:**
  - The launcher inspects your available commands and their argument definitions, then prints a plausible example CLI invocation for a random command directly in the help output. This helps users understand real-world usage at a glance.

- **File-Based & Programmatic Commands:**
  - Both file-based and object commands are fully supported. The launcher can introspect their argument definitions and metadata for help, usage, and validation.
  - File-based commands are auto-discovered from your filesystem, while programmatic commands can be defined inline in your main command.

- **Context-Aware Help Output:**
  - The help/usage output adapts to your CLI's structure, showing available commands, their aliases, argument details, and even dynamic usage examples. It also displays global options and context-specific error messages.

- **Error Handling:**
  - The launcher provides clear, actionable error messages for missing required arguments, invalid types, unknown commands, and import errors. It always shows relevant usage information to help users recover quickly.

- **Unified Argument Parsing:**
  - All arguments (positional, named, boolean, string, number, array) are parsed and validated automatically. Negated flags (like `--no-flag`) are supported out of the box.

- **Extensible & Flexible:**
  - The launcher is highly extensible. You can use it with both Bun and Node.js, and it works seamlessly with both file-based and programmatic command definitions. You can also customize its behavior with options like `autoExit`, `cmdsRootPath`, and more.

- **Bun & Node.js Support:**
  - The launcher is designed to work in both Bun and Node.js environments, so you can use it in any modern JavaScript/TypeScript project.

- **Prompt-First, Modern UX:**
  - The launcher integrates tightly with the prompt engine, so you can build interactive, delightful CLIs with minimal effort.

### Launcher Programmatic Execution

For larger CLIs or when you want to programmatically run commands (e.g.: [prompt demo](./example/prompts/mod.ts), tests, etc), you can organize your commands in a `cmds.ts` file and use the `runCmd` utility. Example:

```ts
// example/launcher/app/runcmd/cmd.ts

import { relinka } from "@reliverse/relinka";
import { defineArgs, defineCommand, runCmd } from "@reliverse/rempts";
import { cmdMinimal } from "../cmds.js";

export default defineCommand({
  meta: {
    name: "runcmd",
    description:
      "Demonstrate how to use runCmd() to invoke another command programmatically.",
  },
  args: defineArgs({
    name: {
      type: "string",
      description: "your name",
    },
  }),
  async run({ args }) {
    // const username = args.name ?? "Alice";
    const username = args.name; // intentionally missing fallback
    relinka(
      "info",
      `Running the 'minimal' command using runCmd() with name='${username}'`,
    );
    await runCmd(await cmdMinimal(), ["--name", username]);
    relinka("log", "Done running 'minimal' via runCmd().");
  },
});
```

### Using `runCmd` with Flexible Argument Handling

The `runCmd` function supports flexible argument passing, automatically normalizing template literals and space-separated strings:

```ts
import { runCmd } from "@reliverse/rempts";

// Traditional way - each argument as separate array element
await runCmd(cmd, ["--dev", "true", "--name", "John"]);

// Template literals work automatically
await runCmd(cmd, [`--dev ${isDev}`]); // Automatically converted to ["--dev", "true"]
await runCmd(cmd, [`--dev ${isDev} --build mod.ts`]); // ["--dev", "true", "--build", "mod.ts"]

// Mixed arrays with template literals and regular strings
await runCmd(cmd, [
  `--dev ${isDev} --build mod.ts`,
  "--pub true",
  "--someBoolean",
]);

// Multiple template literals
await runCmd(cmd, [`--dev ${isDev}`, `--name ${userName}`, `--count ${count}`]);
```

**Remember**:

- If you need to pass a value with spaces (e.g. a name like "John Doe"), you should quote it in your template literal: `await runCmd(cmd, ['--name "John Doe"']);`
- Otherwise, it will be split into two arguments: `"John"` and `"Doe"`.
- We do not handle this intentionally, because some library users might rely on this Node.js behavior and handle it themselves in their own way (e.g. space can serve as a separator for values).

### Loading Commands with `loadCommand`

The `loadCommand` utility helps you load command files from your filesystem. It automatically handles:

- Relative paths (both `./build` and `build` work the same)
- Automatic detection of `cmd.{ts,js}` files
- Clear error messages when files are not found

```ts
import { loadCommand } from "@reliverse/rempts";

// These are equivalent:
const cmd1 = await loadCommand("./build");     // Looks for build/cmd.ts or build/cmd.js
const cmd2 = await loadCommand("build");       // Same as above
const cmd3 = await loadCommand("./build/cmd"); // Explicit path to cmd file

// You can then use the loaded command with runCmd:
await runCmd(cmd1, ["--some-flag"]);
```

```ts
// src/app/cmds.ts
export const getBuildCmd = async (): Promise<Command> => loadCommand("./build");

// src/cli.ts
import { runCmd } from "@reliverse/rempts";
import { getBuildCmd } from "./app/cmds";
await runCmd(await getBuildCmd(), ["--prod"]);
```

**Error Handling:**
If the command file is not found, you'll get a clear error message:

```bash
No command file found in /path/to/build. Expected to find either:
  - /path/to/build/cmd.ts
  - /path/to/build/cmd.js
Please ensure one of these files exists and exports a default command.
```

**Best Practices:**

- Use `loadCommand` when you need to load commands from the filesystem
- Use `runCmd` to execute the loaded command with arguments
- Keep your command files in a consistent location (e.g., `src/app/yourCmdName/cmd.ts`)
- Export commands from a central file like `src/app/cmds.ts` for better organization

```ts
// example/launcher/app/cmds.ts
import { loadCommand } from "@reliverse/rempts";

export async function getBuildCmd() {
  return loadCommand("./build");
}

export async function getDeployCmd() {
  return loadCommand("./deploy");
}

// Usage:
import { getBuildCmd } from "./cmds";
const buildCmd = await getBuildCmd();
await runCmd(buildCmd, ["--prod"]);
```

```ts
// example/launcher/app/minimal/cmd.ts

import { relinka } from "@reliverse/relinka";
import { defineArgs, defineCommand } from "@reliverse/rempts";

export default defineCommand({
  meta: {
    name: "minimal",
    description: "hello world",
  },
  args: defineArgs({
    name: {
      type: "string",
      description: "your name",
      required: true,
    },
  }),
  run({ args }) {
    relinka("success", `👋 Hello, ${args.name}!`);
  },
});
```

### Using `runCmdWithSubcommands` for Subcommands and Nested Subcommands

If you need to programmatically run commands that support subcommands (including nested subcommands), use `runCmdWithSubcommands`:

```ts
import { runCmdWithSubcommands } from "@reliverse/rempts";

// Single-level subcommand
await runCmdWithSubcommands(mainCmd, [`build --input src/mod.ts --someBoolean`]);

// Subcommand with positional arguments
await runCmdWithSubcommands(mainCmd, [`build src/mod.ts --someBoolean`]);

// Nested subcommands
await runCmdWithSubcommands(mainCmd, [`build someSubCmd src/mod.ts --no-cjs`]);
await runCmdWithSubcommands(mainCmd, [`build sub1 sub2 sub3 file.ts --flag`]);

// Mixed array with subcommands
await runCmdWithSubcommands(mainCmd, [
  `build someSubCmd src/mod.ts`,
  "--no-cjs",
  "--verbose"
]);
```

**Note:**

- `runCmdWithSubcommands` automatically normalizes template literals and space-separated strings, just like `runCmd`.
- If you need to pass a value with spaces (e.g. a name like "John Doe"), you should quote it in your template literal: `await runCmdWithSubcommands(cmd, ['--name "John Doe"']);`
- For subcommands, always use `runCmdWithSubcommands` for the most robust behavior.

## Argument Types: Usage Comparison

Below is a demonstration of how to define and use all supported argument types in rempts: positional, boolean, string, number, and array. This includes example CLI invocations and the resulting parsed output.

```ts
import { defineCommand, createCli } from "@reliverse/rempts";

const main = defineCommand({
  meta: {
    name: "mycli",
    version: "1.0.0",
    description: "Demo of all argument types",
  },
  args: {
    // Positional argument (required)
    input: {
      type: "positional",
      required: true,
      description: "Input file path",
    },
    // Boolean flag (default: false)
    verbose: {
      type: "boolean",
      default: false,
      description: "Enable verbose output",
    },
    // String option (optional)
    name: {
      type: "string",
      description: "Your name",
    },
    // Number option (optional, with default)
    count: {
      type: "number",
      default: 1,
      description: "How many times to run",
    },
    // Array option (can be repeated, accepts any value)
    tags: {
      type: "array",
      default: ["demo"],
      description: "Tags for this run (repeatable)",
    },
  },
  run({ args }) {
    console.log("Parsed args:", args);
  },
});

// New object format (recommended)
await createCli({
  mainCommand: main,
});

// Legacy format (still supported)
await createCli(main);
```

### Example CLI Invocations

#### 1. Positional argument

```bash
mycli input.txt
# → args.input = "input.txt"
```

#### 2. Boolean flag

```bash
mycli input.txt --verbose
# → args.verbose = true
mycli input.txt --no-verbose
# → args.verbose = false
```

#### 3. String option

```bash
mycli input.txt --name Alice
# → args.name = "Alice"
mycli input.txt
# → args.name = undefined
```

#### 4. Number option

```bash
mycli input.txt --count 5
# → args.count = 5
mycli input.txt
# → args.count = 1 (default)
```

#### 5. Array option (repeatable, accepts any value)

You can provide array values using any of the following syntaxes (mix and match as needed):

- Repeated flags:

  ```bash
  mycli input.txt --tags foo --tags bar --tags baz
  # → args.tags = ["foo", "bar", "baz"]
  ```

- Comma-separated values (with or without spaces):

  ```bash
  mycli input.txt --tags foo,bar,baz
  mycli input.txt --tags foo, bar, baz
  # → args.tags = ["foo", "bar", "baz"]
  ```

- Bracketed values (must be passed as a single argument!):

  ```bash
  mycli input.txt --tags "[foo,bar,baz]"
  # → args.tags = ["foo", "bar", "baz"]
  ```

- Mix and match:

  ```bash
  mycli input.txt --tags foo --tags "[bar,bar2,bar3]" --tags baz
  # → args.tags = ["foo", "bar", "bar2", "bar3", "baz"]
  ```

> **Important:**
>
> - **Quoted values (single or double quotes around elements) are NOT supported and will throw an error.**
>   - Example: `--tags 'foo'` or `--tags "[\"bar\",'baz']"` will throw an error.
> - **Bracketed or comma-separated lists must be passed as a single argument.**
>   - Example: `--tags "[foo,bar]"` (quotes around the whole value, not around elements)
>   - If you split a bracketed value across arguments, you will get a warning or incorrect parsing.
> - **Shells remove quotes before passing arguments to the CLI.** If you want to pass a value with commas or brackets, always quote the whole value.
> - **Troubleshooting:**
>   - If you see a warning about possible shell splitting, try quoting the whole value: `--tags "[a,b,c]"`
>   - If you see an error about quoted values, remove quotes around individual elements.

**Example error:**

```bash
$ bun example/launcher/modern.ts build --entry "[foo.ts," "bar.ts]"
✖   Don't use quotes around array elements.
✖   Also — don't use spaces — unless you wrap the whole array in quotes.
⚠   Array argument --entry: Detected possible shell splitting of bracketed value ('[foo.ts,').
⚠   If you intended to pass a bracketed list, quote the whole value like: --entry "[a, b, c]"
```

#### 7. All together

```bash
mycli input.txt --verbose --name Alice --count 3 --tags foo --tags bar
# → args = {
#     input: "input.txt",
#     verbose: true,
#     name: "Alice",
#     count: 3,
#     tags: ["foo", "bar"]
#   }
```

#### 8. Value Validation with `allowed`

All argument types support an optional `allowed` property that restricts which values can be passed:

```ts
const main = defineCommand({
  args: {
    // Only allow specific string values
    mode: {
      type: "string",
      allowed: ["development", "production", "test"],
      description: "The mode to run in"
    },
    
    // Only allow specific boolean values (e.g. if you only want true)
    force: {
      type: "boolean",
      allowed: [true],
      description: "Force the operation"
    },
    
    // Only allow specific numbers
    level: {
      type: "number",
      allowed: [1, 2, 3],
      description: "The level to use"
    },
    
    // Only allow specific values in an array
    tags: {
      type: "array",
      allowed: ["web", "api", "mobile"],
      description: "Tags to apply"
    },
    
    // Only allow specific positional values
    action: {
      type: "positional",
      allowed: ["build", "serve", "test"],
      description: "The action to perform"
    }
  }
});
```

If someone tries to pass a value that's not in the `allowed` list, they'll get a helpful error message:

```bash
mycli --mode staging
# Error: Invalid value for --mode: staging. Allowed values are: development, production, test

mycli --level 4
# Error: Invalid value for --level: 4. Allowed values are: 1, 2, 3

mycli --tags desktop
# Error: Invalid value in array --tags: desktop. Allowed values are: web, api, mobile
```

The validation happens after type casting, so for example with numbers, the input will first be converted to a number and then checked against the allowed list.

## Typed Commands System

The typed commands system provides TypeScript intellisense and type safety for rempts launcher usage while maintaining dynamic code execution.

- 🎯 **TypeScript Intellisense**: Full autocomplete for command names and arguments
- 🔒 **Type Safety**: Compile-time checking for argument types and required fields
- ⚡ **Dynamic Execution**: Commands are still loaded and executed dynamically
- 📝 **Automatic Sync**: Utility script to keep types in sync with actual command definitions

### Usage

#### Basic Usage

```typescript
import { callCmd } from "~/app/cmds";

// Simple command with typed arguments
await callCmd("pub", { dev: true });

// Command with multiple arguments
await callCmd("check", {
  directory: "src",
  checks: "missing-deps,file-extensions",
  strict: true,
  json: false
});

// Command with no arguments
await callCmd("update");

// Generators with typed arguments
await callCmd("rempts", {
  init: "new-cmd another-cmd",
  overwrite: true,
  outFile: "src/app/cmds.ts"
});
```

#### Advanced Usage

```typescript
import { getTypedCmd } from "~/app/cmds";

// Get command instance for more control
const { command, run } = await getTypedCmd("magic");

console.log(`Running: ${command.meta.name}`);
console.log(`Description: ${command.meta.description}`);

await run({
  targets: ["dist-npm", "dist-jsr"],
  concurrency: 4,
  stopOnError: true
});
```

#### TypeScript Benefits

##### 1. Command Name Autocomplete

When you type `callCmd("`, TypeScript will show all available commands.

##### 2. Argument Intellisense

When you type the arguments object, you get full autocomplete for:

- Argument names
- Argument types
- Required vs optional fields

##### 3. Type Validation

```typescript
// ✅ Correct usage
await callCmd("create", {
  mode: "files",    // Only "template" | "files" allowed
  multiple: true    // boolean
});

// ❌ TypeScript errors
await callCmd("create", {
  mode: "invalid",  // Error: not assignable to type
  multiple: "yes"   // Error: string not assignable to boolean
});
```

##### 4. Required Field Checking

```typescript
// ✅ Required field provided
await callCmd("magic", {
  targets: ["dist-npm"]  // Required field
});

// ❌ TypeScript error: missing required field 'targets'
await callCmd("magic", {
  concurrency: 4
});
```

### Maintaining the System

#### Adding New Commands

1. Create your command in `src/app/<command-name>/cmd.ts` using `defineCommand` and `defineArgs`
2. Run the generator: `dler rempts --overwrite`
3. The `CommandArgsMap` interface in `src/app/cmds.ts` will be automatically updated

#### Manual Updates

The `CommandArgsMap` interface is auto-generated. If you need custom types, you can add manual type assertions (it is more recommended to edit your command file instead and regenerate the types):

```typescript
interface CommandArgsMap {
  myCommand: {
    // Use union types for specific values
    mode: "development" | "production";
    
    // Use template literal types for patterns
    version: `${number}.${number}.${number}`;
    
    // Use branded types for validation
    port: number & { __brand: "Port" };
  };
}
```

### Migration from Old System

#### Before (Old System, still supported)

```typescript
import { runCmd } from "@reliverse/rempts";
import { getPubCmd } from "./app/cmds";

// No type safety, string-based arguments
await runCmd(await getPubCmd(), [`--dev=${isDev}`]);
```

### After (New System)

```typescript
import { callCmd } from "./app/cmds";

// Full type safety and intellisense
await callCmd("pub", { dev: isDev });
```

### Implementation Details

The system works by:

1. **Command Loading**: Commands are still loaded dynamically using `loadCommand()`
2. **Argument Conversion**: Typed arguments are converted to string array format that `runCmd` expects
3. **Type Mapping**: `CommandArgsMap` interface maps command names to their argument types
4. **Generic Types**: `callCmd<T extends keyof CommandArgsMap>` provides type safety

### Generator Usage

The typed command system also supports calling generators with full intellisense:

#### Creating New Commands

```typescript
// Create new commands with typed arguments
await callCmd("rempts", {
  init: "auth login logout",           // Commands to create
  overwrite: true,                     // Overwrite existing
  outFile: "src/app/cmds.ts"          // Export file path
});

// Create commands in custom location
await callCmd("rempts", {
  init: "api-handler",
  customCmdsRoot: "src/modules/api",
  outFile: "src/modules/api/exports.ts",
  overwrite: true
});
```

#### Regenerating Exports

```typescript
// Regenerate exports file only
await callCmd("rempts", {
  overwrite: true,
  outFile: "src/app/cmds.ts"
});

// Generate exports for specific directories
await callCmd("rempts", {
  cmdDirs: ["build", "pub", "magic"],
  outFile: "src/app/core-cmds.ts",
  overwrite: true
});
```

#### Batch Operations

```typescript
// Create multiple commands programmatically
const modules = ["auth", "db", "api", "deploy"];

for (const module of modules) {
  await callCmd("rempts", {
    init: `${module}-create ${module}-update ${module}-delete`,
    customCmdsRoot: `src/modules/${module}`,
    outFile: `src/modules/${module}/cmds.ts`,
    overwrite: true
  });
}
```

## Contributing

Bug report? Prompt idea? Want to build the best DX possible?

You're in the right place! Please help us make the best CLI toolkit possible.

### Notices For Contributors

**TypeScript Support**:

All APIs are fully typed. See [`src/types.ts`](./src/types.ts) for advanced customization and type inference.

**Examples**:

- **Classic CLI:** [`example/launcher/classic.ts`](./example/launcher/classic.ts)
- **Modern Minimal CLI:** [`example/launcher/modern.ts`](./example/launcher/modern.ts)
- **Full Prompt Demo:** [`example/prompts/mod.ts`](./example/prompts/mod.ts)

**Components and Utilities**:

- **components/**: All prompt UIs, CLI output, launcher logic, etc.
- **utils/**: Color, error, validation, streaming, and system helpers.
- **hooks/**: Useful hooks for prompt state and effects.

### Helpful Links

- [CLI application with the Node.js Readline module](https://dev.to/camptocamp-geo/cli-application-with-the-nodejs-readline-module-48ic)

## TODO

- [ ] migrate to `dler libs` in the future (all main components will be published as separate packages; `@reliverse/rempts` will be a wrapper for all of them)
- [ ] migrate all tests to `bun:test`

## Related

- [`@reliverse/cli`](https://npmjs.com/package/@reliverse/cli) – CLI-first toolkit for fullstack workflows
- [`@reliverse/reliarg`](https://npmjs.com/package/@reliverse/reliarg) – Tiny, strict, zero-dep argument parser with value validation support (`allowed` property for restricting argument values)
- [`@reliverse/reglob`](https://npmjs.com/package/@reliverse/reglob) – Fast, minimal file matcher
- [`@reliverse/relinka`](https://npmjs.com/package/@reliverse/relinka) – Styled CLI logs, steps, and symbols

## Shoutouts

- [citty](https://github.com/unjs/citty#readme) - launcher design inspiration

## Support

Bug report? Prompt idea? Want to build the best DX possible?

You're in the right place:

- ✨ [Star the repo](https://github.com/reliverse/rempts)
- 💬 [Join the Discord](https://discord.gg/3GawfWfAPe)
- ❤️ [Sponsor @blefnk](https://github.com/sponsors/blefnk)

> *No classes. No magic. Just clean, composable tools for CLI devs.*

## License

💖 MIT (see [LICENSE](./LICENSE) and [LICENCES](./LICENSES)) © [blefnk (Nazar Kornienko)](https://github.com/blefnk)
