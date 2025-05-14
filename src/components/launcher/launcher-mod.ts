import type { ReliArgParserOptions } from "@reliverse/reliarg";

import { reliArgParser } from "@reliverse/reliarg";
import { relinka, relinkaConfig, relinkaShutdown } from "@reliverse/relinka";
import fs from "fs-extra";
import process from "node:process";
import path from "pathe";
import { readPackageJSON } from "pkg-types";

// -------------------------
//   Type Definitions
// -------------------------

// Helper type for compile-time validation error
type InvalidDefaultError<O extends readonly string[]> = {
  __error__: "Default value(s) must be a subset of options";
  options: O;
};

type EmptyArgs = Record<string, never>;

type BaseArgProps = {
  description?: string;
  required?: boolean;
};

type PositionalArgDefinition = {
  type: "positional";
  default?: string;
} & BaseArgProps;

type BooleanArgDefinition = {
  type: "boolean";
  default?: boolean;
} & BaseArgProps;

type StringArgDefinition = {
  type: "string";
  default?: string;
} & BaseArgProps;

type NumberArgDefinition = {
  type: "number";
  default?: number;
} & BaseArgProps;

type ArrayArgDefinition = {
  type: "array";
  default?: string | readonly string[];
  options: readonly string[];
} & BaseArgProps;

export type ArgDefinition =
  | PositionalArgDefinition
  | BooleanArgDefinition
  | StringArgDefinition
  | NumberArgDefinition
  | ArrayArgDefinition;

export type ArgDefinitions = Record<string, ArgDefinition>;

type CommandMeta = {
  name: string;
  version?: string;
  description?: string;
  hidden?: boolean;
  aliases?: string[];
};

/**
 * A subcommand can be either:
 * 1) A string path to a module with a default export of type Command.
 * 2) A lazy import function returning a Promise that resolves to
 *    { default: Command<any> } or directly to a Command instance.
 */
type CommandSpec =
  | string
  | (() => Promise<{ default: Command<any> } | Command<any>>);

export type CommandsMap = Record<string, CommandSpec>;

type CommandContext<ARGS> = {
  args: ARGS;
  raw: string[];
};

type CommandRun<ARGS> = (ctx: CommandContext<ARGS>) => void | Promise<void>;

type DefineCommandOptions<A extends ArgDefinitions = EmptyArgs> = {
  meta?: CommandMeta;
  args?: A;
  run?: CommandRun<InferArgTypes<A>>;
  /**
   * Object subcommands for this command.
   */
  commands?: CommandsMap;
  /**
   * @deprecated Use `commands` instead. Will be removed in a future major version.
   */
  subCommands?: CommandsMap;
  /**
   * Called before the command runs
   */
  onCmdStart?: () => void | Promise<void>;
  /**
   * Called after the command finishes
   */
  onCmdEnd?: () => void | Promise<void>;
  /**
   * @deprecated Use onCmdStart instead
   */
  setup?: () => void | Promise<void>;
  /**
   * @deprecated Use onCmdEnd instead
   */
  cleanup?: () => void | Promise<void>;
  /**
   * Called once per CLI process, before any command/run() is executed
   */
  onLauncherStart?: () => void | Promise<void>;
  /**
   * Called once per CLI process, after all command/run() logic is finished
   */
  onLauncherEnd?: () => void | Promise<void>;
};

export type Command<A extends ArgDefinitions = EmptyArgs> = {
  meta?: CommandMeta;
  args: A;
  run?: CommandRun<InferArgTypes<A>>;
  /**
   * Object subcommands for this command.
   */
  commands?: CommandsMap;
  /**
   * @deprecated Use `commands` instead. Will be removed in a future major version.
   */
  subCommands?: CommandsMap;
  /**
   * Called before the command runs
   */
  onCmdStart?: () => void | Promise<void>;
  /**
   * Called after the command finishes
   */
  onCmdEnd?: () => void | Promise<void>;
  /**
   * @deprecated Use onCmdStart instead
   */
  setup?: () => void | Promise<void>;
  /**
   * @deprecated Use onCmdEnd instead
   */
  cleanup?: () => void | Promise<void>;
  /**
   * Called once per CLI process, before any command/run() is executed
   */
  onLauncherStart?: () => void | Promise<void>;
  /**
   * Called once per CLI process, after all command/run() logic is finished
   */
  onLauncherEnd?: () => void | Promise<void>;
};

export type InferArgTypes<A extends ArgDefinitions> = {
  [K in keyof A]: A[K] extends PositionalArgDefinition
    ? string
    : A[K] extends BooleanArgDefinition
      ? boolean
      : A[K] extends StringArgDefinition
        ? string
        : A[K] extends NumberArgDefinition
          ? number
          : A[K] extends {
                type: "array";
                options: infer O extends readonly string[];
              }
            ? O[number][]
            : never;
};

