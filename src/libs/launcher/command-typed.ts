import { loadCommand } from "./command-runner";
import { runCmd } from "./launcher-mod";
import type { Command } from "./launcher-types";

/**
 * Static implementation functions for the typed command system.
 * These functions are imported by the generated cmds.ts file.
 */

// Convert typed arguments to string array format that runCmd expects
export function argsToStringArray(args: Record<string, unknown>): string[] {
  const result: string[] = [];

  for (const [key, value] of Object.entries(args)) {
    if (value === undefined || value === null) continue;

    if (typeof value === "boolean") {
      result.push(`--${key}=${value}`);
    } else if (Array.isArray(value)) {
      result.push(`--${key}=${value.join(",")}`);
    } else {
      result.push(`--${key}=${String(value)}`);
    }
  }

  return result;
}

// Main typed command caller function (generic version)
export async function createCallCmd<TCommandArgsMap>() {
  return async function callCmd<T extends keyof TCommandArgsMap>(
    cmdName: T,
    args?: TCommandArgsMap[T],
  ): Promise<void> {
    try {
      // Load the command dynamically (maintains dynamic execution)
      const command: Command = await loadCommand(cmdName as string);

      // Convert typed arguments to string array format
      const stringArgs = args ? argsToStringArray(args as Record<string, unknown>) : [];

      // Run the command with converted arguments
      await runCmd(command, stringArgs);
    } catch (error) {
      console.error(`Error running command '${String(cmdName)}':`, error);
      throw error;
    }
  };
}

// Alternative version that returns the command for more control (generic version)
export async function createGetTypedCmd<TCommandArgsMap>() {
  return async function getTypedCmd<T extends keyof TCommandArgsMap>(
    cmdName: T,
  ): Promise<{
    command: Command;
    run: (args?: TCommandArgsMap[T]) => Promise<void>;
  }> {
    const command = await loadCommand(cmdName as string);

    return {
      command,
      run: async (args?: TCommandArgsMap[T]) => {
        const stringArgs = args ? argsToStringArray(args as Record<string, unknown>) : [];
        await runCmd(command, stringArgs);
      },
    };
  };
}

// Direct implementations (simpler approach)
export async function callCmdImpl<TCommandArgsMap>(
  cmdName: keyof TCommandArgsMap,
  args?: TCommandArgsMap[keyof TCommandArgsMap],
): Promise<void> {
  try {
    // Load the command dynamically (maintains dynamic execution)
    const command: Command = await loadCommand(cmdName as string);

    // Convert typed arguments to string array format
    const stringArgs = args ? argsToStringArray(args as Record<string, unknown>) : [];

    // Run the command with converted arguments
    await runCmd(command, stringArgs);
  } catch (error) {
    console.error(`Error running command '${String(cmdName)}':`, error);
    throw error;
  }
}

export async function getTypedCmdImpl<TCommandArgsMap>(cmdName: keyof TCommandArgsMap): Promise<{
  command: Command;
  run: (args?: TCommandArgsMap[keyof TCommandArgsMap]) => Promise<void>;
}> {
  const command = await loadCommand(cmdName as string);

  return {
    command,
    run: async (args?: TCommandArgsMap[keyof TCommandArgsMap]) => {
      const stringArgs = args ? argsToStringArray(args as Record<string, unknown>) : [];
      await runCmd(command, stringArgs);
    },
  };
}
