import process from "node:process";
import { dirname, resolve } from "@reliverse/pathkit";
import fs from "@reliverse/relifso";
import { relinka } from "@reliverse/relinka";
import { createJiti } from "jiti";

import type { Command } from "./launcher-types";

const jiti = createJiti(import.meta.url, {
  debug: process.env.NODE_ENV === "development",
  fsCache: true,
  sourceMaps: true,
});

const COMMAND_EXTENSIONS = [".ts", ".js"] as const;
const COMMAND_FILENAMES = ["cmd.ts", "cmd.js"] as const;

const getCallerDirectory = async (): Promise<string> => {
  const stack = new Error().stack?.split("\n") ?? [];
  const cwd = process.cwd();

  // Debug: log the stack trace in development
  if (process.env.NODE_ENV === "development") {
    relinka("log", "Stack trace for getCallerDirectory:");
    stack.forEach((line, index) => {
      relinka("log", `  [${index}]: ${line.trim()}`);
    });
  }

  // Look for the first stack frame that's not from the library
  for (const line of stack) {
    const match = /\((.*):(\d+):(\d+)\)/.exec(line) || /at (.*):(\d+):(\d+)/.exec(line);
    if (match?.[1]) {
      const filePath = match[1];
      
      if (process.env.NODE_ENV === "development") {
        relinka("log", `Checking file path: ${filePath}`);
      }
      
      // Skip internal launcher files and node_modules, but be more specific
      if (
        !filePath.includes("node_modules") &&
        !filePath.includes("command-runner") &&
        !filePath.includes("command-typed") &&
        !filePath.includes("launcher-mod") &&
        !filePath.includes("launcher-types") &&
        !filePath.endsWith("mod.mjs") && // Skip compiled output
        !filePath.endsWith("mod.js") &&  // Skip compiled output
        !filePath.endsWith("mod.ts")     // Skip source files
      ) {
        try {
          const fileDir = dirname(filePath);
          
          // First, try to find the package root for this file
          let currentDir = fileDir;
          let packageRoot = null;
          
          while (currentDir !== dirname(currentDir)) {
            try {
              const packageJsonPath = resolve(currentDir, "package.json");
              if (await fs.pathExists(packageJsonPath)) {
                packageRoot = currentDir;
                
                if (process.env.NODE_ENV === "development") {
                  relinka("log", `Found package.json at: ${packageRoot}`);
                }
                
                // Check if this package is different from the CWD package
                const cwdPackageJsonPath = resolve(cwd, "package.json");
                if (await fs.pathExists(cwdPackageJsonPath)) {
                  try {
                    const callerPackage = JSON.parse(await fs.readFile(packageJsonPath, "utf-8"));
                    const cwdPackage = JSON.parse(await fs.readFile(cwdPackageJsonPath, "utf-8"));
                    
                    // If packages are different (different name or version), use the caller's package root
                    if (callerPackage.name !== cwdPackage.name || callerPackage.version !== cwdPackage.version) {
                      if (process.env.NODE_ENV === "development") {
                        relinka("log", `Using caller package root: ${packageRoot} (${callerPackage.name}@${callerPackage.version})`);
                      }
                      return packageRoot;
                    }
                  } catch {
                    // If we can't parse package.json, still use the package root if it's different from cwd
                    if (resolve(packageRoot) !== resolve(cwd)) {
                      if (process.env.NODE_ENV === "development") {
                        relinka("log", `Using caller package root (different path): ${packageRoot}`);
                      }
                      return packageRoot;
                    }
                  }
                } else {
                  // If there's no package.json in CWD, use the caller's package root
                  if (process.env.NODE_ENV === "development") {
                    relinka("log", `Using caller package root (no CWD package.json): ${packageRoot}`);
                  }
                  return packageRoot;
                }
                break;
              }
            } catch {
              // Continue to parent directory
            }
            currentDir = dirname(currentDir);
          }
          
          // If we found a package root but it's the same as CWD, still check if the file is in a different location
          const resolvedFileDir = resolve(fileDir);
          const resolvedCwd = resolve(cwd);
          
          if (resolvedFileDir !== resolvedCwd && !resolvedFileDir.startsWith(resolvedCwd)) {
            if (process.env.NODE_ENV === "development") {
              relinka("log", `Using caller directory (different from CWD): ${fileDir}`);
            }
            return packageRoot || fileDir;
          }
        } catch {
          // If path resolution fails, continue to next stack frame
          continue;
        }
      }
    }
  }

  // Look for package.json in node_modules to find packages that might contain commands
  // This handles the case where the command is called from a CLI tool installed as a dependency
  for (const line of stack) {
    const match = /\((.*):(\d+):(\d+)\)/.exec(line) || /at (.*):(\d+):(\d+)/.exec(line);
    if (match?.[1]) {
      const filePath = match[1];
      
      // Check if this is from a node_modules package
      if (filePath.includes("node_modules")) {
        try {
          // Extract the package path from node_modules
          const nodeModulesMatch = filePath.match(/(.+\/node_modules\/[^\/]+)/);
          if (nodeModulesMatch?.[1]) {
            const packageDir = nodeModulesMatch[1];
            const packageJsonPath = resolve(packageDir, "package.json");
            
            if (await fs.pathExists(packageJsonPath)) {
              if (process.env.NODE_ENV === "development") {
                relinka("log", `Found command package in node_modules: ${packageDir}`);
              }
              return packageDir;
            }
          }
        } catch {
          continue;
        }
      }
    }
  }

  // Fallback: try to find package.json in the current directory or parent directories
  let currentDir = cwd;
  while (currentDir !== dirname(currentDir)) {
    try {
      const packageJsonPath = resolve(currentDir, "package.json");
      if (await fs.pathExists(packageJsonPath)) {
        if (process.env.NODE_ENV === "development") {
          relinka("log", `Found package.json at: ${currentDir}`);
        }
        return currentDir;
      }
    } catch {
      // Continue to parent directory
    }
    currentDir = dirname(currentDir);
  }

  if (process.env.NODE_ENV === "development") {
    relinka("log", `No suitable caller found, using cwd: ${cwd}`);
  }
  // Final fallback to process.cwd()
  return process.cwd();
};