// Helper mapped type to validate defaults for array args
// (restored after accidental removal)
type ValidateArrayDefaults<A extends ArgDefinitions> = {
  [K in keyof A]: A[K] extends {
    type: "array";
    options: infer O extends readonly string[];
    default?: infer D;
  }
    ? D extends undefined // If default is not provided, it's fine
      ? A[K]
      : D extends O[number] // If default is a single string, check if it's in options
        ? A[K]
        : D extends readonly (infer E)[] // If default is an array
          ? E extends O[number] // Check if ALL elements E are in O
            ? A[K]
            : Omit<A[K], "default"> & { default: InvalidDefaultError<O> } // Error: Not all elements are valid
          : Omit<A[K], "default"> & { default: InvalidDefaultError<O> } // Error: Default is neither undefined, single valid, nor array of valid
    : A[K]; // Keep other arg types as they are
};

// Helper to build a plausible example CLI argument string from ArgDefinitions
function buildExampleArgs(args: ArgDefinitions): string {
  const parts: string[] = [];
  // Positional args in order
  const positionalKeys = Object.keys(args).filter(
    (k) => args[k].type === "positional",
  );
  positionalKeys.forEach((key) => {
    const def = args[key];
    if (def.required || Math.random() > 0.5) {
      // Use default if available, else placeholder
      parts.push(String(def.default ?? `<${key}>`));
    }
  });
  // Non-positional args: include required and a few random optionals
  const otherKeys = Object.keys(args).filter(
    (k) => args[k].type !== "positional",
  );
  for (const key of otherKeys) {
    const def = args[key];
    if (def.required || Math.random() > 0.7) {
      switch (def.type) {
        case "boolean":
          if (def.default === true) {
            if (Math.random() > 0.5) parts.push(`--no-${key}`);
          } else {
            parts.push(`--${key}`);
          }
          break;
        case "string":
          parts.push(`--${key}=${String(def.default ?? key)}`);
          break;
        case "number":
          parts.push(`--${key}=${String(def.default ?? 42)}`);
          break;
        case "array":
          if (def.options && def.options.length > 0) {
            parts.push(`--${key}=${String(def.options[0])}`);
          } else {
            parts.push(`--${key}=${String(key)}`);
          }
          break;
      }
    }
  }
  return parts.join(" ");
}

// -------------------------
//   File-based Commands Config
// -------------------------

export type FileBasedCmdsOptions = {
  enable: boolean;
  cmdsRootPath: string;
};

// -------------------------
//   Debug Mode
// -------------------------

const isDebugMode = process.argv.includes("--debug");

function debugLog(...args: any[]) {
  if (isDebugMode) {
    relinka("log", "[DEBUG]", ...args);
  }
}

// Helper to check if a string is a flag (starts with - or --)
function isFlag(str: string): boolean {
  return str.startsWith("-");
}

// -------------------------
//   Public API
// -------------------------

/**
 * Defines a command with metadata, argument definitions,
 * an execution function, and (optional) subCommands.
 */
export function defineCommand<A extends ArgDefinitions = EmptyArgs>(
  options: DefineCommandOptions<A>,
): Command<A> {
  // Prefer new names, but support legacy as fallback
  // eslint-disable-next-line @typescript-eslint/no-deprecated
  const onCmdStart = options.onCmdStart || options.setup;
  // eslint-disable-next-line @typescript-eslint/no-deprecated
  const onCmdEnd = options.onCmdEnd || options.cleanup;
  const onLauncherStart = options.onLauncherStart;
  const onLauncherEnd = options.onLauncherEnd;
  // Prefer 'commands', fallback to deprecated 'subCommands'
  let commands = options.commands;
  if (!commands) {
    // subCommands is deprecated, fallback for backward compatibility
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    commands = options.subCommands;
  }
  const cmdObj = {
    meta: options.meta,
    args: options.args || ({} as A),
    run: options.run,
    commands,
    onCmdStart,
    onCmdEnd,
    onLauncherStart,
    onLauncherEnd,
    // Backward-compatible aliases
    setup: onCmdStart,
    cleanup: onCmdEnd,
  };
  // Add deprecated subCommands getter
  Object.defineProperty(cmdObj, "subCommands", {
    get() {
      return this.commands;
    },
    enumerable: false,
    configurable: true,
  });
  return cmdObj;
}

