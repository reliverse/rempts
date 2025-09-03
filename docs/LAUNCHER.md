## Launcher: How it works (step-by-step)

This document explains the launcher system that powers the CLI in this repo. It covers how commands are defined, how arguments are parsed, how subcommands are resolved (both programmatic and file-based), and how execution flows end-to-end.

### Quick glossary

- **Command**: A unit of work with metadata, arguments, and an optional `run` function.
- **Subcommand**: A command nested under another command (e.g., `cli dev`, `cli build`).
- **File-based commands**: Commands discovered from a directory structure (e.g., `app/foo/cmd.ts`).
- **Programmatic commands**: Commands declared in code via `commands` on a parent command.
- **Context**: `{ args, raw }` where `args` are typed and validated; `raw` is the original argv.

## 1) Define a command

You declare commands with `defineCommand()` from `src/libs/launcher/launcher-mod.ts`.

```ts
import { defineCommand, defineArgs } from "src/libs/launcher/launcher-mod";

export default defineCommand({
  meta: { name: "dev", description: "Start dev server" },
  args: defineArgs({
    port: { type: "number", description: "Port", default: 3000 },
    open: { type: "boolean", description: "Open browser" },
    target: { type: "positional", description: "Target folder", required: false },
  }),
  async run(ctx) {
    // ctx.args.port, ctx.args.open, ctx.args.target
  },
});
```

Notes:

- Allowed argument `type`s: `boolean`, `string`, `number`, `array`, `positional`.
- `positional` values come from leftover argv (non-flag tokens, in order).
- For `array`, values can be repeated or comma-separated: `--tags a --tags b` or `--tags a,b`.

## 2) Create and start the CLI

Use `createCli()` to boot the CLI. You can pass a single `Command` or an object that includes global metadata and options.

```ts
import { createCli, defineCommand } from "src/libs/launcher/launcher-mod";

await createCli({
  name: "mycli",
  version: "1.0.0",
  description: "Example CLI",
  mainCommand: defineCommand({
    meta: { name: "mycli" },
    // Optional: nested programmatic commands
    commands: {
      dev: () => import("./app/dev/cmd"),
      build: () => import("./app/build/cmd"),
    },
  }),
});
```

If you don’t provide `fileBased` or `commands`, the launcher enables file-based mode by default and scans `src/app` (or `app` if `src/app` does not exist).

## 3) Execution flow at a glance

1. Launcher initializes logging (`@reliverse/relinka`) on first use and reads package.json once.
2. If file-based mode isn’t configured and no programmatic commands are present, it auto-enables file-based discovery under `src/app` or `app`.
3. It reads `process.argv.slice(2)` as `rawArgv`.
4. If the first non-flag token looks like a subcommand:
   - In file-based mode, it resolves the subcommand directory tree and loads the nearest `cmd.ts`/`cmd.js`.
   - In programmatic mode, it matches by key or alias and dynamically imports the module.
5. It handles `help`/`--help`/`-h` and `--version`/`-v` early.
6. It parses arguments according to the command’s `args` definitions (see section 4).
7. It executes `command.run(ctx)` if present; otherwise, it acts as a dispatcher, showing usage when no runnable command is found.
8. On exit, it shuts down logging gracefully.

## 4) Argument parsing rules

Parsing is performed by `reliArgParser`, with extra processing in the launcher:

- Booleans default to `false` when not specified.
- Defaults from `args` definitions are merged into the parser’s defaults.
- `positional` keys are filled from leftover non-flag tokens in order.
- `array` accepts repeated flags or comma-separated values. Bracketed lists like `[a,b]` are also supported.
- `required: true` triggers an error (and usage output) if missing.
- `dependencies: ["foo", "bar"]` enforces that `--foo`/`--bar` are set when the option is provided.

The final context looks like:

```ts
type CommandContext<TArgs> = {
  args: TArgs;
  raw: string[]; // the original argv slice (after node + script)
}
```

## 5) Help, usage and version

