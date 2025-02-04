import { NonInteractiveError } from "~/core/errors.js";

import type { ArgsDef, CommandDef } from "./types.js";

import { CLIError, resolveValue } from "./_utils.js";
import { resolveSubCommand, runCommand } from "./command.js";
import { showUsage as _showUsage } from "./usage.js";

export type NonInteractiveAction = {
  onNonInteractive: (promptsJson: any) => Promise<void> | void;
  promptsJson?: any;
};

export type RunMainOptions = {
  rawArgs?: string[];
  showUsage?: typeof _showUsage;
  nonInteractive?: boolean;
  nonInteractiveAction?: NonInteractiveAction;
};

export async function runMain<T extends ArgsDef = ArgsDef>(
  cmd: CommandDef<T>,
  opts: RunMainOptions = {},
) {
  const rawArgs = opts.rawArgs || process.argv.slice(2);
  const showUsage = opts.showUsage || _showUsage;
  const nonInteractive = opts.nonInteractive || !process.stdin.isTTY;
  const nonInteractiveAction = opts.nonInteractiveAction;

  try {
    // Check for non-interactive mode first
    if (
      nonInteractive &&
      !rawArgs.includes("--help") &&
      !rawArgs.includes("-h") &&
      !rawArgs.includes("--version")
    ) {
      // Resolve command metadata
      const meta = await resolveValue(cmd.meta || {});
      const args = await resolveValue(cmd.args || {});

      // Generate prompts.json with command structure and defaults
      const promptsJson = nonInteractiveAction?.promptsJson || {
        type: "prompts",
        message:
          "Please fill this file and run the CLI again to continue with your terminal, which doesn't support interactivity (or use tty-supported terminal)",
        command: {
          name: meta.name || process.argv[1],
          description: meta.description || "",
          version: meta.version || "",
          args: args,
        },
      };

      if (nonInteractiveAction?.onNonInteractive) {
        // Execute custom non-interactive action if provided
        await nonInteractiveAction.onNonInteractive(promptsJson);
        process.exit(0); // Exit successfully after executing the action
      } else {
        // Default behavior: print JSON and throw error
        console.log(JSON.stringify(promptsJson, null, 2));
        throw new NonInteractiveError(
          "Terminal does not support interactivity. A prompts.json file has been generated.",
        );
      }
    }

    if (rawArgs.includes("--help") || rawArgs.includes("-h")) {
      await showUsage(...(await resolveSubCommand(cmd, rawArgs)));
      process.exit(0);
    } else if (rawArgs.length === 1 && rawArgs[0] === "--version") {
      const meta =
        typeof cmd.meta === "function" ? await cmd.meta() : await cmd.meta;
      if (!meta?.version) {
        throw new CLIError("No version specified", "E_NO_VERSION");
      }
      console.log(meta.version);
    } else {
      await runCommand(cmd, { rawArgs });
    }
  } catch (error: any) {
    const isCLIError = error instanceof CLIError;
    const isNonInteractiveError = error instanceof NonInteractiveError;

    if (!isCLIError && !isNonInteractiveError) {
      console.error(error, "\n");
    }

    if (isCLIError) {
      await showUsage(...(await resolveSubCommand(cmd, rawArgs)));
    }

    console.error(error.message);
    process.exit(1);
  }
}

export function createMain<T extends ArgsDef = ArgsDef>(
  cmd: CommandDef<T>,
): (opts?: RunMainOptions) => Promise<void> {
  return (opts: RunMainOptions = {}) => runMain(cmd, opts);
}
