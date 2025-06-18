import type { ReliArgParserOptions } from "@reliverse/reliarg";

import path from "@reliverse/pathkit";
import { reliArgParser } from "@reliverse/reliarg";
import { re } from "@reliverse/relico";
import fs from "@reliverse/relifso";
import { relinka, relinkaConfig, relinkaShutdown } from "@reliverse/relinka";
import process from "node:process";
import { readPackageJSON } from "pkg-types";

import type {
  ArgDefinition,
  ArgDefinitions,
  Command,
  CommandContext,
  CommandSpec,
  DefineCommandOptions,
  EmptyArgs,
  FileBasedOptions,
  InferArgTypes,
} from "./launcher-types.js";

// Helper to build a plausible example CLI argument string from ArgDefinitions
function buildExampleArgs(args: ArgDefinitions): string {
  const parts: string[] = [];
  // Positional args in order
  const positionalKeys = Object.keys(args || {}).filter(
    (k) => args?.[k]?.type === "positional",
  );
  positionalKeys.forEach((key) => {
    const def = args?.[key];
    if (def && (def.required || Math.random() > 0.5)) {
      // Use default if available, else placeholder
      parts.push(String(def.default ?? `<${key}>`));
    }
  });
  // Non-positional args: include required and a few random optionals
  const otherKeys = Object.keys(args || {}).filter(
    (k) => args?.[k]?.type !== "positional",
  );
  for (const key of otherKeys) {
    const def = args?.[key];
    if (def && (def.required || Math.random() > 0.7)) {
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
          parts.push(`--${key}=${String(def.default ?? key)}`);
          break;
      }
    }
  }
  return parts.join(" ");
}

// -------------------------
//   Debug Mode
// -------------------------

const isDebugMode = process.argv.includes("--debug");

function debugLog(...args: any[]) {
  if (isDebugMode) {
    relinka("log", "[DEBUG]", ...args);
  }
}

// -------------------------
//   Public API
// -------------------------

// Helper to check if a string is a flag (starts with - or --)
function isFlag(str: string): boolean {
  return str.startsWith("-");
}

/**
 * Defines a command with metadata, argument definitions,
 * an execution function, and (optional) subCommands.
 */
export function defineCommand<A extends ArgDefinitions = EmptyArgs>(
  options: DefineCommandOptions<A>,
): Command<A> {
  // Prefer new names, but support legacy as fallback
  // eslint-disable-next-line @typescript-eslint/no-deprecated
  const onCmdInit = options.onCmdInit || options.setup;
  // eslint-disable-next-line @typescript-eslint/no-deprecated
  const onCmdExit = options.onCmdExit || options.cleanup;
  const onLauncherInit = options.onLauncherInit;
  const onLauncherExit = options.onLauncherExit;
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
    onCmdInit,
    onCmdExit,
    onLauncherInit,
    onLauncherExit,
    // Backward-compatible aliases
    setup: onCmdInit,
    cleanup: onCmdExit,
  };
  // Deprecated subCommands getter
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
 * Recursively find commands in a directory and its subdirectories.
 * Returns an array of { name: string, def: any, path: string[] }.
 */
async function findRecursiveFileBasedCommands(
  baseDir: string,
  currentPath: string[] = [],
): Promise<{ name: string; def: any; path: string[] }[]> {
  const results = [];
  const items = await fs.readdir(path.join(baseDir, ...currentPath), {
    withFileTypes: true,
  });

  for (const dirent of items) {
    if (dirent.isDirectory()) {
      const newPath = [...currentPath, dirent.name];
      // First check for cmd.ts/cmd.js in this directory
      for (const fname of ["cmd.ts", "cmd.js"]) {
        const fpath = path.join(baseDir, ...newPath, fname);
        if (await fs.pathExists(fpath)) {
          try {
            const imported = await import(path.resolve(fpath));
            if (imported.default && !imported.default.meta?.hidden) {
              results.push({
                name: dirent.name,
                def: imported.default,
                path: newPath,
              });
            }
          } catch (err) {
            debugLog(`Skipping file-based command in ${fpath}:`, err);
          }
          break;
        }
      }
      // Then recursively check subdirectories
      const subResults = await findRecursiveFileBasedCommands(baseDir, newPath);
      results.push(...subResults);
    }
  }
  return results;
}

/**
 * Calculate padding for table alignment
 */
function calculatePadding(
  items: { text: string; desc?: string }[],
  minPad = 2,
): number {
  const maxLength = items.reduce(
    (max, item) => Math.max(max, item.text.length),
    0,
  );
  return maxLength + minPad;
}

/**
 * Format a table row with dynamic padding
 */
function formatTableRow(
  text: string,
  desc: string | undefined,
  padding: number,
): string {
  const spaces = " ".repeat(Math.max(0, padding - text.length));
  return `${text}${spaces}| ${desc || ""}`;
}

/**
 * Show usage for a given command.
 */