// Collect all package directories referenced in the current call stack that
// originate from node_modules. This helps us locate the actual CLI package
// that invoked the command (e.g. @reliverse/dler), so we can search its
// conventional command locations like bin/app/<cmd>/cmd.js.
const getNodeModulesPackageDirsFromStack = async (): Promise<string[]> => {
  const stack = new Error().stack?.split("\n") ?? [];
  const packageDirs = new Set<string>();

  for (const line of stack) {
    const match = /\((.*):(\d+):(\d+)\)/.exec(line) || /at (.*):(\d+):(\d+)/.exec(line);
    if (!match?.[1]) continue;
    const filePath = match[1];
    if (!filePath.includes("node_modules")) continue;

    try {
      // Capture the package root inside node_modules, including scoped packages
      // Example: .../node_modules/@reliverse/dler/...
      const nodeModulesMatch = filePath.match(/(.+\\node_modules\\(?:@[^\\/]+\\)?[^\\/]+)|(.+\/node_modules\/(?:@[^\/]+\/)?[^\/]+)/);
      const packageDir = (nodeModulesMatch?.[1] || nodeModulesMatch?.[2])?.trim();
      if (!packageDir) continue;
      const packageJsonPath = resolve(packageDir, "package.json");
      if (await fs.pathExists(packageJsonPath)) {
        packageDirs.add(packageDir);
      }
    } catch {
      // ignore
    }
  }

  return Array.from(packageDirs);
};

const tryLoadCommand = async (path: string): Promise<Command | null> => {
  if (!(await fs.pathExists(path))) return null;

  try {
    // relinka("log", `Attempting to load command from: ${path}`);
    const cmd: Command = await jiti.import(path, { default: true });
    // relinka("log", `Successfully loaded command from: ${path}`);
    return cmd;
  } catch {
    relinka("log", `Failed to load ${path} as a command file`);
    return null;
  }
};

const generateCandidatePaths = async (resolvedPath: string): Promise<string[]> => {
  if (!(await fs.pathExists(resolvedPath))) {
    return COMMAND_EXTENSIONS.map((ext) => `${resolvedPath}${ext}`);
  }

  if (await fs.isDirectory(resolvedPath)) {
    return COMMAND_FILENAMES.map((filename) => resolve(resolvedPath, filename));
  }

  return [resolvedPath];
};

