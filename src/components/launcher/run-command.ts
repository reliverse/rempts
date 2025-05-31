import { resolve, dirname } from "@reliverse/pathkit";
import fs from "@reliverse/relifso";
import { relinka } from "@reliverse/relinka";
import { createJiti } from "jiti";
import process from "node:process";

import type { Command } from "./launcher-types.js";

// Initialize jiti instance for command imports
const jiti = createJiti(import.meta.url, {
  debug: process.env.NODE_ENV === "development",
  fsCache: true,
  sourceMaps: true,
});

export async function loadCommand(cmdPath: string): Promise<Command> {
  try {
    // Get the caller's file path from the stack trace
    const err = new Error();
    const stack = err.stack?.split("\n");
    let callerFile: string | undefined;

    if (stack) {
      for (const line of stack) {
        const match =
          /\((.*):(\d+):(\d+)\)/.exec(line) || /at (.*):(\d+):(\d+)/.exec(line);
        if (match?.[1] && !match[1].includes("run-command")) {
          callerFile = match[1];
          break;
        }
      }
    }

    // Resolve the path relative to the caller's location
    const callerDir = callerFile ? dirname(callerFile) : process.cwd();
    const normalizedPath = cmdPath.replace(/^\.\//, "");
    const resolvedPath = resolve(callerDir, normalizedPath);

    // If the path doesn't end with cmd.ts or cmd.js, try to find it
    if (!resolvedPath.endsWith("cmd.ts") && !resolvedPath.endsWith("cmd.js")) {
      // Try to find cmd.ts or cmd.js in the directory
      const possiblePaths = [
        resolve(resolvedPath, "cmd.ts"),
        resolve(resolvedPath, "cmd.js"),
      ];

      // Check which file exists
      for (const path of possiblePaths) {
        if (await fs.pathExists(path)) {
          relinka("verbose", `Loading command from: ${path}`);
          const cmd: Command = await jiti.import(path, { default: true });
          relinka("verbose", `Successfully loaded command from: ${path}`);
          return cmd;
        }
      }

      // If no cmd file found, throw a specific error
      throw new Error(
        `No command file found in ${resolvedPath}. Expected to find either:
  - ${possiblePaths[0]}
  - ${possiblePaths[1]}
Please ensure one of these files exists and exports a default command.`,
      );
    }

    relinka("verbose", `Loading command from: ${resolvedPath}`);
    const cmd: Command = await jiti.import(resolvedPath, { default: true });
    relinka("verbose", `Successfully loaded command from: ${resolvedPath}`);
    return cmd;
  } catch (error) {
    // If it's our custom error, just rethrow it
    if (
      error instanceof Error &&
      error.message.includes("No command file found")
    ) {
      throw error;
    }
    // Otherwise, provide a more detailed error message
    relinka("error", `Failed to load command from ${cmdPath}:`, error);
    throw new Error(
      `Failed to load command from ${cmdPath}:
  - Make sure the file exists and is accessible
  - Ensure the file exports a default command
  - Check that the file is a valid TypeScript/JavaScript module

Original error: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