// Helper to get the default CLI name and version from package.json (without org scope)
let _cachedDefaultCliName: string | undefined;
let _cachedDefaultCliVersion: string | undefined;
async function getDefaultCliNameAndVersion(): Promise<{
  name: string;
  version: string | undefined;
}> {
  if (_cachedDefaultCliName)
    return { name: _cachedDefaultCliName, version: _cachedDefaultCliVersion };
  try {
    const pkg = await readPackageJSON();
    let name = pkg.name || "cli";
    if (name.startsWith("@")) {
      // Remove org scope
      name = name.split("/").pop() || name;
    }
    _cachedDefaultCliName = name;
    _cachedDefaultCliVersion = pkg.version;
    return { name, version: pkg.version };
  } catch (_e) {
    return { name: "cli", version: undefined };
  }
}

/**
 * Show usage for a given command.
 */
export async function showUsage<A extends ArgDefinitions>(
  command: Command<A>,
  parserOptions: ReliArgParserOptions & {
    fileBasedCmds?: FileBasedCmdsOptions;
    autoExit?: boolean;
    metaSettings?: {
      showDescriptionOnMain?: boolean;
    };
  } = {},
  displayNotFoundMessage?: boolean,
) {
  const { name: fallbackName, version: fallbackVersion } =
    await getDefaultCliNameAndVersion();
  const cliName = command.meta?.name || fallbackName;
  const cliVersion = command.meta?.version || fallbackVersion;
  relinka("log", `${cliName}${cliVersion ? ` v${cliVersion}` : ""}`);

  if (parserOptions.metaSettings?.showDescriptionOnMain) {
    let description = command.meta?.description;
    if (!description) {
      try {
        const pkg = await readPackageJSON();
        if (pkg.description) description = pkg.description;
      } catch (_e) {
        /* empty */
      }
    }
    if (description) {
      relinka("log", description);
    }
  }

  // File-based Commands
  const fileCmds = parserOptions.fileBasedCmds;
  if (fileCmds?.enable) {
    const usageLine = `Usage: ${cliName} <command> [command's options]`;
    relinka("log", usageLine);

    // --- Dynamic usage example for file-based subcommands ---
    try {
      const commandsDir = path.resolve(fileCmds.cmdsRootPath);
      const items = await fs.readdir(commandsDir, {
        withFileTypes: true,
      });
      const subCommandNames: string[] = [];
      const subCommandDefs: { name: string; def: any }[] = [];
      for (const dirent of items) {
        if (dirent.isDirectory()) {
          const name = dirent.name;
          const cmdTs = path.join(commandsDir, name, "cmd.ts");
          const cmdJs = path.join(commandsDir, name, "cmd.js");
          let imported;
          try {
            if (await fs.pathExists(cmdTs)) {
              imported = await import(path.resolve(cmdTs));
            } else if (await fs.pathExists(cmdJs)) {
              imported = await import(path.resolve(cmdJs));
            } else {
              continue; // No valid cmd file, skip
            }
            if (imported.default && !imported.default.meta?.hidden) {
              subCommandNames.push(name);
              subCommandDefs.push({ name, def: imported.default });
            }
          } catch (err) {
            debugLog(`Skipping file-based subcommand in ${name}:`, err);
          }
        }
      }
      // Generate and print a usage example
      if (subCommandDefs.length > 0) {
        const randomIdx = Math.floor(Math.random() * subCommandDefs.length);
        const { name: exampleCmd, def: exampleDef } = subCommandDefs[randomIdx];
        const exampleArgs = buildExampleArgs(exampleDef.args || {});
        relinka(
          "log",
          `Example: ${cliName} ${exampleCmd}${exampleArgs ? ` ${exampleArgs}` : ""}`,
        );
      }
      if (subCommandNames.length > 0) {
        relinka("log", "Available commands (run with `help` to see more):");
        subCommandDefs.forEach(({ name, def }) => {
          const desc = def?.meta?.description ?? "";
          relinka("log", `• ${name}${desc ? ` | ${desc}` : ""}`);
          // const version = def?.meta?.version ? ` | ${def.meta.version}` : "";
          // relinka("log", `• ${name}${desc ? ` | ${desc}` : ""}${version}`);
        });
      }
    } catch (err) {
      if (displayNotFoundMessage) {
        relinka(
          "warn",
          `No file-based subcommands found in ${fileCmds.cmdsRootPath}`,
        );
      }
      debugLog("Error reading file-based commands:", err);
    }
  } else {
    // Commands defined in the command object
    const subCommandNames: string[] = [];
    const subCommandDefs: { name: string; def: any }[] = [];
    const objectCommands = command.commands;
    if (objectCommands) {
      for (const [name, spec] of Object.entries(objectCommands)) {
        try {
          const cmd = await loadSubCommand(spec);
          if (!cmd?.meta?.hidden) {
            const aliasDisplay = cmd.meta.aliases
              ? ` (aliases: ${cmd.meta.aliases.join(", ")})`
              : "";
            subCommandNames.push(`${name}${aliasDisplay}`);
            subCommandDefs.push({ name, def: cmd });
          }
        } catch (err) {
          debugLog(`Error loading command ${name}:`, err);
        }
      }
    }

    let usageLine = cliName;
    if (subCommandNames.length > 0) {
      usageLine += " <command> [command's options]";
    } else {
      usageLine += ` [command's options] ${renderPositional(command.args)}`;
    }
    relinka("log", `Usage: ${usageLine}`);

    // --- Dynamic usage example for object subcommands ---
    if (subCommandDefs.length > 0) {
      const randomIdx = Math.floor(Math.random() * subCommandDefs.length);
      const { name: exampleCmd, def: exampleDef } = subCommandDefs[randomIdx];
      const exampleArgs = buildExampleArgs(exampleDef.args || {});
      relinka(
        "log",
        `Example: ${cliName} ${exampleCmd}${exampleArgs ? ` ${exampleArgs}` : ""}`,
      );
    }

    if (subCommandNames.length > 0) {
      relinka("log", "Available commands (run with `help` to see more):");
      subCommandDefs.forEach(({ name, def }) => {
        const desc = def?.meta?.description ?? "";
        relinka("log", `• ${name}${desc ? ` | ${desc}` : ""}`);
        // const version = def?.meta?.version ? ` | ${def.meta.version}` : "";
        // relinka("log", `• ${name}${desc ? ` | ${desc}` : ""}${version}`);
      });
    }
  }

  // Common options
  relinka("log", "Available options:");
  relinka("log", "• -h, --help    | Show help");
  relinka("log", "• -v, --version | Show version");
  relinka("log", "• --debug       | Enable debug mode");

  // Show argument definitions
  for (const [key, def] of Object.entries(command.args || {})) {
    if (def.type === "positional") {
      relinka(
        "log",
        `• <${key}>   | ${def.description ?? ""}${def.required ? " | required" : ""}`,
      );
    } else {
      const parts = [
        `• --${key}${"alias" in def && def.alias ? `, -${def.alias}` : ""}`,
        def.description ?? "",
        `type=${def.type}`,
      ];
      if (def.default !== undefined)
        parts.push(`default=${JSON.stringify(def.default)}`);
      if (def.required) parts.push("required");
      if (def.type === "array" && def.options)
        parts.push(`options: ${def.options.join(", ")}`);
      relinka("log", parts.filter(Boolean).join(" | "));
    }
  }
}

