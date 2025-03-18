import type { ArgsDef, CommandDef } from "./types.js";

import { resolveSubCommand, runCommand } from "./command.js";
import { showUsage as _showUsage } from "./usage.js";

export type RunMainOptions = {
  rawArgs?: string[];
  showUsage?: typeof _showUsage;
};

export async function runMain<T extends ArgsDef = ArgsDef>(
  cmd: CommandDef<T>,
  opts: RunMainOptions = {},
) {
  const rawArgs = opts.rawArgs || process.argv.slice(2);
  const showUsage = opts.showUsage || _showUsage;

  try {
    if (rawArgs.includes("--help") || rawArgs.includes("-h")) {
      await showUsage(...(await resolveSubCommand(cmd, rawArgs)));
      process.exit(0);
    } else if (rawArgs.length === 1 && rawArgs[0] === "--version") {
      const meta =
        typeof cmd.meta === "function" ? await cmd.meta() : await cmd.meta;
      if (!meta?.version) {
        throw new Error("No version specified");
      }
      console.log(meta.version);
    } else {
      await runCommand(cmd, { rawArgs });
    }
  } catch (error: any) {
    console.error(error.message);
    process.exit(1);
  }
}

export function createMain<T extends ArgsDef = ArgsDef>(
  cmd: CommandDef<T>,
): (opts?: RunMainOptions) => Promise<void> {
  return (opts: RunMainOptions = {}) => runMain(cmd, opts);
}
