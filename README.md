# rempts • powerful js/ts cli builder

> @reliverse/rempts is a modern, type-safe toolkit for building delightful cli experiences. it's fast, flexible, and made for developer happiness. file-based commands keep things simple—no clutter, just clean and easy workflows. this is how cli should feel.

[💬 Discord](https://discord.gg/3GawfWfAPe) — [📦 NPM](https://npmjs.com/package/@reliverse/rempts) — [🧠 Docs](https://docs.reliverse.org/reliverse/rempts) — [🌐 JSR](https://jsr.io/@reliverse/rempts) — [✨ GitHub](https://github.com/reliverse/rempts)

## Stop Fighting Your CLI

- CLIs are still the sharpest tool in the builder's belt. But most libraries are either clunky or crusty.
- **@reliverse/rempts** is your end-to-end CLI UI + command framework — made for developer experience, DX precision, and high-context terminal UX.
- No more hacking together `inquirer`, `citty`, `commander`, `chalk`, and other friends.

## What Makes It Different?

- 📂 File-based commands (optional)
- 🧠 Type-safe from args to prompts
- 🎨 Customizable themes, styled output
- 🧩 Router + argument parser built-in
- ⚡ Blazing-fast, no runtime baggage
- 🪄 Minimal API surface, max expressiveness
- 🏎️ Prompt engine that *feels* modern, actually is
- 🧪 Scriptable for testing, stable for production
- 🚨 Crash-safe (Ctrl+C, SIGINT, errors)
- 🆕 Automatic commands creation via `rempts init --cmd my-cool-cmd`

## Screenshot

![Rempts Example CLI Screenshot](./example.png)

## Terminology

- **Command/Subcommand**: A command is a function that defines the behavior of a CLI.
- **Argument**: An argument is a value that is passed to a command.
- **Flag**: A flag is a boolean argument that is used to enable or disable a feature.
- **Option**: An option is a named argument that is used to configure a command.

## CLI Launcher (Router)

Finally, a full-featured CLI launcher without the ceremony. `@reliverse/rempts`'s so called "launcher" is a uniquely powerful and ergonomic CLI toolkit—one that helps you build delightful developer experiences with less code and more confidence. The launcher supports both programmatically defined subcommands and file-based routing, so you can structure your CLI however you like. It automatically detects and loads subcommands from your filesystem and provides robust usage and error handling out-of-the-box. The launcher is more than just a command runner—it's a robust, developer-friendly engine with several advanced features and thoughtful design choices:

- **File-Based & Defined Subcommands:**  
  Use `subCommands` in your command definition or let the launcher automatically load commands from a specified directory.

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
  Options such as `fileBasedCmds.enable`, `cmdsRootPath`, and `autoExit` allow you to tailor the launcher's behavior. For example, you can choose whether the process should exit automatically on error or allow manual error handling.

- **Error Management & Usage Output:**  
  The launcher provides clear error messages for missing required arguments, invalid types, or command import issues, and it automatically displays usage information for your CLI.

- **Lifecycle Hooks:**
  - You can define optional `setup` and `cleanup` functions in your main command. These hooks are called automatically before and after any command or subcommand runs (including file-based and programmatic subcommands). This is perfect for initializing resources or cleaning up after execution.

- **Dynamic Usage Examples:**
  - The launcher inspects your available subcommands and their argument definitions, then prints a plausible example CLI invocation for a random subcommand directly in the help output. This helps users understand real-world usage at a glance.

- **File-Based & Programmatic Subcommands:**
  - Both file-based and object subcommands are fully supported. The launcher can introspect their argument definitions and metadata for help, usage, and validation.
  - File-based subcommands are auto-discovered from your filesystem, while programmatic subcommands can be defined inline in your main command.

- **Context-Aware Help Output:**
  - The help/usage output adapts to your CLI's structure, showing available subcommands, their aliases, argument details, and even dynamic usage examples. It also displays global options and context-specific error messages.

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

### Launcher Usage Example

‼️ Go to [Usage Examples](#usage-examples) section for a more detailed example.

```ts
import { relinka } from "@reliverse/relinka";

import { defineCommand, runMain } from "~/mod.js";

const main = defineCommand({
  meta: {
    name: "rempts",
    version: "1.0.0",
    description: "Rempts Launcher Playground CLI",
  },
  setup() {
    relinka("success", "Setup");
  },
  cleanup() {
    relinka("success", "Cleanup");
  },
  subCommands: {
    build: () => import("./app/build/cmd.js").then((r) => r.default),
    deploy: () => import("./app/deploy/cmd.js").then((r) => r.default),
    debug: () => import("./app/debug/cmd.js").then((r) => r.default),
  },
});

await runMain(main);
```

```ts
await runMain(myCommand, {
  fileBasedCmds: {
    enable: true,
    cmdsRootPath: "./cli/args", // default is `./app`
  },
  // Optionally disable auto-exit to handle errors manually:
  autoExit: false,
});
```

This flexibility allows you to easily build a rich, multi-command CLI with minimal boilerplate. The launcher even supports nested subcommands, making it simple to construct complex CLI applications.

### File-Based Subcommands

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
    relinka("info", "Adding:", args.name);
  },
});
```

**Supports**:

- `arg-cmdName.{ts,js}`,
- `cmdName/index.{ts,js}`,
- `cmdName/cmdName-mod.{ts,js}`,
- And more — with automatic usage output.

**Hint**:

- Install `bun i -g @reliverse/rempts-cli`
- Use `rempts init --cmd my-cmd-1 my-cmd-2` to init commands automatically

## 📦 Built-In Prompts

- 🧠 `inputPrompt` – Single-line, password, masked
- ✅ `selectPrompt` – Radio menu
- 🧰 `multiselectPrompt` – Checkbox menu
- 🔢 `numberPrompt` – Type-safe number input
- 🔄 `confirmPrompt` – Yes/No toggle
- 🚥 `togglePrompt` – Custom on/off toggles
- ⏳ `spinnerPrompt` – Async loaders with status
- 📜 `logPrompt` – Styled logs / steps
- 🧼 `clearPrompt` – Clears console with style

## 🧱 Minimal, Functional API

```ts
defineCommand({
  meta: { name: "cli", version: "1.0.0" },
  args: {
    name: { type: "string", required: true },
    verbose: { type: "boolean", default: false },
    animals: { type: "array", options: ["cat","dog"] },
  },
  async run({ args, raw }) { // or `async run(ctx)`
    relinka("info", args.name, args.verbose, args.animals); // or `relinka("info", ctx.args.name, ...);`
  },
});
```

**Supports**:

- `positional` args
- `array` types (`--tag foo --tag bar`)
- Default values, validations, descriptions
- Full help rendering from metadata

## Theming + Customization

- Built-in output formatter and logger
- Override styles via prompt options
- Smart layout for small terminals
- Looks great in plain scripts or full CLI apps

## Playground

```bash
bun i -g @reliverse/rempts-cli
rempts examples # supported options: name
```

OR:

```bash
git clone https://github.com/reliverse/rempts
cd rempts
bun i
bun dev # supported options: name
```

- Both `rempts examples` from @reliverse/rempts and `bun dev` (which is the same thing) are themselves examples of `launcher` functionality.
- This launcher will show you a `multiselectPrompt()` where you can choose which CLI prompts you want to play with.

## Usage Examples

### Minimal Usage Example

**1 Create a `src/mod.ts` file:**

```ts
import { runMain, defineCommand } from "@reliverse/rempts";