/**
 * Primary entry point to run a command. This function supports:
 *
 * - File-based Commands: scanning for commands within a given commands root.
 * - Commands defined within the command object.
 * - Standard flags like --help, --version, and --debug.
 *
 * This function passes along remaining arguments to command runners to ensure
 * consistent parsing.
 */
export async function runMain<A extends ArgDefinitions = EmptyArgs>(
  command: Command<A>,
  parserOptions: ReliArgParserOptions & {
    fileBasedCmds?: FileBasedCmdsOptions;
    autoExit?: boolean;
    metaSettings?: {
      showDescriptionOnMain?: boolean;
    };
  } = {},
) {
  if (typeof command.onLauncherStart === "function")
    await command.onLauncherStart();
  try {
    // - If fileBasedCmds is not provided and no `commands`, enable file-based commands with default path
    // - If not provided and `commands` exist, do not enable file-based commands
    if (!parserOptions.fileBasedCmds && !command.commands) {
      // Determine the file where runMain was called from
      let callerDir = process.cwd();
      let callerFile: string | undefined;
      try {
        const err = new Error();
        const stack = err.stack?.split("\n");
        if (stack) {
          for (const line of stack) {
            const match =
              /\((.*):(\d+):(\d+)\)/.exec(line) ||
              /at (.*):(\d+):(\d+)/.exec(line);
            if (match?.[1] && !match[1].includes("launcher-mod")) {
              callerFile = match[1];
              break;
            }
          }
        }
        if (callerFile) {
          callerDir = path.dirname(callerFile);
          // Prevent runMain in file-based commands (e.g., app/<cmd>/cmd.ts or cmd.js)
          const rel = path.relative(process.cwd(), callerFile);
          if (/app[/][^/]+[/]cmd\.(ts|js)$/.test(rel)) {
            relinka(
              "error",
              `runMain() should not be called from a file-based subcommand: ${rel}\nThis can cause recursion or unexpected behavior.\nMove your runMain() call to your main CLI entry file.`,
            );
            process.exit(1);
          }
          // Prevent runMain in any subcommand file (non-file-based logic)
          // If the caller file is not the main entry script (process.argv[1]), warn and exit
          const mainEntry = process.argv[1]
            ? path.resolve(process.argv[1])
            : undefined;
          if (mainEntry && path.resolve(callerFile) !== mainEntry) {
            relinka(
              "error",
              `runMain() should only be called from your main CLI entry file.\nDetected: ${callerFile}\nMain entry: ${mainEntry}\nThis can cause recursion or unexpected behavior.`,
            );
            process.exit(1);
          }
        }
      } catch (_e) {
        /* empty */
      }
      const defaultCmdsRoot = path.resolve(callerDir, "app");
      parserOptions.fileBasedCmds = {
        enable: true,
        cmdsRootPath: defaultCmdsRoot,
      };
    }

    const rawArgv = process.argv.slice(2);
    const autoExit = parserOptions.autoExit !== false;

    // Only throw if fileBasedCmds is not enabled, and there are no subCommands and no run handler
    if (
      !(
        parserOptions.fileBasedCmds?.enable ||
        (command.commands && Object.keys(command.commands).length > 0) ||
        command.run
      )
    ) {
      relinka(
        "error",
        "Invalid CLI configuration: No file-based commands, subCommands, or run() handler are defined. This CLI will not do anything.\n" +
          "│   To fix: add file-based commands (./app), or provide at least one subCommand or a run() handler.",
      );
      process.exit(1);
    }

    // Handle 'help' as a special subcommand (acts like --help)
    if (rawArgv[0] === "help") {
      await showUsage(command, parserOptions);
      if (autoExit) process.exit(0);
      return;
    }

    // @reliverse/relinka [1/2]
    await relinkaConfig;

    if (checkHelp(rawArgv)) {
      await showUsage(command, parserOptions);
      if (autoExit) process.exit(0);
      return;
    }
    if (checkVersion(rawArgv)) {
      if (command.meta?.name) {
        relinka(
          "log",
          `${command.meta?.name} ${command.meta?.version ? `v${command.meta?.version}` : ""}`,
        );
      }
      if (autoExit) process.exit(0);
      return;
    }

    const fileBasedEnabled = parserOptions.fileBasedCmds?.enable;

    // Handle file-based subcommand if enabled
    if (fileBasedEnabled && rawArgv.length > 0 && !isFlag(rawArgv[0])) {
      const [subName, ...subCmdArgv] = rawArgv;
      try {
        if (typeof command.onCmdStart === "function")
          await command.onCmdStart();
        await runFileBasedSubCmd(
          subName,
          subCmdArgv,
          parserOptions.fileBasedCmds,
          parserOptions,
          command.onCmdEnd,
        );
        if (autoExit) process.exit(0);
        return;
      } catch (err: any) {
        relinka("error", "Error loading file-based subcommand:", err.message);
        if (autoExit) process.exit(1);
        throw err;
      }
    }

    // Handle command object subcommands
    if (
      !fileBasedEnabled &&
      command.commands &&
      rawArgv.length > 0 &&
      !isFlag(rawArgv[0])
    ) {
      const [maybeSub, ...subCmdArgv] = rawArgv;
      let subSpec: CommandSpec | undefined;
      for (const [key, spec] of Object.entries(command.commands)) {
        if (key === maybeSub) {
          subSpec = spec;
          break;
        }
        try {
          const cmd = await loadSubCommand(spec);
          if (cmd.meta.aliases?.includes(maybeSub)) {
            subSpec = spec;
            break;
          }
        } catch (err) {
          debugLog(`Error checking alias for command ${key}:`, err);
        }
      }
      if (subSpec) {
        try {
          if (typeof command.onCmdStart === "function")
            await command.onCmdStart();
          await runSubCommand(
            subSpec,
            subCmdArgv,
            parserOptions,
            command.onCmdEnd,
          );
          if (autoExit) process.exit(0);
          return;
        } catch (err: any) {
          relinka("error", "Error running subcommand:", err.message);
          if (autoExit) process.exit(1);
          throw err;
        }
      }
    }

    // For main run() handler, do NOT call onCmdStart/onCmdEnd
    try {
      await runCommandWithArgs(command, rawArgv, parserOptions);
    } finally {
      // No onCmdEnd here
    }

    // @reliverse/relinka [2/2]
    await relinkaShutdown();
  } finally {
    if (typeof command.onLauncherEnd === "function")
      await command.onLauncherEnd();
  }
}