export async function showUsage<A extends ArgDefinitions>(
  command: Command<A>,
  parserOptions: ReliArgParserOptions & {
    fileBased?: FileBasedOptions;
    autoExit?: boolean;
    metaSettings?: {
      showDescriptionOnMain?: boolean;
    };
    _fileBasedCurrentDir?: string;
    _fileBasedPathSegments?: string[];
    _isSubcommand?: boolean;
  } = {},
  globalCliMeta?: { name?: string; version?: string; description?: string },
) {
  const { name: fallbackName, version: fallbackVersion } =
    await getDefaultCliNameAndVersion();

  // Use global CLI metadata if available, otherwise fall back to command meta or package defaults
  const cliName = globalCliMeta?.name || command.meta?.name || fallbackName;
  const cliVersion =
    globalCliMeta?.version || command.meta?.version || fallbackVersion;

  relinka("info", `${cliName}${cliVersion ? ` v${cliVersion}` : ""}`);

  if (parserOptions.metaSettings?.showDescriptionOnMain) {
    let description = globalCliMeta?.description || command.meta?.description;
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

  // Get package name for Usage line
  const { name: pkgName } = await getDefaultCliNameAndVersion();

  // File-based Commands
  const fileCmds = parserOptions.fileBased;
  if (fileCmds?.enable) {
    const commandsDir = path.resolve(fileCmds.cmdsRootPath);
    const pathSegments = parserOptions._fileBasedPathSegments || [];

    // Build usage line starting with package name, then path segments
    let usageLine = [pkgName, ...pathSegments].join(" ");

    // Find all commands recursively
    const allCommands = await findRecursiveFileBasedCommands(
      commandsDir,
      pathSegments,
    );
    const directCommands = allCommands.filter(
      (cmd) => cmd.path.length === pathSegments.length + 1,
    );

    // If this command has subcommands, add <command> [command's options]
    if (directCommands.length > 0) {
      usageLine += " <command> [command's options]";
    } else {
      usageLine += " [command's options]";
      const pos = renderPositional(command.args);
      if (pos) usageLine += ` ${pos}`;
    }
    relinka("log", re.cyan(`Usage: ${usageLine}`));

    // Only show Example if this command has subcommands
    if (directCommands.length > 0 && allCommands.length > 0) {
      // Pick a plausible example from all commands (including nested)
      const randomIdx = Math.floor(Math.random() * allCommands.length);
      const exampleCmd = allCommands[randomIdx];
      if (exampleCmd) {
        const { path, def: exampleDef } = exampleCmd;
        const exampleArgs = buildExampleArgs(exampleDef.args || {});
        relinka(
          "log",
          re.cyan(
            `Example: ${pkgName} ${path.join(" ")}${exampleArgs ? ` ${exampleArgs}` : ""}`,
          ),
        );
      }
    }

    if (allCommands.length > 0) {
      relinka("info", "Available commands (run with `help` to see more):");

      // Group commands by their depth/path
      const commandsByPath = new Map<
        string,
        { name: string; def: any; path: string[] }[]
      >();

      for (const cmd of allCommands) {
        const parentPath = cmd.path.slice(0, -1).join("/") || "/";
        if (!commandsByPath.has(parentPath)) {
          commandsByPath.set(parentPath, []);
        }
        const group = commandsByPath.get(parentPath);
        if (group) {
          group.push(cmd);
        }
      }

      // Calculate maximum command length for each group
      const groupPaddings = new Map<string, number>();
      for (const [parentPath, cmds] of commandsByPath) {
        const items = cmds.map(({ path, def }) => ({
          text: `${parentPath === "/" ? "" : "  "}• ${path.join(" ")}`,
          desc: def?.meta?.description,
        }));
        groupPaddings.set(parentPath, calculatePadding(items));
      }

      // Display commands hierarchically
      for (const [parentPath, cmds] of commandsByPath) {
        if (parentPath !== "/") {
          relinka("log", re.cyanPastel(`Sub-commands in ${parentPath}:`));
        }
        const padding = groupPaddings.get(parentPath) || 0;
        for (const { def, path } of cmds) {
          const desc = def?.meta?.description ?? "";
          const indent = parentPath === "/" ? "" : "  ";
          const text = `${indent}• ${path.join(" ")}`;
          relinka("log", formatTableRow(text, desc, padding));
        }
      }
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
            const aliasDisplay = cmd.meta?.aliases
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

    // For root command or programmatic subcommands
    let usageLine = pkgName;
    if (parserOptions._isSubcommand) {
      // If this is a subcommand, include its name
      usageLine += ` ${cliName}`;
    }

    if (subCommandNames.length > 0) {
      usageLine += " <command> [command's options]";
    } else {
      usageLine += ` [command's options] ${renderPositional(command.args)}`;
    }
    relinka("log", re.cyan(`Usage: ${usageLine}`));

    // --- Dynamic usage example for object subcommands ---
    if (subCommandDefs.length > 0) {
      const randomIdx = Math.floor(Math.random() * subCommandDefs.length);
      const exampleCmd = subCommandDefs[randomIdx];
      if (exampleCmd) {
        const { name: exampleCmdName, def: exampleDef } = exampleCmd;
        const exampleArgs = buildExampleArgs(exampleDef.args || {});
        relinka(
          "log",
          re.cyan(
            `Example: ${pkgName}${parserOptions._isSubcommand ? ` ${cliName}` : ""} ${exampleCmdName}${exampleArgs ? ` ${exampleArgs}` : ""}`,
          ),
        );
      }
    }

    if (subCommandNames.length > 0) {
      relinka("info", "Available commands (run with `help` to see more):");

      // Calculate padding for programmatic commands
      const commandItems = subCommandDefs.map(({ name, def }) => ({
        text: `• ${name}`,
        desc: def?.meta?.description,
      }));
      const padding = calculatePadding(commandItems);

      // Display commands with consistent padding
      for (const { text, desc } of commandItems) {
        relinka("log", formatTableRow(text, desc, padding));
      }
    }
  }

  // Common options
  relinka("info", "Available options:");

  // Prepare all option items for padding calculation
  const optionItems = [
    { text: "• -h, --help", desc: "Show help" },
    { text: "• -v, --version", desc: "Show version" },
    { text: "• --debug", desc: "Enable debug mode" },
  ];

  // Argument definitions
  for (const [key, def] of Object.entries(command.args || {})) {
    if (def.type === "positional") {
      optionItems.push({
        text: `• <${key}>`,
        desc: `${def.description ?? ""}${def.required ? " | required" : ""}`,
      });
    } else {
      const text = `• --${key}${"alias" in def && def.alias ? `, -${def.alias}` : ""}`;
      const parts = [
        def.description ?? "",
        `type=${def.type}`,
        def.default !== undefined
          ? `default=${JSON.stringify(def.default)}`
          : null,
        def.required ? "required" : null,
        def.dependencies
          ? `depends on: ${def.dependencies.map((r) => `--${r}`).join(", ")}`
          : null,
      ].filter(Boolean);
      optionItems.push({ text, desc: parts.join(" | ") });
    }
  }

  // Calculate padding for all options
  const optionsPadding = calculatePadding(optionItems);

  // Display options with consistent padding
  for (const { text, desc } of optionItems) {
    relinka("log", formatTableRow(text, desc, optionsPadding));
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
export function createCli<A extends ArgDefinitions = EmptyArgs>(
  options:
    | Command<A>
    | {
        // Global CLI metadata (used for CLI name/version when no run() handler)
        name?: string;
        version?: string;
        description?: string;

        mainCommand?: Command<A>;
        fileBased?: FileBasedOptions;
        autoExit?: boolean;
        metaSettings?: {
          showDescriptionOnMain?: boolean;
        };
        // Allow defining command directly in options
        meta?: Command<A>["meta"];
        args?: Command<A>["args"];
        run?: Command<A>["run"];
        commands?: Command<A>["commands"];
        onCmdInit?: Command<A>["onCmdInit"];
        onCmdExit?: Command<A>["onCmdExit"];
        onLauncherInit?: Command<A>["onLauncherInit"];
        onLauncherExit?: Command<A>["onLauncherExit"];
      },
  legacyParserOptions?: ReliArgParserOptions & {
    fileBased?: FileBasedOptions;
    autoExit?: boolean;
    metaSettings?: {
      showDescriptionOnMain?: boolean;
    };
  },
) {
  // Handle both new object format and legacy format
  let command: Command<A>;
  let parserOptions: ReliArgParserOptions & {
    fileBased?: FileBasedOptions;
    autoExit?: boolean;
    metaSettings?: {
      showDescriptionOnMain?: boolean;
    };
  };
  let globalCliMeta: { name?: string; version?: string; description?: string } =
    {};

  if (
    typeof options === "object" &&
    !("run" in options) &&
    !("meta" in options) &&
    !("args" in options) &&
    !("commands" in options)
  ) {
    // Legacy format - command is the first parameter
    command = options as Command<A>;
    parserOptions = legacyParserOptions || {};
  } else if ("mainCommand" in options) {
    // New object format with mainCommand
    command = options.mainCommand!;
    parserOptions = {
      fileBased: options.fileBased,
      autoExit: options.autoExit,
      metaSettings: options.metaSettings,
    };
    // Extract global CLI metadata
    globalCliMeta = {
      name: options.name,
      version: options.version,
      description: options.description,
    };
  } else {
    // New object format with inline command definition
    const inlineOptions = options as {
      name?: string;
      version?: string;
      description?: string;
      fileBased?: FileBasedOptions;
      autoExit?: boolean;
      metaSettings?: {
        showDescriptionOnMain?: boolean;
      };
      mainCommand?: Command<A>;
      meta?: Command<A>["meta"];
      args?: Command<A>["args"];
      run?: Command<A>["run"];
      commands?: Command<A>["commands"];
      onCmdInit?: Command<A>["onCmdInit"];
      onCmdExit?: Command<A>["onCmdExit"];
      onLauncherInit?: Command<A>["onLauncherInit"];
      onLauncherExit?: Command<A>["onLauncherExit"];
    };

    const {
      name,
      version,
      description,
      fileBased,
      autoExit,
      metaSettings,
      mainCommand,
      ...commandOptions
    } = inlineOptions;

    command = {
      meta: commandOptions.meta,
      args: commandOptions.args,
      run: commandOptions.run,
      commands: commandOptions.commands,
      onCmdInit: commandOptions.onCmdInit,
      onCmdExit: commandOptions.onCmdExit,
      onLauncherInit: commandOptions.onLauncherInit,
      onLauncherExit: commandOptions.onLauncherExit,
    } as Command<A>;

    parserOptions = {
      fileBased,
      autoExit,
      metaSettings,
    };

    // Extract global CLI metadata
    globalCliMeta = { name, version, description };
  }

  // If command has a run() handler, merge global CLI metadata with command metadata
  if (
    command.run &&
    (globalCliMeta.name || globalCliMeta.version || globalCliMeta.description)
  ) {
    const mergedMeta: any = { ...command.meta };

    // Only set properties if they have actual values and command meta doesn't already have them
    if (globalCliMeta.name && !command.meta?.name) {
      mergedMeta.name = globalCliMeta.name;
    }
    if (globalCliMeta.version && !command.meta?.version) {
      mergedMeta.version = globalCliMeta.version;
    }
    if (globalCliMeta.description && !command.meta?.description) {
      mergedMeta.description = globalCliMeta.description;
    }

    command = {
      ...command,
      meta: mergedMeta,
    };
  }

  // Return an object with a deprecated .run() method for drop-in compatibility with other CLI frameworks
  return {
    /**
     * @deprecated Use createCli() directly instead. This method will be removed in a future version.
     * @example
     * // Instead of:
     * createCli({...}).run()
     * // Use:
     * await createCli({...})
     */
    async run(_ctx?: any) {
      // Show deprecation warning at runtime
      relinka(
        "warn",
        "⚠️  Deprecated: .run() method is deprecated. Use createCli() directly instead.",
      );
      relinka("warn", "   Instead of: createCli({...}).run()");
      relinka("warn", "   Use: await createCli({...})");

      // Call onLauncherInit before any other operations
      if (typeof command.onLauncherInit === "function") {
        try {
          await command.onLauncherInit();
        } catch (err) {
          relinka("error", "Error in onLauncherInit:", err);
          if (parserOptions.autoExit !== false) process.exit(1);
          throw err;
        }
      }

      try {
        // - If fileBased is not provided and no `commands`, enable file-based commands with default path
        // - If not provided and `commands` exist, do not enable file-based commands
        if (!parserOptions.fileBased && !command.commands) {
          // Get the directory of the main entry file
          const mainEntry = process.argv[1]
            ? path.dirname(path.resolve(process.argv[1]))
            : process.cwd();
          const defaultCmdsRoot = path.join(mainEntry, "src", "app");

          // Check if the default path exists, if not try the original path
          const exists = await fs.pathExists(defaultCmdsRoot);
          const finalCmdsRoot = exists
            ? defaultCmdsRoot
            : path.join(mainEntry, "app");

          parserOptions.fileBased = {
            enable: true,
            cmdsRootPath: finalCmdsRoot,
          };
        }

        const rawArgv = process.argv.slice(2);
        const autoExit = parserOptions.autoExit !== false;

        // Only throw if fileBased is not enabled, and there are no subCommands and no run handler
        if (
          !(
            parserOptions.fileBased?.enable ||
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

        // --- Unified help handling for file-based commands ---
        if (parserOptions.fileBased?.enable && rawArgv.length > 0) {
          // Find the deepest command and leftover argv
          const commandsDir = path.resolve(
            parserOptions.fileBased.cmdsRootPath,
          );
          const resolved = await resolveFileBasedCommandPath(
            commandsDir,
            rawArgv,
          );
          if (resolved) {
            const {
              def: subCommand,
              leftoverArgv,
              path: pathSegments,
            } = resolved;
            // If last arg is 'help' or '--help' or '-h', show help for this command
            const helpIdx = leftoverArgv.findIndex(
              (arg) => arg === "help" || arg === "--help" || arg === "-h",
            );
            if (helpIdx !== -1) {
              await showUsage(
                subCommand,
                {
                  ...parserOptions,
                  _fileBasedCurrentDir: pathSegments.length
                    ? path.join(commandsDir, ...pathSegments)
                    : commandsDir,
                  _fileBasedPathSegments: pathSegments,
                },
                globalCliMeta,
              );
              if (autoExit) process.exit(0);
              return;
            }
          }
        }

        const fileBasedEnabled = parserOptions.fileBased?.enable;

        // Handle file-based subcommand execution (if not already handled by help)
        if (
          fileBasedEnabled &&
          rawArgv.length > 0 &&
          rawArgv[0] &&
          !isFlag(rawArgv[0])
        ) {
          const [subName, ...subCmdArgv] = rawArgv;
          try {
            const ctx = getParsedContext(command, rawArgv, parserOptions);
            if (typeof command.onCmdInit === "function")
              await command.onCmdInit(ctx);
            await runFileBasedSubCmd(
              subName,
              subCmdArgv,
              parserOptions.fileBased!,
              parserOptions,
              command.onCmdExit
                ? async (_subCtx) => {
                    // subCtx is context for subcommand, but pass main context for main's onCmdExit
                    await command.onCmdExit?.(ctx);
                  }
                : undefined,
              globalCliMeta,
            );
            if (autoExit) process.exit(0);
            return;
          } catch (err: any) {
            relinka(
              "error",
              "Error loading file-based subcommand:",
              err.message,
            );
            if (autoExit) process.exit(1);
            throw err;
          }
        }

        // Handle command object subcommands (programmatic) - including their specific help
        if (
          !fileBasedEnabled &&
          command.commands &&
          rawArgv.length > 0 &&
          rawArgv[0] &&
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
              if (cmd.meta?.aliases?.includes(maybeSub)) {
                subSpec = spec;
                break;
              }
            } catch (err) {
              debugLog(`Error checking alias for command ${key}:`, err);
            }
          }
          if (subSpec) {
            // --- Show help for subcommand if help is present in argv ---
            const helpIdx = subCmdArgv.findIndex(
              (arg) => arg === "help" || arg === "--help" || arg === "-h",
            );
            if (helpIdx !== -1) {
              const subCommandDef = await loadSubCommand(subSpec);
              await showUsage(
                subCommandDef,
                {
                  ...parserOptions,
                  _isSubcommand: true,
                },
                globalCliMeta,
              );
              if (autoExit) process.exit(0);
              return;
            }

            try {
              const ctx = getParsedContext(command, rawArgv, parserOptions);
              if (typeof command.onCmdInit === "function")
                await command.onCmdInit(ctx);
              await runSubCommand(
                subSpec,
                subCmdArgv,
                { ...parserOptions, _isSubcommand: true },
                command.onCmdExit
                  ? async (_subCtx) => {
                      await command.onCmdExit?.(ctx);
                    }
                  : undefined,
                globalCliMeta,
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

        // @reliverse/relinka [1/2]
        await relinkaConfig;

        // Only handle global help if no command was found
        if (rawArgv[0] === "help" || checkHelp(rawArgv)) {
          await showUsage(command, parserOptions, globalCliMeta);
          if (autoExit) process.exit(0);
          return;
        }

        if (checkVersion(rawArgv)) {
          if (command.meta?.name) {
            relinka(
              "info",
              `${command.meta?.name} ${command.meta?.version ? `v${command.meta?.version}` : ""}`,
            );
          }
          if (autoExit) process.exit(0);
          return;
        }

        // For main run() handler, do NOT call onCmdInit/onCmdExit
        try {
          await runCommandWithArgs(
            command,
            rawArgv,
            parserOptions,
            globalCliMeta,
          );
        } finally {
          // No onCmdExit here
        }

        // @reliverse/relinka [2/2]
        await relinkaShutdown();
      } finally {
        if (typeof command.onLauncherExit === "function")
          await command.onLauncherExit();
      }

      // Throw error after CLI execution to show deprecation warning and stop execution
      throw new Error(
        "⚠️  Deprecated: .run() method is deprecated. Use createCli() directly instead.\n   Instead of: createCli({...}).run()\n   Use: await createCli({...})",
      );
    },
  };
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
 * Runs a file-based subcommand, supporting multi-level subcommands (e.g., app/foo/bar/cmd.ts).
 * Recursively traverses argv, descending into subfolders for each non-flag argument.
 */
async function runFileBasedSubCmd(
  subName: string,
  argv: string[],
  fileCmdOpts: FileBasedOptions,
  parserOptions: ReliArgParserOptions & { autoExit?: boolean },
  parentFinish?: (ctx: CommandContext<any>) => void | Promise<void>,
  globalCliMeta?: { name?: string; version?: string; description?: string },
) {
  // Helper to recursively resolve the deepest subcommand path
  async function resolveCmdPath(
    baseDir: string,
    args: string[],
  ): Promise<{ importPath: string; leftoverArgv: string[] }> {
    if (args.length === 0 || (args[0] && isFlag(args[0]))) {
      // Try to load cmd.ts/cmd.js in current dir
      const possibleFiles = [
        path.join(baseDir, "cmd.js"),
        path.join(baseDir, "cmd.ts"),
      ];
      for (const file of possibleFiles) {
        if (await fs.pathExists(file)) {
          return { importPath: file, leftoverArgv: args };
        }
      }
      throw new Error(
        `\nUnknown command or arguments: ${args.join(" ")}\n\nInfo for this CLI's developer: No valid command file found in ${baseDir}`,
      );
    }
    // Check if next arg is a subfolder
    const nextDir = path.join(baseDir, args[0] || "");
    if (
      (await fs.pathExists(nextDir)) &&
      (await fs.stat(nextDir)).isDirectory()
    ) {
      // Recurse into subfolder
      return resolveCmdPath(nextDir, args.slice(1));
    }
    // No subfolder, try to load cmd.ts/cmd.js in current dir
    const possibleFiles = [
      path.join(baseDir, "cmd.js"),
      path.join(baseDir, "cmd.ts"),
    ];
    for (const file of possibleFiles) {
      if (await fs.pathExists(file)) {
        return { importPath: file, leftoverArgv: args };
      }
    }
    throw new Error(
      `\nUnknown command or arguments: ${args.join(" ")}\n\nInfo for this CLI's developer: No valid command file found in ${baseDir}`,
    );
  }

  // Start recursive resolution from cmdsRootPath/subName
  const startDir = path.join(fileCmdOpts.cmdsRootPath, subName);
  if (
    !(await fs.pathExists(startDir)) ||
    !(await fs.stat(startDir)).isDirectory()
  ) {
    const attempted = [subName, ...argv].join(" ");
    const expectedPath = path.relative(
      process.cwd(),
      path.join(fileCmdOpts.cmdsRootPath, subName, "cmd.{ts,js}"),
    );

    // Find all available commands to suggest alternatives
    const allCommands = await findRecursiveFileBasedCommands(
      fileCmdOpts.cmdsRootPath,
    );
    const commandNames = allCommands.map((cmd) => cmd.path.join(" "));

    // Find the closest match using Levenshtein distance
    let closestMatch = "";
    let minDistance = Number.POSITIVE_INFINITY;
    for (const cmd of commandNames) {
      const distance = levenshteinDistance(subName, cmd.split(" ")[0] || "");
      if (distance < minDistance) {
        minDistance = distance;
        closestMatch = cmd;
      }
    }

    // Only suggest if we found a reasonably close match
    const suggestion =
      minDistance <= 3 ? ` (Did you mean: \`${closestMatch}\`?)` : "";

    throw new Error(
      `\nUnknown command or arguments: ${attempted}${suggestion}\n\nInfo for this CLI's developer: No valid command directory found, expected: ${expectedPath}`,
    );
  }

  // Recursively resolve the deepest command file and leftover argv
  const { importPath, leftoverArgv } = await resolveCmdPath(startDir, argv);
  const imported = await import(path.resolve(importPath));
  const subCommand = imported.default;
  if (!subCommand) {
    throw new Error(
      `File-based subcommand has no default export or is invalid: ${importPath}`,
    );
  }

  try {
    const subCtx = await runCommandWithArgs(
      subCommand,
      leftoverArgv,
      parserOptions,
      globalCliMeta,
    );
    if (typeof parentFinish === "function" && subCtx)
      await parentFinish(subCtx);
  } finally {
    // ...
  }
}

/**
 * Runs a subcommand specified by a CommandSpec using the provided argv.
 */
async function runSubCommand(
  spec: CommandSpec,
  argv: string[],
  parserOptions: ReliArgParserOptions & {
    autoExit?: boolean;
    _isSubcommand?: boolean;
  },
  parentFinish?: (ctx: CommandContext<any>) => void | Promise<void>,
  globalCliMeta?: { name?: string; version?: string; description?: string },
) {
  const subCommand = await loadSubCommand(spec);
  try {
    // Check for help before running the subcommand
    const helpIdx = argv.findIndex(
      (arg) => arg === "help" || arg === "--help" || arg === "-h",
    );
    if (helpIdx !== -1) {
      await showUsage(
        subCommand,
        { ...parserOptions, _isSubcommand: true },
        globalCliMeta,
      );
      if (parserOptions.autoExit !== false) process.exit(0);
      return;
    }

    const subCtx = await runCommandWithArgs(
      subCommand,
      argv,
      parserOptions,
      globalCliMeta,
      true,
    );
    if (typeof parentFinish === "function" && subCtx)
      await parentFinish(subCtx);
  } finally {
    // ...
  }
}

/**
 * Parses argv according to the command's definitions and executes the command.
 */
async function runCommandWithArgs<A extends ArgDefinitions>(
  command: Command<A>,
  argv: string[],
  parserOptions: ReliArgParserOptions & {
    fileBased?: FileBasedOptions;
    autoExit?: boolean;
    _isSubcommand?: boolean;
  },
  globalCliMeta?: { name?: string; version?: string; description?: string },
  returnCtx?: boolean,
): Promise<CommandContext<InferArgTypes<A>> | undefined> {
  const autoExit = parserOptions.autoExit !== false;

  // Prepare boolean keys and default values from command argument definitions.
  const booleanKeys = Object.keys(command.args || {}).filter(
    (k) => command.args?.[k]?.type === "boolean",
  );
  const defaultMap: Record<string, any> = {};
  for (const [argKey, def] of Object.entries(command.args || {})) {
    if (def.type === "boolean") {
      // Always default to false if not specified
      defaultMap[argKey] = def.default !== undefined ? def.default : false;
    } else if (def.default !== undefined) {
      defaultMap[argKey] =
        def.type === "array" && typeof def.default === "string"
          ? [def.default]
          : def.default;
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

  // Process positional arguments.
  const positionalKeys = Object.keys(command.args || {}).filter(
    (k) => command.args?.[k]?.type === "positional",
  );
  const leftoverPositionals = [...(parsed._ || [])];

  for (let i = 0; i < positionalKeys.length; i++) {
    const key = positionalKeys[i];
    if (!key || !command.args) continue;

    const def = command.args[key] as any;
    const val = leftoverPositionals[i];
    finalArgs[key] =
      val != null && def ? castArgValue(def, val, key) : def?.default;
  }

  // Process non-positional arguments.
  const otherKeys = Object.keys(command.args || {}).filter(
    (k) => command.args?.[k]?.type !== "positional",
  );

  for (const key of otherKeys) {
    const def = command.args?.[key];
    if (!def) continue;

    let rawVal = (parsed as Record<string, any>)[key];

    if (
      def.type === "array" &&
      rawVal !== undefined &&
      !Array.isArray(rawVal)
    ) {
      rawVal = [rawVal];
    }

    const casted =
      rawVal !== undefined ? castArgValue(def, rawVal, key) : def.default;

    const argUsed =
      rawVal !== undefined && (def.type === "boolean" ? casted === true : true);

    if (casted == null && def.required) {
      await showUsage(command, parserOptions, globalCliMeta);
      relinka("error", `Missing required argument: --${key}`);
      if (autoExit) process.exit(1);
      else throw new Error(`Missing required argument: --${key}`);
    }

    if (argUsed && def.dependencies?.length) {
      const missingDeps = def.dependencies.filter((d) => {
        const depVal = (parsed as Record<string, any>)[d] ?? defaultMap[d];
        return !depVal;
      });
      if (missingDeps.length > 0) {
        const depsList = missingDeps.map((d) => `--${d}`).join(", ");
        throw new Error(
          `Argument --${key} can only be used when ${depsList} ${
            missingDeps.length === 1 ? "is" : "are"
          } set`,
        );
      }
    }

    finalArgs[key] = def.type === "boolean" ? Boolean(casted) : casted;
  }

  const ctx: CommandContext<InferArgTypes<A>> = {
    args: finalArgs as any,
    raw: argv,
  };

  try {
    if (command.run) {
      await command.run(ctx);
    } else {
      // No 'run' function. Check if this is a dispatcher expecting a subcommand.
      const isDispatcher =
        parserOptions.fileBased?.enable ||
        (command.commands && Object.keys(command.commands).length > 0);

      // No subcommand was provided if leftoverPositionals is empty,
      // AND this command itself doesn't define its own positional arguments that might have been consumed.
      const noSubcommandArgInCurrentCall = !argv.some((arg) => !isFlag(arg));

      if (isDispatcher && noSubcommandArgInCurrentCall) {
        relinka("warn", "Please specify a command");
        await showUsage(command, parserOptions, globalCliMeta);
        if (autoExit) process.exit(0);
        return;
      }
      const cmdName = command.meta?.name || "unknown";
      const attempted = argv.length > 0 ? argv.join(" ") : "(no arguments)";
      await showUsage(command, parserOptions, globalCliMeta); // Show usage for context
      relinka("error", `Unknown command or arguments: ${attempted}`);
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
  if (returnCtx) return ctx;
  return undefined;
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

  let castedValue: any;

  switch (def.type) {
    case "boolean":
      if (typeof rawVal === "string") {
        const lower = rawVal.toLowerCase();
        if (lower === "true") castedValue = true;
        else if (lower === "false") castedValue = false;
        else castedValue = Boolean(rawVal);
      } else {
        castedValue = Boolean(rawVal);
      }
      // Validate against allowed boolean values if specified
      if (def.allowed && !def.allowed.includes(castedValue)) {
        throw new Error(
          `Invalid value for --${argName}: ${rawVal}. Allowed values are: ${def.allowed.join(", ")}`,
        );
      }
      return castedValue;

    case "string":
      castedValue = typeof rawVal === "string" ? rawVal : String(rawVal);
      // Validate against allowed string values if specified
      if (def.allowed && !def.allowed.includes(castedValue)) {
        throw new Error(
          `Invalid value for --${argName}: ${rawVal}. Allowed values are: ${def.allowed.join(", ")}`,
        );
      }
      return castedValue;

    case "number": {
      const n = Number(rawVal);
      if (Number.isNaN(n)) {
        throw new Error(`Invalid number provided for --${argName}: ${rawVal}`);
      }
      // Validate against allowed number values if specified
      if (def.allowed && !def.allowed.includes(n)) {
        throw new Error(
          `Invalid value for --${argName}: ${rawVal}. Allowed values are: ${def.allowed.join(", ")}`,
        );
      }
      return n;
    }

    case "positional":
      castedValue = String(rawVal);
      // Validate against allowed positional values if specified
      if (def.allowed && !def.allowed.includes(castedValue)) {
        throw new Error(
          `Invalid value for <${argName}>: ${rawVal}. Allowed values are: ${def.allowed.join(", ")}`,
        );
      }
      return castedValue;

    case "array": {
      // Accept: --tags foo --tags bar --tags [baz,qux] --tags quux --tags bar,bar2,bar3 --tags "bar4, bar5" --tags '[bar6, bar7]'
      const arrVal = Array.isArray(rawVal) ? rawVal : [String(rawVal)];
      const result: string[] = [];
      // Convert all values to string for type safety
      const arrValStr: string[] = arrVal.map(String);
      // Track if we've warned for this argument
      let warned = false;
      for (let v of arrValStr) {
        // Warn if value looks like a split bracketed array
        if (
          !warned &&
          ((v.startsWith("[") && !v.endsWith("]")) ||
            (!v.startsWith("[") && v.endsWith("]")))
        ) {
          relinka("error", `Don't use quotes around array elements.`);
          relinka(
            "error",
            `Also — don't use spaces — unless you wrap the whole array in quotes.`,
          );
          relinka(
            "warn",
            `Array argument --${argName}: Detected possible shell splitting of bracketed value ('${v}').`,
          );
          relinka(
            "warn",
            `If you intended to pass a bracketed list, quote the whole value like: --${argName} "[a, b, c]"`,
          );
        }
        warned = true;
        // Remove brackets if present
        if (v.startsWith("[") && v.endsWith("]")) {
          v = v.slice(1, -1);
        }
        // Split by comma (with or without spaces)
        const parts = v.split(/\s*,\s*/).filter(Boolean);
        // For each part, throw error if quoted
        parts.forEach((p) => {
          if (
            (p.startsWith('"') && p.endsWith('"')) ||
            (p.startsWith("'") && p.endsWith("'"))
          ) {
            throw new Error(
              `Array argument --${argName}: Quoted values are not supported due to shell parsing limitations. Please avoid using single or double quotes around array elements.`,
            );
          }
          // Validate each array element against allowed values if specified
          if (def.allowed && !def.allowed.includes(p)) {
            throw new Error(
              `Invalid value in array --${argName}: ${p}. Allowed values are: ${def.allowed.join(", ")}`,
            );
          }
        });
        result.push(...parts);
      }
      return result;
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
    (k) => args?.[k]?.type === "positional",
  );
  return positionalKeys.map((k) => `<${k}>`).join(" ");
}

/**
 * Helper to define argument definitions with improved type inference
 * for IntelliSense and validation for array defaults against options.
 */
export function defineArgs<A extends ArgDefinitions>(args: A): A {
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
    (k) => command.args?.[k]?.type === "boolean",
  );
  const defaultMap: Record<string, any> = {};
  for (const [argKey, def] of Object.entries(command.args || {})) {
    if (def.type === "boolean") {
      // Always default to false if not specified
      defaultMap[argKey] = def.default !== undefined ? def.default : false;
    } else if (def.default !== undefined) {
      defaultMap[argKey] =
        def.type === "array" && typeof def.default === "string"
          ? [def.default]
          : def.default;
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
    (k) => command.args?.[k]?.type === "positional",
  );
  const leftoverPositionals = [...(parsed._ || [])];

  // Process positional arguments.
  for (let i = 0; i < positionalKeys.length; i++) {
    const key = positionalKeys[i];
    if (!key || !command.args) continue;

    const def = command.args[key] as any;
    const val = leftoverPositionals[i];
    finalArgs[key] =
      val != null && def ? castArgValue(def, val, key) : def?.default;
  }

  // Process non-positional arguments.
  const otherKeys = Object.keys(command.args || {}).filter(
    (k) => command.args?.[k]?.type !== "positional",
  );

  for (const key of otherKeys) {
    const def = command.args?.[key];
    if (!def) continue;

    let rawVal = parsed[key];

    if (
      def.type === "array" &&
      rawVal !== undefined &&
      !Array.isArray(rawVal)
    ) {
      rawVal = [rawVal];
    }

    const casted =
      rawVal !== undefined ? castArgValue(def, rawVal, key) : def.default;

    const argUsed =
      rawVal !== undefined && (def.type === "boolean" ? casted === true : true);

    if (casted == null && def.required) {
      throw new Error(`Missing required argument: --${key}`);
    }

    if (argUsed && def.dependencies?.length) {
      const missingDeps = def.dependencies.filter((d) => {
        const depVal = parsed[d] ?? defaultMap[d];
        return !depVal;
      });
      if (missingDeps.length) {
        const depsList = missingDeps.map((d) => `--${d}`).join(", ");
        throw new Error(
          `Argument --${key} can only be used when ${depsList} ${
            missingDeps.length === 1 ? "is" : "are"
          } set`,
        );
      }
    }

    finalArgs[key] = def.type === "boolean" ? Boolean(casted) : casted;
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

/**
 * Helper to parse args for a command and argv
 */
function getParsedContext<A extends ArgDefinitions>(
  command: Command<A>,
  argv: string[],
  parserOptions: ReliArgParserOptions,
): CommandContext<InferArgTypes<A>> {
  // Prepare boolean keys and default values from command argument definitions.
  const booleanKeys = Object.keys(command.args || {}).filter(
    (k) => command.args?.[k]?.type === "boolean",
  );
  const defaultMap: Record<string, any> = {};
  for (const [argKey, def] of Object.entries(command.args || {})) {
    if (def.type === "boolean") {
      // Always default to false if not specified
      defaultMap[argKey] = def.default !== undefined ? def.default : false;
    } else if (def.default !== undefined) {
      defaultMap[argKey] =
        def.type === "array" && typeof def.default === "string"
          ? [def.default]
          : def.default;
    }
  }
  const mergedParserOptions: ReliArgParserOptions = {
    ...parserOptions,
    boolean: [...(parserOptions.boolean || []), ...booleanKeys],
    defaults: { ...defaultMap, ...(parserOptions.defaults || {}) },
  };
  const parsed = reliArgParser(argv, mergedParserOptions);
  const finalArgs: Record<string, any> = {};
  const positionalKeys = Object.keys(command.args || {}).filter(
    (k) => command.args?.[k]?.type === "positional",
  );
  const leftoverPositionals = [...(parsed._ || [])];
  for (let i = 0; i < positionalKeys.length; i++) {
    const key = positionalKeys[i];
    if (!key || !command.args) continue;

    const def = command.args[key] as any;
    const val = leftoverPositionals[i];
    finalArgs[key] =
      val != null && def ? castArgValue(def, val, key) : def?.default;
  }
  const otherKeys = Object.keys(command.args || {}).filter(
    (k) => command.args?.[k]?.type !== "positional",
  );
  for (const key of otherKeys) {
    const def = command.args?.[key];
    if (!def) continue;

    let rawVal = parsed[key];
    if (
      def.type === "array" &&
      rawVal !== undefined &&
      !Array.isArray(rawVal)
    ) {
      rawVal = [rawVal];
    }
    if (def.type === "boolean") {
      // Always default to false if not specified
      finalArgs[key] =
        rawVal !== undefined ? castArgValue(def, rawVal, key) : false;
    } else {
      finalArgs[key] = castArgValue(def, rawVal, key);
    }
  }
  return { args: finalArgs as InferArgTypes<A>, raw: argv };
}

// Recursively resolve the deepest file-based command and leftover argv
async function resolveFileBasedCommandPath(
  cmdsRoot: string,
  argv: string[],
): Promise<{ def: any; path: string[]; leftoverArgv: string[] } | null> {
  let currentDir = cmdsRoot;
  const pathSegments: string[] = [];
  let leftover = [...argv];
  while (leftover.length > 0 && leftover[0] && !isFlag(leftover[0])) {
    const nextDir = path.join(currentDir, leftover[0]);
    if (
      (await fs.pathExists(nextDir)) &&
      (await fs.stat(nextDir)).isDirectory()
    ) {
      currentDir = nextDir;
      pathSegments.push(leftover[0]);
      leftover = leftover.slice(1);
    } else {
      break;
    }
  }
  // Try to load cmd.ts/cmd.js in currentDir
  for (const fname of ["cmd.ts", "cmd.js"]) {
    const fpath = path.join(currentDir, fname);
    if (await fs.pathExists(fpath)) {
      const imported = await import(path.resolve(fpath));
      if (imported.default) {
        return {
          def: imported.default,
          path: pathSegments,
          leftoverArgv: leftover,
        };
      }
    }
  }
  return null;
}

function levenshteinDistance(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix: number[][] = [];

  // Initialize matrix
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0]![j] = j;
  }

  // Fill matrix
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i]![j] = matrix[i - 1]![j - 1]!;
      } else {
        matrix[i]![j] = Math.min(
          matrix[i - 1]![j - 1]! + 1, // substitution
          matrix[i]![j - 1]! + 1, // insertion
          matrix[i - 1]![j]! + 1, // deletion
        );
      }
    }
  }

  return matrix[b.length]![a.length]!;
}
