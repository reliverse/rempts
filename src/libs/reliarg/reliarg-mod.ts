/**
 * Options passed to the ReliArgParser.
 */
export type ReliArgParserOptions = {
  /**
   * A list of flags that should be treated as booleans.
   */
  boolean?: string[];

  /**
   * Whether to print a warning if an unknown flag is encountered.
   */
  warnOnUnknown?: boolean;

  /**
   * Whether encountering an unknown flag should cause a thrown error.
   */
  strict?: boolean;

  /**
   * An object that maps a flag to one or more aliases (e.g. { force: "f" } or { f: ["force", "fast"] }).
   */
  alias?: Record<string, string | string[]>;

  /**
   * Default values for flags (e.g. { force: false, count: 0 }).
   */
  defaults?: Record<string, unknown>;

  /**
   * If true, allows --no-foo to set foo=false (negated booleans).
   * Defaults to `true`.
   */
  negatedBoolean?: boolean;

  /**
   * A callback to determine if a flag is considered "unknown."
   * If it returns false, the parser may warn or throw, depending on config.
   */
  unknown?: (flagName: string) => boolean;

  /**
   * If true, attempt to parse non-boolean string values as numbers when possible.
   * Defaults to false.
   */
  parseNumbers?: boolean;

  /**
   * If true, negative numbers like -123 will not be treated as short flags
   * and will be parsed as positional values.
   * Defaults to true (commonly desired).
   */
  allowNegativeNumbers?: boolean;

  /**
   * If true, stop parsing flags at the first positional argument,
   * pushing all subsequent arguments into result._.
   * Defaults to false.
   */
  stopEarly?: boolean;

  /**
   * A list of flags that should be collected as arrays if repeated.
   * e.g. { array: ["include"] } => --include file1 --include file2
   * results in { include: ["file1", "file2"] }
   */
  array?: string[];

  /**
   * A list of flags that should always be treated as strings (ignoring parseNumbers).
   */
  string?: string[];
};

/**
 * The result of parsing command-line arguments.
 */
export type ReliArgParserResult = {
  /**
   * Positional arguments (non-flag arguments).
   */
  _: string[];
  [key: string]: unknown;
};

// Pre-compiled regex for better performance
const NEGATIVE_NUMBER_REGEX = /^[0-9]+(\.[0-9]+)?$/;

/**
 * Fast ASCII letter check used in short-flag parsing.
 */
function isAsciiLetter(ch: string): boolean {
  const code = ch.charCodeAt(0);
  return (code >= 65 && code <= 90) || (code >= 97 && code <= 122);
}

/**
 * Internal context used by the parser as it processes arguments.
 */
type ParserContext = {
  result: ReliArgParserResult;
  booleanFlags: Set<string>;
  arrayFlags: Set<string>;
  stringFlags: Set<string>;
  aliasMap: Map<string, string>;
  options: ReliArgParserOptions;
  stopEarlyTriggered: boolean;
  // Cached options for performance
  allowNegativeNumbers: boolean;
  negatedBoolean: boolean;
  parseNumbers: boolean;
  stopEarly: boolean;
  warnOnUnknown: boolean;
  strict: boolean;
};

/**
 * Parse arguments according to the provided `ReliArgParserOptions`.
 */