// -------------------------
//   Internal Helpers
// -------------------------

function checkHelp(argv: string[]): boolean {
  return argv.includes("--help") || argv.includes("-h");
}

function checkVersion(argv: string[]): boolean {
  return argv.includes("--version") || argv.includes("-v");
}

/**
 * Loads a subcommand given its specification.
 */
async function loadSubCommand(spec: CommandSpec): Promise<Command<any>> {
  if (typeof spec === "string") {
    const mod = await import(spec);
    if (!mod.default) {
      throw new Error(`Subcommand module "${spec}" has no default export`);
    }
    return mod.default;
  }
  const imported = await spec();
  if ("default" in imported && imported.default) {
    return imported.default;
  }
  if (imported) {
    return imported as Command<any>;
  }
  throw new Error("Subcommand import did not return a valid command");
}

/**
 * Runs a file-based subcommand from a given subcommand name.
 * Accepts the remaining argv and the file-based commands options.
 */
async function runFileBasedSubCmd(
  subName: string,
  argv: string[],
  fileCmdOpts: FileBasedCmdsOptions,
  parserOptions: ReliArgParserOptions & { autoExit?: boolean },
  parentFinish?: () => void | Promise<void>,
) {
  const subPathDir = path.join(fileCmdOpts.cmdsRootPath, subName);
  let importPath: string | undefined;

  const possibleFiles = [
    // Only allow cmd.{ts,js} inside the subcommand directory
    path.join(subPathDir, "cmd.js"),
    path.join(subPathDir, "cmd.ts"),
  ];

  const dirExists = await fs.pathExists(subPathDir);
  let isDirCommand = false;
  if (dirExists) {
    const stats = await fs.stat(subPathDir);
    isDirCommand = stats.isDirectory();
  }

  if (isDirCommand) {
    for (const pattern of possibleFiles) {
      if (await fs.pathExists(pattern)) {
        importPath = pattern;
        break;
      }
    }
    if (!importPath) {
      const attempted = [subName, ...argv].join(" ");
      const expectedPath = path.relative(
        process.cwd(),
        path.join(fileCmdOpts.cmdsRootPath, subName, "cmd.{ts,js}"),
      );
      throw new Error(
        `Unknown command or arguments: ${attempted}\n\nInfo for this CLI's developer: No valid command directory found, expected: ${expectedPath}`,
      );
    }
  } else {
    // No longer support file-based commands as a file in the root directory
    const attempted = [subName, ...argv].join(" ");
    const expectedPath2 = path.relative(
      process.cwd(),
      path.join(fileCmdOpts.cmdsRootPath, subName, "cmd.{ts,js}"),
    );
    throw new Error(
      `Unknown command or arguments: ${attempted}\n\nInfo for this CLI's developer: No valid command directory found, expected: ${expectedPath2}`,
    );
  }

  const imported = await import(path.resolve(importPath));
  const subCommand = imported.default;
  if (!subCommand) {
    throw new Error(
      `File-based subcommand "${subName}" has no default export or is invalid.`,
    );
  }

  try {
    await runCommandWithArgs(subCommand, argv, parserOptions);
  } finally {
    if (typeof parentFinish === "function") await parentFinish();
  }
}

