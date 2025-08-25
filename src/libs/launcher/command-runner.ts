import process from "node:process";
import { relinka } from "@reliverse/relinka";
import type { ReliArgParserOptions } from "../reliarg/reliarg-mod";
import { reliArgParser } from "../reliarg/reliarg-mod";

import type {
  ArgDefinition,
  ArgDefinitions,
  Command,
  CommandContext,
  EmptyArgs,
  InferArgTypes,
} from "./launcher-types";

// -------------------------
//   Call Command Options
// -------------------------

export interface CallCmdOptions {
  /** Whether to automatically exit process on errors (default: false for programmatic usage) */
  autoExit?: boolean;
  /** Whether to show debug output */
  debug?: boolean;
  /** Whether to call lifecycle hooks (onCmdInit/onCmdExit) */
  useLifecycleHooks?: boolean;
  /** Custom parser options for argv processing */
  parserOptions?: ReliArgParserOptions;
}

// -------------------------
//   Main callCmd Function
// -------------------------

/**
 * Programmatically call a defineCommand command with arguments.
 * Fully compatible with launcher-mod.ts execution logic.
 *
 * @param command - The command definition created with defineCommand()
 * @param input - Either argv array (CLI-style) or args object (programmatic style)
 * @param options - Optional configuration for execution
 * @returns Promise resolving to the command context
 *
 * @example
 * ```ts
 * // CLI-style with argv array
 * const result = await callCmd(myCommand, ['--flag', 'value', 'positional']);
 *
 * // Programmatic style with object
 * const result = await callCmd(myCommand, { flag: true, name: 'value' });
 * ```
 */
export async function callCmd<A extends ArgDefinitions = EmptyArgs>(
  command: Command<A>,
  input: string[] | Partial<InferArgTypes<A>>,
  options: CallCmdOptions = {},
): Promise<CommandContext<InferArgTypes<A>>> {
  const { autoExit = false, debug = false, useLifecycleHooks = true, parserOptions = {} } = options;

  // Debug logging helper
  const debugLog = (...args: any[]) => {
    if (debug) {
      relinka("log", "[callCmd DEBUG]", ...args);
    }
  };

  debugLog("Calling command with input:", input);
  debugLog("Command meta:", command.meta);

  try {
    let ctx: CommandContext<InferArgTypes<A>>;

    // Handle input - either argv array or args object
    if (Array.isArray(input)) {
      // CLI-style: parse argv array
      debugLog("Processing argv input:", input);
      ctx = await parseArgsFromArgv(command, input, parserOptions);
    } else {
      // Programmatic style: validate and use args object directly
      debugLog("Processing object input:", input);
      ctx = await createContextFromArgs(command, input as Partial<InferArgTypes<A>>);
    }

    debugLog("Created context:", ctx);

    // Call onCmdInit hook if enabled
    if (useLifecycleHooks && command.onCmdInit) {
      debugLog("Calling onCmdInit hook");
      await command.onCmdInit(ctx);
    }

    // Execute the command's run function
    if (command.run) {
      debugLog("Executing command run function");
      await command.run(ctx);
    } else {
      const error = "Command has no run function defined";
      debugLog(error);
      if (autoExit) {
        relinka("error", error);
        process.exit(1);
      }
      throw new Error(error);
    }

    // Call onCmdExit hook if enabled
    if (useLifecycleHooks && command.onCmdExit) {
      debugLog("Calling onCmdExit hook");
      await command.onCmdExit(ctx);
    }

    debugLog("Command execution completed successfully");
    return ctx;
  } catch (error) {
    debugLog("Error during command execution:", error);

    if (autoExit) {
      relinka("error", `Error while executing command: ${String(error)}`);
      process.exit(1);
    }

    throw error;
  }
}

// -------------------------
//   Internal Helper Functions
// -------------------------

/**
 * Parse command arguments from argv array using the same logic as launcher-mod.ts
 */
async function parseArgsFromArgv<A extends ArgDefinitions>(
  command: Command<A>,
  argv: string[],
  parserOptions: ReliArgParserOptions,
): Promise<CommandContext<InferArgTypes<A>>> {
  // Prepare boolean keys and default values from command argument definitions
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
        def.type === "array" && typeof def.default === "string" ? [def.default] : def.default;
    }
  }

  const mergedParserOptions: ReliArgParserOptions = {
    ...parserOptions,
    boolean: [...(parserOptions.boolean || []), ...booleanKeys],
    defaults: { ...defaultMap, ...(parserOptions.defaults || {}) },
  };

  const parsed = reliArgParser(argv, mergedParserOptions);
  const finalArgs: Record<string, any> = {};

  // Process positional arguments
  const positionalKeys = Object.keys(command.args || {}).filter(
    (k) => command.args?.[k]?.type === "positional",
  );
  const leftoverPositionals = [...(parsed._ || [])];

  for (let i = 0; i < positionalKeys.length; i++) {
    const key = positionalKeys[i];
    if (!key || !command.args) continue;

    const def = command.args[key] as any;
    const val = leftoverPositionals[i];
    finalArgs[key] = val != null && def ? castArgValue(def, val, key) : def?.default;
  }

  // Process non-positional arguments
  const otherKeys = Object.keys(command.args || {}).filter(
    (k) => command.args?.[k]?.type !== "positional",
  );

  for (const key of otherKeys) {
    const def = command.args?.[key];
    if (!def) continue;

    let rawVal = (parsed as Record<string, any>)[key];

    if (def.type === "array" && rawVal !== undefined && !Array.isArray(rawVal)) {
      rawVal = [rawVal];
    }

    const casted = rawVal !== undefined ? castArgValue(def, rawVal, key) : def.default;
    const argUsed = rawVal !== undefined && (def.type === "boolean" ? casted === true : true);

    // Validate required arguments
    if (casted == null && def.required) {
      throw new Error(`Missing required argument: --${key}`);
    }

    // Validate dependencies
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

  return {
    args: finalArgs as InferArgTypes<A>,
    raw: argv,
  };
}