export function reliArgParser(
  argv: string[],
  opts: ReliArgParserOptions = {},
): ReliArgParserResult {
  const context = createParserContext(opts);
  prePopulateDefaults(context);

  let i = 0;
  const argvLength = argv.length; // Cache length
  while (i < argvLength) {
    const arg = argv[i];

    // Skip undefined arguments (shouldn't happen in normal cases, but TypeScript safety)
    if (!arg) {
      // More efficient falsy check
      i++;
      continue;
    }

    // If we've triggered stopEarly, treat all remaining as positional
    if (context.stopEarlyTriggered) {
      context.result._.push(arg); // Inlined handlePositional
      i++;
      continue;
    }

    // -- (double dash) signals end of flags; everything after is positional
    if (arg === "--") {
      context.result._.push(...argv.slice(i + 1));
      break;
    }

    // If allowNegativeNumbers is true (default),
    // check if this is a standalone negative number and treat it as positional
    if (context.allowNegativeNumbers && isNegativeNumber(arg)) {
      if (context.stopEarly) {
        // Stop early at first positional: include current and the rest, then break
        context.result._.push(...argv.slice(i));
        break;
      } else {
        // Normal positional
        context.result._.push(arg); // Inlined handlePositional
        i++;
        continue;
      }
    }

    // Negated booleans, e.g. --no-foo
    if (shouldHandleNegatedBoolean(arg, context)) {
      handleNegatedBooleanFlag(arg, context);
      i++;
      continue;
    }

    // Long flags, e.g. --foo or --foo=bar or --foo bar
    if (arg.length > 2 && arg[0] === "-" && arg[1] === "-") {
      i = handleLongFlag(argv, i, context);
      continue;
    }

    // Short flags, e.g. -abc or -n=123
    if (arg.length > 1 && arg[0] === "-" && arg[1] !== "-") {
      i = handleShortFlags(argv, i, context);
      continue;
    }

    // Otherwise it's a positional argument
    if (context.stopEarly) {
      // Stop early at first positional: include current and the rest, then break
      context.result._.push(...argv.slice(i));
      break;
    }
    context.result._.push(arg); // Inlined handlePositional
    i++;
  }

  return context.result;
}

/**
 * Create the parser context, used to hold state while parsing.
 */
function createParserContext(opts: ReliArgParserOptions): ParserContext {
  const booleanFlags = new Set(opts.boolean || []);
  const arrayFlags = new Set(opts.array || []);
  const stringFlags = new Set(opts.string || []);
  const aliasMap = buildAliasMap(opts.alias || {});
  const result: ReliArgParserResult = { _: [] };

  return {
    result,
    booleanFlags,
    arrayFlags,
    stringFlags,
    aliasMap,
    options: opts,
    stopEarlyTriggered: false,
    // Cache frequently accessed options for performance
    allowNegativeNumbers: opts.allowNegativeNumbers !== false,
    negatedBoolean: opts.negatedBoolean !== false,
    parseNumbers: opts.parseNumbers || false,
    stopEarly: opts.stopEarly || false,
    warnOnUnknown: opts.warnOnUnknown || false,
    strict: opts.strict || false,
  };
}

/**
 * Set default values for any flags that have them.
 */
function prePopulateDefaults(context: ParserContext): void {
  const { defaults = {} } = context.options;
  for (const [key, val] of Object.entries(defaults)) {
    context.result[key] = val;
  }
}

/**
 * Build a Map of aliases so that short/long flags are resolved to a canonical name.
 */
function buildAliasMap(aliasObj: Record<string, string | string[]>): Map<string, string> {
  const map = new Map<string, string>();

  for (const [key, value] of Object.entries(aliasObj)) {
    if (Array.isArray(value)) {
      // For arrays, use the first element as canonical
      const canonical = value[0];
      if (canonical) {
        map.set(key, canonical);
        // Map all values to the canonical form
        for (const alias of value) {
          map.set(alias, canonical);
        }
      }
    } else {
      // For string values, the value is canonical
      map.set(key, value);
      map.set(value, value);
    }
  }

  return map;
}

/**
 * Check if the argument is an allowable "negative number" that should be treated
 * as a positional argument rather than a flag (e.g. -42).
 */
function isNegativeNumber(arg: string): boolean {
  // Early returns for performance
  if (arg.length < 2 || arg[0] !== "-") return false;
  if (arg[1] === "-") return false; // Avoid startsWith check for --

  // Use pre-compiled regex and slice for better performance
  return NEGATIVE_NUMBER_REGEX.test(arg.slice(1));
}

/**
 * Determine if we should handle an argument as a negated boolean (e.g. --no-foo).
 */
function shouldHandleNegatedBoolean(arg: string, context: ParserContext): boolean {
  return (
    context.negatedBoolean &&
    arg.length > 5 &&
    arg[0] === "-" &&
    arg[1] === "-" &&
    arg[2] === "n" &&
    arg[3] === "o" &&
    arg[4] === "-"
  );
}

/**
 * Handle a negated boolean, e.g. --no-foo => foo = false
 */