/**
 * Runs a subcommand specified by a CommandSpec using the provided argv.
 */
async function runSubCommand(
  spec: CommandSpec,
  argv: string[],
  parserOptions: ReliArgParserOptions & { autoExit?: boolean },
  parentFinish?: () => void | Promise<void>,
) {
  const subCommand = await loadSubCommand(spec);
  try {
    await runCommandWithArgs(subCommand, argv, parserOptions);
  } finally {
    if (typeof parentFinish === "function") await parentFinish();
  }
}

/**
 * Parses argv according to the command's definitions and executes the command.
 */
async function runCommandWithArgs<A extends ArgDefinitions>(
  command: Command<A>,
  argv: string[],
  parserOptions: ReliArgParserOptions & {
    fileBasedCmds?: FileBasedCmdsOptions;
    autoExit?: boolean;
  },
) {
  const autoExit = parserOptions.autoExit !== false;

  // Prepare boolean keys and default values from command argument definitions.
  const booleanKeys = Object.keys(command.args || {}).filter(
    (k) => command.args[k].type === "boolean",
  );
  const defaultMap: Record<string, any> = {};
  for (const [argKey, def] of Object.entries(command.args || {})) {
    if (def.default !== undefined) {
      if (def.type === "array" && typeof def.default === "string") {
        defaultMap[argKey] = [def.default];
      } else {
        defaultMap[argKey] = def.default;
      }
    }
  }

  const mergedParserOptions: ReliArgParserOptions = {
    ...parserOptions,
    boolean: [...(parserOptions.boolean || []), ...booleanKeys],
    defaults: { ...defaultMap, ...(parserOptions.defaults || {}) },
  };

  const parsed = reliArgParser(argv, mergedParserOptions);
  debugLog("Parsed arguments:", parsed);

  const finalArgs: Record<string, any> = {};

  const positionalKeys = Object.keys(command.args || {}).filter(
    (k) => command.args[k].type === "positional",
  );
  const leftoverPositionals = [...(parsed._ || [])];

  // Process positional arguments.
  for (let i = 0; i < positionalKeys.length; i++) {
    const key = positionalKeys[i];
    const def = command.args?.[key] as PositionalArgDefinition;
    const val = leftoverPositionals[i];
    if (val == null && def.required) {
      relinka("error", `Missing required positional argument: <${key}>`);
      await showUsage(command, parserOptions);
      if (autoExit) process.exit(1);
      else throw new Error(`Missing required positional argument: <${key}>`);
    }
    finalArgs[key] = val != null ? castArgValue(def, val, key) : def.default;
  }

  // Process non-positional arguments.
  const otherKeys = Object.keys(command.args || {}).filter(
    (k) => command.args[k].type !== "positional",
  );
  for (const key of otherKeys) {
    const def = command.args?.[key];
    let rawVal = parsed[key];

    // Ensure array type when needed.
    if (
      def.type === "array" &&
      rawVal !== undefined &&
      !Array.isArray(rawVal)
    ) {
      rawVal = [rawVal];
    }

    // Check requirement before casting (default might satisfy it)
    const valueOrDefault = rawVal ?? defaultMap[key];
    if (valueOrDefault == null && def.required) {
      relinka("error", `Missing required argument: --${key}`);
      await showUsage(command, parserOptions);
      if (autoExit) process.exit(1);
      else throw new Error(`Missing required argument: --${key}`);
    }

    try {
      // Cast the raw value (or let default handle if rawVal is null/undefined)
      finalArgs[key] = castArgValue(def, rawVal, key);

      // Validate against options if provided and value exists
      if (def.type === "array" && def.options && finalArgs[key]) {
        const values = finalArgs[key] as string[]; // castArgValue ensures it's an array or undefined
        const invalidOptions = values.filter(
          (v) => def.options && !def.options.includes(v),
        ); // Check def.options exists
        if (invalidOptions.length > 0) {
          throw new Error(
            `Invalid choice(s) for --${key}: ${invalidOptions.join(", ")}. Allowed options: ${def.options.join(", ")}`,
          );
        }
      }
    } catch (err) {
      relinka("error", String(err));
      if (autoExit) process.exit(1);
      else throw err;
    }
  }

  const ctx: CommandContext<InferArgTypes<A>> = {
    args: finalArgs as InferArgTypes<A>,
    raw: argv,
  };

  try {
    if (command.run) {
      await command.run(ctx);
    } else {
      // No 'run' function. Check if this is a dispatcher expecting a subcommand.
      const isDispatcher =
        parserOptions.fileBasedCmds?.enable ||
        (command.commands && Object.keys(command.commands).length > 0);

      // No subcommand was provided if leftoverPositionals is empty,
      // AND this command itself doesn't define its own positional arguments that might have been consumed.
      const noSubcommandArgInCurrentCall = !argv.some((arg) => !isFlag(arg));

      if (isDispatcher && noSubcommandArgInCurrentCall) {
        relinka("warn", "Please specify a command");
        await showUsage(command, parserOptions, true);
        if (autoExit) process.exit(0);
        return;
      }
      const cmdName = command.meta?.name || "unknown";
      const attempted = argv.length > 0 ? argv.join(" ") : "(no arguments)";
      relinka("error", `Unknown command or arguments: ${attempted}`);
      await showUsage(command, parserOptions); // Show usage for context
      if (autoExit) {
        process.exit(1);
      } else {
        throw new Error(`Command "${cmdName}" is not runnable.`);
      }
    }
  } catch (err) {
    relinka("error", `Error while executing command:\n${String(err)}`);
    if (autoExit) process.exit(1);
    else throw err;
  }
}