await runMain(defineCommand({}));
```

**2 Run the following:**

```bash
bun add -D @reliverse/dler # or: bun i -g @reliverse/dler
bun dler init --cmd my-cmd-1 # or: dler init my-cmd-1 my-cmd-2 --main src/mod.ts
# * `--main` is optional, default is `./src/mod.ts`
# * you can specify multiple commands at once
```

**3 Visit `src/app/my-cmd-1/mod.ts` and edit it:**

```ts
export default defineCommand({
  run() { console.log("Hello, world!"); },
});
```

### Medium Usage Example

```ts
import { defineCommand, runMain } from "@reliverse/rempts";

const main = defineCommand({
  meta: {
    name: "mycli",
  },
  run() {
    console.log("Happy, Reliversing!");
  },
});

await runMain(main);
```

### Classic Usage Example

```ts
import { relinka } from "@reliverse/relinka";

import {
  startPrompt,
  inputPrompt,
  selectPrompt,
  defineCommand,
  runMain
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
      title: "🚀 Project Setup",
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

    relinka("info", "You have selected:", { name, framework });
  },
});

await runMain(main);
```

### Advanced Usage Example

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
 * - File-Based Subcommands: Scans "app" for subcommands (e.g., `init`).
 * - Comprehensive Argument Parsing: Supports positional, boolean, string, number, and array arguments.
 * - Interactive Prompts: Uses built-in prompt functions for an engaging CLI experience.
 */
const mainCommand = defineCommand({
  meta: {
    name: "rempts",
    version: "1.6.0",
    description:
      "An example CLI that supports file-based subcommands and all argument types.",
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
    relinka("info", "Main command was invoked!");
    relinka("info", "Parsed main-command args:", args);
    relinka("info", "Raw argv:", raw);
    relinka("info", "\nHelp: `rempts --help`, `rempts cmdName --help`");

    // Begin interactive session with a prompt.
    await startPrompt({
      title: "🚀 Project Setup",
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
    relinka("info", "You have selected:", {
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
 * The `runMain()` function sets up the launcher with several advanced features:
 *
 * - File-Based Subcommands: Enables scanning for subcommands within the "app" directory.
 * - Alias Mapping: Shorthand flags (e.g., `-v`) are mapped to their full names (e.g., `--verbose`).
 * - Strict Mode & Unknown Flag Warnings: Unknown flags are either warned about or handled via a callback.
 * - Negated Boolean Support: Allows flags to be negated (e.g., `--no-verbose`).
 * - Custom Unknown Flag Handler: Provides custom handling for unrecognized flags.
 */
await runMain(mainCommand, {
  fileBasedCmds: {
    enable: true, // Enables file-based subcommand detection.
    cmdsRootPath: "app", // Directory to scan for subcommands.
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

## Contributing

Bug report? Prompt idea? Want to build the best DX possible?

You're in the right place:

- ✨ [Star the repo](https://github.com/reliverse/rempts)
- 💬 [Join the Discord](https://discord.gg/3GawfWfAPe)
- ❤️ [Sponsor @blefnk](https://github.com/sponsors/blefnk)

> *No classes. No magic. Just clean, composable tools for CLI devs.*

### Helpful Links

- [CLI application with the Node.js Readline module](https://dev.to/camptocamp-geo/cli-application-with-the-nodejs-readline-module-48ic)

## Related

- [`@reliverse/cli`](https://npmjs.com/package/@reliverse/cli) – CLI-first toolkit for fullstack workflows
- [`@reliverse/reliarg`](https://npmjs.com/package/@reliverse/reliarg) – Tiny, strict, zero-dep argument parser
- [`@reliverse/reglob`](https://npmjs.com/package/@reliverse/reglob) – Fast, minimal file matcher
- [`@reliverse/relinka`](https://npmjs.com/package/@reliverse/relinka) – Styled CLI logs, steps, and symbols

## Shoutouts

- [citty](https://github.com/unjs/citty#readme) - launcher design inspiration

## License

💖 MIT © [blefnk (Nazar Kornienko)](https://github.com/blefnk)