/**
 * Create command context from args object (programmatic style)
 */
async function createContextFromArgs<A extends ArgDefinitions>(
  command: Command<A>,
  inputArgs: Partial<InferArgTypes<A>>,
): Promise<CommandContext<InferArgTypes<A>>> {
  const finalArgs: Record<string, any> = {};

  // Process all defined arguments
  for (const [key, def] of Object.entries(command.args || {})) {
    const inputValue = (inputArgs as any)[key];

    // Use input value if provided, otherwise use default
    let value: any;
    if (inputValue !== undefined) {
      // Validate and cast the provided value
      value = castArgValue(def, inputValue, key);
    } else if (def.default !== undefined) {
      value = def.type === "array" && typeof def.default === "string" ? [def.default] : def.default;
    } else if (def.type === "boolean") {
      // Boolean defaults to false if not specified
      value = false;
    } else {
      value = undefined;
    }

    // Validate required arguments
    if (value == null && def.required) {
      throw new Error(`Missing required argument: ${key}`);
    }

    // Validate dependencies
    if (value != null && def.dependencies?.length) {
      const missingDeps = def.dependencies.filter((d) => {
        const depVal = (inputArgs as any)[d];
        return !depVal;
      });
      if (missingDeps.length > 0) {
        const depsList = missingDeps.join(", ");
        throw new Error(
          `Argument '${key}' can only be used when ${depsList} ${
            missingDeps.length === 1 ? "is" : "are"
          } provided`,
        );
      }
    }

    finalArgs[key] = value;
  }

  return {
    args: finalArgs as InferArgTypes<A>,
    raw: [], // No raw argv for object input
  };
}

/**
 * Cast a raw argument value to the correct type based on its definition.
 * This is the same logic used in launcher-mod.ts
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
          `Invalid value for ${argName}: ${rawVal}. Allowed values are: ${def.allowed.join(", ")}`,
        );
      }
      return castedValue;

    case "string":
      castedValue = typeof rawVal === "string" ? rawVal : String(rawVal);
      // Validate against allowed string values if specified
      if (def.allowed && !def.allowed.includes(castedValue)) {
        throw new Error(
          `Invalid value for ${argName}: ${rawVal}. Allowed values are: ${def.allowed.join(", ")}`,
        );
      }
      return castedValue;

    case "number": {
      const n = Number(rawVal);
      if (Number.isNaN(n)) {
        throw new Error(`Invalid number provided for ${argName}: ${rawVal}`);
      }
      // Validate against allowed number values if specified
      if (def.allowed && !def.allowed.includes(n)) {
        throw new Error(
          `Invalid value for ${argName}: ${rawVal}. Allowed values are: ${def.allowed.join(", ")}`,
        );
      }
      return n;
    }

    case "positional":
      castedValue = String(rawVal);
      // Validate against allowed positional values if specified
      if (def.allowed && !def.allowed.includes(castedValue)) {
        throw new Error(
          `Invalid value for ${argName}: ${rawVal}. Allowed values are: ${def.allowed.join(", ")}`,
        );
      }
      return castedValue;

    case "array": {
      // Handle array inputs - accept both arrays and strings
      const arrVal = Array.isArray(rawVal) ? rawVal : [String(rawVal)];
      const result: string[] = [];

      for (let v of arrVal.map(String)) {
        // Remove brackets if present
        if (v.startsWith("[") && v.endsWith("]")) {
          v = v.slice(1, -1);
        }
        // Split by comma (with or without spaces)
        const parts = v.split(/\s*,\s*/).filter(Boolean);

        // Validate each array element against allowed values if specified
        for (const p of parts) {
          if (def.allowed && !def.allowed.includes(p)) {
            throw new Error(
              `Invalid value in array ${argName}: ${p}. Allowed values are: ${def.allowed.join(", ")}`,
            );
          }
        }

        result.push(...parts);
      }
      return result;
    }

    default:
      return rawVal;
  }
}
