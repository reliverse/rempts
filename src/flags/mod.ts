export * from "./types.js";
export type { RunCommandOptions } from "./command.js";
export type { RunMainOptions } from "./main.js";

export { defineCommand, runCommand } from "./command.js";
export { renderUsage, showUsage } from "./usage.js";
export { runMain, createMain } from "./main.js";

// TODO: implement global flags
export function parseArgs(_args: string[]) {
  return {
    // Support both long and short forms
    // e.g., --help, -h
    options: {
      help: ["-h", "--help"],
      version: ["-v", "--version"],
      // Add more standard options
    },
    // Support grouping of short options
    // e.g., -abc equivalent to -a -b -c
    allowGrouping: true,
  };
}