The launcher renders usage text consistently for both programmatic and file-based commands:

- Global help: `cli help` or `cli --help` or `cli -h`.
- Subcommand help: `cli dev help` or `cli dev --help`.
- Version: `cli --version` or `cli -v`. Uses command meta or package.json values.

Usage output shows:

- CLI/version header
- Example invocation (randomly sampled subcommand)
- Available subcommands (grouped for file-based mode)
- Options derived from `args` definitions, with aligned columns

## 6) File-based commands: resolution algorithm

File-based mode expects a tree like `app/<group>/<cmd>/cmd.ts`. Resolution works as follows:

1. Start at the configured root (default `src/app` or `app`).
2. Walk through `argv` tokens until a flag is encountered.
3. For each non-flag token, if a matching child directory exists, descend into it.
4. At the final directory, attempt to load `cmd.ts` (then `cmd.js`).
5. Any leftover tokens are treated as that command’s argv.
6. If no command is found, the launcher suggests the closest match (Levenshtein) when possible.

Example:

```bash
app/
  dev/cmd.ts        → cli dev
  build/cmd.ts      → cli build
  nested/foo/cmd.ts → cli nested foo
```

## 7) Programmatic subcommands

Instead of file-based discovery, you can declare subcommands in code:

```ts
defineCommand({
  meta: { name: "root" },
  commands: {
    dev: () => import("../app/dev/cmd"),
    build: () => import("../app/build/cmd"),
  },
});
```

- Keys are the subcommand names.
- Values can be strings (module specifiers) or lazy import functions.
- Subcommand modules must export a default `defineCommand(...)` result.

## 8) Lifecycle hooks

There are two layers of lifecycle hooks:

- Launcher-level:
  - `onLauncherInit()` runs before any work; use for one-time setup.
  - `onLauncherExit()` runs once when the launcher finishes.

- Command-level:
  - `onCmdInit(ctx)` runs before a command (or subcommand) executes.
  - `onCmdExit(ctx)` runs after a command completes.

Note: For the main `run` (top-level command), `onCmdInit`/`onCmdExit` aren’t invoked (they are used for subcommand runs).

## 9) Programmatic invocation (without CLI argv)

`src/libs/launcher/command-runner.ts` provides `callCmd()` to run a command from code:

```ts
import { callCmd } from "src/libs/launcher/command-runner";

const ctx = await callCmd(myCommand, ["--open", "--port", "4000"], { debug: true });
// or
const ctx2 = await callCmd(myCommand, { open: true, port: 4000 });
```

It uses the same casting and validation logic as the launcher and supports:

- `autoExit`: exit on errors (default false).
- `debug`: minimal debug logging via `@reliverse/relinka`.
- `useLifecycleHooks`: whether to run `onCmdInit`/`onCmdExit`.

## 10) Debug logging

Pass `--debug` to print extra logs. The logger is lazily configured to keep overhead low. Internally we:

- Configure `relinka` on first debug call.
- Avoid awaiting logging operations on hot paths.

## 11) Performance notes

Recent micro-optimizations reduce filesystem overhead when resolving file-based commands:

- Cached `pathExists()` results within a single launcher run.
- A single `isDirectory()` helper instead of `pathExists + stat`.
- Package.json reads are cached in memory.

Argument parsing also minimizes redundant work by precomputing boolean keys and defaults once per parse.

## 12) Troubleshooting

- “Unknown command or arguments”: Check the directory layout or use `help` to inspect available commands.
- Array arguments: prefer `--tags a,b` or repeat flags; avoid quoting each element.
- Required options: the usage view shows which flags are required and any dependencies.
- Windows PowerShell: examples assume PowerShell; quoting rules may differ from other shells.

## 13) Where to look in the code

- `src/libs/launcher/launcher-mod.ts`
  - `defineCommand`, `createCli`, help/usage rendering, file-based and programmatic resolution, argument parsing.
- `src/libs/launcher/command-runner.ts`
  - `callCmd`, programmatic parsing and lifecycle handling.