/**
 * Casts a raw argument value to the correct type based on its definition.
 */
function castArgValue(def: ArgDefinition, rawVal: any, argName: string): any {
  if (rawVal == null) {
    if (def.type === "array" && typeof def.default === "string") {
      return [def.default];
    }
    return def.default ?? undefined;
  }

  switch (def.type) {
    case "boolean":
      if (typeof rawVal === "string") {
        const lower = rawVal.toLowerCase();
        if (lower === "true") return true;
        if (lower === "false") return false;
      }
      return Boolean(rawVal);
    case "string":
      return typeof rawVal === "string" ? rawVal : String(rawVal);
    case "number": {
      const n = Number(rawVal);
      if (Number.isNaN(n)) {
        throw new Error(`Invalid number provided for --${argName}: ${rawVal}`);
      }
      return n;
    }
    case "positional":
      return String(rawVal);
    case "array": {
      // Ensure the result is always an array, even if input was single value
      const arrVal = Array.isArray(rawVal) ? rawVal : [String(rawVal)];
      return arrVal.map(String); // Ensure all elements are strings
    }
    default:
      return rawVal;
  }
}

/**
 * Renders a help string for all positional arguments.
 */
function renderPositional(args: ArgDefinitions) {
  const positionalKeys = Object.keys(args || {}).filter(
    (k) => args[k].type === "positional",
  );
  return positionalKeys.map((k) => `<${k}>`).join(" ");
}

