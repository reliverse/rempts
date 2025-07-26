import { resolve, dirname } from "@reliverse/pathkit";
import fs from "@reliverse/relifso";
import { relinka } from "@reliverse/relinka";
import { createJiti } from "jiti";
import process from "node:process";

import type { Command } from "./launcher-types.js";

const jiti = createJiti(import.meta.url, {
  debug: process.env.NODE_ENV === "development",
  fsCache: true,
  sourceMaps: true,
});

const COMMAND_EXTENSIONS = [".ts", ".js"] as const;
const COMMAND_FILENAMES = ["cmd.ts", "cmd.js"] as const;

const getCallerDirectory = (): string => {
  const stack = new Error().stack?.split("\n") ?? [];

  for (const line of stack) {
    const match =
      /\((.*):(\d+):(\d+)\)/.exec(line) || /at (.*):(\d+):(\d+)/.exec(line);
    if (match?.[1] && !match[1].includes("run-command")) {
      return dirname(match[1]);
    }
  }

  return process.cwd();
};

const tryLoadCommand = async (path: string): Promise<Command | null> => {
  if (!(await fs.pathExists(path))) return null;

  try {
    // relinka("verbose", `Attempting to load command from: ${path}`);
    const cmd: Command = await jiti.import(path, { default: true });
    // relinka("verbose", `Successfully loaded command from: ${path}`);
    return cmd;
  } catch {
    relinka("verbose", `Failed to load ${path} as a command file`);
    return null;
  }
};

const generateCandidatePaths = async (
  resolvedPath: string,
): Promise<string[]> => {
  if (!(await fs.pathExists(resolvedPath))) {
    return COMMAND_EXTENSIONS.map((ext) => `${resolvedPath}${ext}`);
  }

  if (await fs.isDirectory(resolvedPath)) {
    return COMMAND_FILENAMES.map((filename) => resolve(resolvedPath, filename));
  }

  return [resolvedPath];
};

const createCommandNotFoundError = (
  cmdPath: string,
  searchedPaths: string[],
): Error =>
  new Error(
    `No command file found for "${cmdPath}". Expected to find either:
  - A valid command file at the specified path
  - A directory containing cmd.ts or cmd.js  
  - A file path that can be resolved with .ts or .js extension
  
Searched paths: ${searchedPaths.join(", ")}
Please ensure one of these exists and exports a default command.`,
  );

const createLoadError = (cmdPath: string, originalError: unknown): Error =>
  new Error(
    `Failed to load command from "${cmdPath}"
  
For developers: Ensure the command file:
  - Exists and is accessible
  - Exports a default command (e.g., export default defineCommand({...}))
  - Is a valid TypeScript/JavaScript module
  
Original error: ${originalError instanceof Error ? originalError.message : String(originalError)}`,
  );

/**
 * Load a command from the filesystem.
 *
 * @param cmdPath - Path to the command file or directory containing cmd.ts/cmd.js
 * @returns Promise<Command> - The loaded command
 *
 * @example
 * ```ts
 * // Load a command
 * const cmd = await loadCommand("./web/cmd");
 *
 * // Use with runCmd - pass args as separate array elements
 * await runCmd(cmd, ["--dev", "true"]); // ✅ Correct
 * await runCmd(cmd, [`--dev ${isDev}`]); // ❌ Wrong - creates single string
 * ```
 */
export async function loadCommand(cmdPath: string): Promise<Command> {
  try {
    const callerDir = getCallerDirectory();
    const normalizedPath = cmdPath.replace(/^\.\//, "");
    const resolvedPath = resolve(callerDir, normalizedPath);

    const candidatePaths = await generateCandidatePaths(resolvedPath);

    for (const path of candidatePaths) {
      const command = await tryLoadCommand(path);
      if (command) return command;
    }

    throw createCommandNotFoundError(cmdPath, candidatePaths);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("No command file found")
    ) {
      throw error;
    }

    relinka("error", `Failed to load command from ${cmdPath}:`, error);
    throw createLoadError(cmdPath, error);
  }
}