const generateAlternativePaths = async (cmdPath: string, callerDir: string): Promise<string[]> => {
  const normalizedCmdPath = cmdPath.replace(/^\.\//, "");
  const paths: string[] = [];

  // Check if the command is in the package's common command locations
  const commonCommandLocations = [
    // Direct command file
    resolve(callerDir, `${normalizedCmdPath}.ts`),
    resolve(callerDir, `${normalizedCmdPath}.js`),
    // Command in cmd subdirectory
    resolve(callerDir, normalizedCmdPath, "cmd.ts"),
    resolve(callerDir, normalizedCmdPath, "cmd.js"),
    // Command in app subdirectory
    resolve(callerDir, "app", normalizedCmdPath, "cmd.ts"),
    resolve(callerDir, "app", normalizedCmdPath, "cmd.js"),
    // Command in src subdirectory
    resolve(callerDir, "src", normalizedCmdPath, "cmd.ts"),
    resolve(callerDir, "src", normalizedCmdPath, "cmd.js"),
    // Command in src/app subdirectory
    resolve(callerDir, "src", "app", normalizedCmdPath, "cmd.ts"),
    resolve(callerDir, "src", "app", normalizedCmdPath, "cmd.js"),
    // Command in src-ts subdirectory
    resolve(callerDir, "src-ts", normalizedCmdPath, "cmd.ts"),
    resolve(callerDir, "src-ts", normalizedCmdPath, "cmd.js"),
    // Command in src-ts/app subdirectory (for dler-like structures)
    resolve(callerDir, "src-ts", "app", normalizedCmdPath, "cmd.ts"),
    resolve(callerDir, "src-ts", "app", normalizedCmdPath, "cmd.js"),
    // Command in lib subdirectory
    resolve(callerDir, "lib", normalizedCmdPath, "cmd.ts"),
    resolve(callerDir, "lib", normalizedCmdPath, "cmd.js"),
    // Command in lib/app subdirectory
    resolve(callerDir, "lib", "app", normalizedCmdPath, "cmd.ts"),
    resolve(callerDir, "lib", "app", normalizedCmdPath, "cmd.js"),
    // Command in dist subdirectory (compiled)
    resolve(callerDir, "dist", normalizedCmdPath, "cmd.js"),
    resolve(callerDir, "dist", "app", normalizedCmdPath, "cmd.js"),
    // Command in bin subdirectory
    resolve(callerDir, "bin", normalizedCmdPath, "cmd.ts"),
    resolve(callerDir, "bin", normalizedCmdPath, "cmd.js"),
    // Command in bin/app subdirectory (common for CLI tools)
    resolve(callerDir, "bin", "app", normalizedCmdPath, "cmd.ts"),
    resolve(callerDir, "bin", "app", normalizedCmdPath, "cmd.js"),
    // Command in commands subdirectory
    resolve(callerDir, "commands", normalizedCmdPath, "cmd.ts"),
    resolve(callerDir, "commands", normalizedCmdPath, "cmd.js"),
    // Command in cli subdirectory
    resolve(callerDir, "cli", normalizedCmdPath, "cmd.ts"),
    resolve(callerDir, "cli", normalizedCmdPath, "cmd.js"),
    // Command in cli/commands subdirectory
    resolve(callerDir, "cli", "commands", normalizedCmdPath, "cmd.ts"),
    resolve(callerDir, "cli", "commands", normalizedCmdPath, "cmd.js"),
    // Command in tools subdirectory
    resolve(callerDir, "tools", normalizedCmdPath, "cmd.ts"),
    resolve(callerDir, "tools", normalizedCmdPath, "cmd.js"),
    // Command in scripts subdirectory
    resolve(callerDir, "scripts", normalizedCmdPath, "cmd.ts"),
    resolve(callerDir, "scripts", normalizedCmdPath, "cmd.js"),
  ];

  // Check which paths actually exist
  for (const path of commonCommandLocations) {
    if (await fs.pathExists(path)) {
      paths.push(path);
    }
  }

  return paths;
};

const createCommandNotFoundError = (cmdPath: string, searchedPaths: string[]): Error =>
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
    const callerDir = await getCallerDirectory();
    const normalizedPath = cmdPath.replace(/^\.\//, "");
    const resolvedPath = resolve(callerDir, normalizedPath);

    if (process.env.NODE_ENV === "development") {
      relinka("log", `Loading command: ${cmdPath}`);
      relinka("log", `Caller directory: ${callerDir}`);
      relinka("log", `Normalized path: ${normalizedPath}`);
      relinka("log", `Resolved path: ${resolvedPath}`);
    }

    // Prefer searching conventional structured locations first, both in the
    // caller package and in any node_modules packages visible in the stack.
    const searchedPaths: string[] = [];

    const baseDirs: string[] = [callerDir];
    const stackPackageDirs = await getNodeModulesPackageDirsFromStack();
    for (const dir of stackPackageDirs) {
      if (!baseDirs.includes(dir)) baseDirs.push(dir);
    }

    for (const baseDir of baseDirs) {
      const alternativePaths = await generateAlternativePaths(cmdPath, baseDir);
      if (process.env.NODE_ENV === "development") {
        relinka("log", `Trying alternative paths in base ${baseDir}: ${alternativePaths.join(", ")}`);
      }
      searchedPaths.push(...alternativePaths);
      for (const path of alternativePaths) {
        const command = await tryLoadCommand(path);
        if (command) {
          if (process.env.NODE_ENV === "development") {
            relinka("log", `Successfully loaded command from alternative path: ${path}`);
          }
          return command;
        }
      }
    }

    // As a last resort, try direct candidate paths when an explicit path is provided
    // (contains a path separator or file extension). Avoid bare-name root lookups.
    const looksLikeExplicitPath = /[\\\/]|\.ts$|\.js$/.test(normalizedPath);
    if (looksLikeExplicitPath) {
      const candidatePaths = await generateCandidatePaths(resolvedPath);
      if (process.env.NODE_ENV === "development") {
        relinka("log", `Candidate paths: ${candidatePaths.join(", ")}`);
      }
      searchedPaths.push(...candidatePaths);
      for (const path of candidatePaths) {
        const command = await tryLoadCommand(path);
        if (command) {
          if (process.env.NODE_ENV === "development") {
            relinka("log", `Successfully loaded command from: ${path}`);
          }
          return command;
        }
      }
    }

    throw createCommandNotFoundError(cmdPath, searchedPaths);
  } catch (error) {
    if (error instanceof Error && error.message.includes("No command file found")) {
      throw error;
    }

    relinka("error", `Failed to load command from ${cmdPath}:`, error);
    throw createLoadError(cmdPath, error);
  }
}