function handleNegatedBooleanFlag(arg: string, context: ParserContext): void {
  const flagName = arg.slice(5);
  const resolvedName = resolveFlagName(flagName, context);

  if (context.booleanFlags.has(resolvedName)) {
    setFlagValue(resolvedName, false, context);
  } else {
    // If it's unknown, we either warn, throw, or ignore.
    handleUnknownFlag(resolvedName, context);
  }
}

/**
 * Parse a long flag (e.g. --foo or --foo=bar or --foo bar).
 */
function handleLongFlag(argv: string[], index: number, context: ParserContext): number {
  const arg = argv[index];

  // Safety check - this shouldn't happen in normal usage but TypeScript requires it
  if (arg === undefined) {
    return index + 1;
  }

  const flagBody = arg.slice(2); // remove leading --
  const eqIndex = flagBody.indexOf("=");
  let rawFlagName = flagBody;
  let value: string | boolean = true;
  let nextIndex = index;

  // e.g. --foo=bar
  if (eqIndex !== -1) {
    rawFlagName = flagBody.slice(0, eqIndex);
    value = flagBody.slice(eqIndex + 1);
  }
  // If there's no '=' sign, check if the next token is a value
  else {
    const nextArg = argv[index + 1];
    if (nextArg && nextArg.length > 0 && nextArg[0] !== "-") {
      // e.g. --foo bar
      value = nextArg;
      nextIndex++; // consume the next argument
    }
  }

  const flagName = resolveFlagName(rawFlagName, context);
  const parsedValue = parseValue(value, flagName, context);
  setFlagValue(flagName, parsedValue, context);
  validateOrWarn(flagName, context);

  return nextIndex + 1;
}

/**
 * Handle short flags, e.g.:
 *  - single character boolean (-a)
 *  - multiple booleans joined (-abc => a=true,b=true,c=true)
 *  - short flag with attached value (-n=123 or -n123)
 */
function handleShortFlags(argv: string[], index: number, context: ParserContext): number {
  const arg = argv[index];

  // Safety check - this shouldn't happen in normal usage but TypeScript requires it
  if (arg === undefined) {
    return index + 1;
  }

  const shortFlags = arg.slice(1); // remove leading '-'
  const booleanFlags = context.booleanFlags; // Cache for loop
  const aliasMap = context.aliasMap; // Cache for loop

  const shortFlagsLength = shortFlags.length; // Cache length
  let j = 0;
  while (j < shortFlagsLength) {
    const flagChar = shortFlags[j];

    // Safety check for flagChar - early return for performance
    if (!flagChar) {
      j++;
      continue;
    }

    const resolvedName = aliasMap.get(flagChar) || flagChar; // Inline resolveFlagName

    // Look ahead to see if we have =... or an attached value
    const nextChar = shortFlags[j + 1];

    // If this is a boolean flag, handle it
    if (booleanFlags.has(resolvedName)) {
      if (nextChar === "=") {
        // e.g. -b=true or -b=false or -b=abc
        const attachedValue = shortFlags.slice(j + 2);
        const parsed = parseValue(attachedValue, resolvedName, context);
        setFlagValue(resolvedName, parsed, context);
        j = shortFlagsLength; // consume remainder
      } else if (nextChar && !isAsciiLetter(nextChar)) {
        // e.g. -n123 (n is boolean, but user typed number after -> treat as value)
        const attachedValue = shortFlags.slice(j + 1);
        const parsed = parseValue(attachedValue, resolvedName, context);
        setFlagValue(resolvedName, parsed, context);
        j = shortFlagsLength;
      } else {
        // e.g. -b with no attached value => true
        setFlagValue(resolvedName, true, context);
        j++;
      }
      // No validation required for known boolean flags
    } else {
      // For non-boolean short flags:
      const remainder = shortFlags.slice(j + 1);
      if (remainder.startsWith("=")) {
        // e.g. -n=123
        const val = remainder.slice(1);
        const parsedVal = parseValue(val, resolvedName, context);
        setFlagValue(resolvedName, parsedVal, context);
        validateOrWarn(resolvedName, context);
        j = shortFlagsLength;
      } else if (remainder.length > 0) {
        // e.g. -n123 => parse the entire remainder as the value for 'n'
        const parsedVal = parseValue(remainder, resolvedName, context);
        setFlagValue(resolvedName, parsedVal, context);
        validateOrWarn(resolvedName, context);
        j = shortFlagsLength;
      } else {
        // e.g. -n with no remainder => next argv might be the value
        const nextArgIndex = index + 1;
        if (nextArgIndex < argv.length) {
          const nextArg = argv[nextArgIndex];
          if (nextArg && nextArg.length > 0 && nextArg[0] !== "-") {
            // e.g. -n 123
            const parsedVal = parseValue(nextArg, resolvedName, context);
            setFlagValue(resolvedName, parsedVal, context);
            validateOrWarn(resolvedName, context);
            return index + 2; // consumed the next arg for value
          }
        }
        // e.g. -n with nothing after => interpret as boolean `true`
        setFlagValue(resolvedName, true, context);
        validateOrWarn(resolvedName, context);
        break; // Exit loop faster than j = shortFlags.length
      }
    }
  }

  return index + 1;
}