/**
 * Helper to define argument definitions with improved type inference
 * for IntelliSense and validation for array defaults against options.
 *
 * **Note:** For array types, use `as const` on the `options` array to enable
 * precise default value validation (e.g., `options: ["a", "b"] as const`).
 */
export function defineArgs<A extends ArgDefinitions>(
  args: A & ValidateArrayDefaults<A>,
): A {
  return args;
}

/**
 * Programmatically run a command's run() handler with parsed arguments.
 * Does not handle subcommands, file-based commands, or global hooks.
 * Suitable for use in demos, tests, or programmatic invocation.
 *
 * @param command The command definition (from defineCommand)
 * @param argv The argv array to parse (default: [])
 * @param parserOptions Optional reliArgParser options
 */
export async function runCmd<A extends ArgDefinitions = EmptyArgs>(
  command: Command<A>,
  argv: string[] = [],
  parserOptions: ReliArgParserOptions = {},
) {
  // Prepare boolean keys and default values from command argument definitions.
  const booleanKeys = Object.keys(command.args || {}).filter(
    (k) => command.args[k].type === "boolean",
  );
  const defaultMap: Record<string, any> = {};
  for (const [argKey, def] of Object.entries(command.args || {})) {
    if (def.default !== undefined) {
      if (def.type === "array" && typeof def.default === "string") {
        defaultMap[argKey] = [def.default];
      } else {
        defaultMap[argKey] = def.default;
      }
    }
  }

  const mergedParserOptions: ReliArgParserOptions = {
    ...parserOptions,
    boolean: [...(parserOptions.boolean || []), ...booleanKeys],
    defaults: { ...defaultMap, ...(parserOptions.defaults || {}) },
  };

  const parsed = reliArgParser(argv, mergedParserOptions);
  debugLog("Parsed arguments (runCmd):", parsed);

  const finalArgs: Record<string, any> = {};

  const positionalKeys = Object.keys(command.args || {}).filter(
    (k) => command.args[k].type === "positional",
  );
  const leftoverPositionals = [...(parsed._ || [])];

  // Process positional arguments.
  for (let i = 0; i < positionalKeys.length; i++) {
    const key = positionalKeys[i];
    const def = command.args?.[key] as any;
    const val = leftoverPositionals[i];
    if (val == null && def.required) {
      throw new Error(`Missing required positional argument: <${key}>`);
    }
    finalArgs[key] = val != null ? castArgValue(def, val, key) : def.default;
  }

  // Process non-positional arguments.
  const otherKeys = Object.keys(command.args || {}).filter(
    (k) => command.args[k].type !== "positional",
  );
  for (const key of otherKeys) {
    const def = command.args?.[key];
    let rawVal = parsed[key];

    // Ensure array type when needed.
    if (
      def.type === "array" &&
      rawVal !== undefined &&
      !Array.isArray(rawVal)
    ) {
      rawVal = [rawVal];
    }

    // Check requirement before casting (default might satisfy it)
    const valueOrDefault = rawVal ?? defaultMap[key];
    if (valueOrDefault == null && def.required) {
      throw new Error(`Missing required argument: --${key}`);
    }

    // Cast the raw value (or let default handle if rawVal is null/undefined)
    finalArgs[key] = castArgValue(def, rawVal, key);

    // Validate against options if provided and value exists
    if (def.type === "array" && def.options && finalArgs[key]) {
      const values = finalArgs[key] as string[];
      const invalidOptions = values.filter(
        (v) => def.options && !def.options.includes(v),
      );
      if (invalidOptions.length > 0) {
        throw new Error(
          `Invalid choice(s) for --${key}: ${invalidOptions.join(", ")}. Allowed options: ${def.options.join(", ")}`,
        );
      }
    }
  }

  const ctx: CommandContext<InferArgTypes<A>> = {
    args: finalArgs as InferArgTypes<A>,
    raw: argv,
  };

  if (typeof command.run === "function") {
    await command.run(ctx);
  } else {
    throw new Error("Command has no run() handler.");
  }
}