/**
 * Resolve a raw flag name to its canonical name using the alias map.
 */
function resolveFlagName(rawName: string, context: ParserContext): string {
  return context.aliasMap.get(rawName) || rawName;
}

/**
 * Place a parsed value in the context result. If the flag is an array-flag,
 * push rather than overwrite.
 */
function setFlagValue(flagName: string, value: unknown, context: ParserContext) {
  if (context.arrayFlags.has(flagName)) {
    // If we haven't seen this flag yet, initialize to an array
    if (!Array.isArray(context.result[flagName])) {
      context.result[flagName] = [];
    }
    (context.result[flagName] as unknown[]).push(value);
  } else {
    // Overwrite
    context.result[flagName] = value;
  }
}

/**
 * Parse a value. If it's a known boolean flag, parse "true"/"false".
 * If parseNumbers is enabled, attempt to parse numeric values (unless it's a `string` flag).
 */
function parseValue(val: string | boolean, flagName: string, context: ParserContext): unknown {
  // If the user typed --foo with no attached value => val === true
  if (typeof val === "boolean") {
    return val;
  }

  const strVal = String(val);

  // If the flag is forcibly string => return the raw string
  if (context.stringFlags.has(flagName)) {
    return strVal;
  }

  // If it's a known boolean flag, interpret "true" or "false"
  if (context.booleanFlags.has(flagName)) {
    if (strVal === "true") return true;
    if (strVal === "false") return false;
    // fallback: e.g. user typed `-b=abc`, treat it as a string
    return strVal;
  }

  // If parseNumbers is enabled, try to parse as a number
  if (context.parseNumbers && strVal.length > 0) {
    // Fast path: check if it looks like a number before parsing
    const firstChar = strVal.charAt(0);
    const lastChar = strVal.charAt(strVal.length - 1);
    if ((firstChar >= "0" && firstChar <= "9") || firstChar === "-" || firstChar === "+") {
      if (lastChar >= "0" && lastChar <= "9") {
        const maybeNum = Number(strVal);
        if (!Number.isNaN(maybeNum)) {
          return maybeNum;
        }
      }
    }
  }

  // Otherwise return as string
  return strVal;
}

/**
 * Check if a given flag is known. If not, either warn, throw, or do nothing.
 */
function validateOrWarn(flagName: string, context: ParserContext): void {
  const { unknown, defaults } = context.options;

  // Early return if custom unknown function is provided
  if (unknown) {
    if (!unknown(flagName)) {
      handleUnknownFlag(flagName, context);
    }
    return;
  }

  // Fast path: check most common flag types first
  if (
    context.booleanFlags.has(flagName) ||
    context.arrayFlags.has(flagName) ||
    context.stringFlags.has(flagName) ||
    context.aliasMap.has(flagName)
  ) {
    return; // Known flag, no validation needed
  }

  // Check defaults last since it requires object property access
  if (defaults && Object.hasOwn(defaults, flagName)) {
    return;
  }

  // Flag is unknown
  handleUnknownFlag(flagName, context);
}

/**
 * Handle how to respond to an unknown flag, given `warnOnUnknown` or `strict`.
 */
function handleUnknownFlag(flagName: string, context: ParserContext): void {
  if (context.strict) {
    throw new Error(`Unknown flag: --${flagName}`);
  }
  if (context.warnOnUnknown) {
    console.warn(`Unknown flag: --${flagName}`);
  }
}
