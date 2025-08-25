// -------------------------
//   Type Definitions
// -------------------------

export type EmptyArgs = Record<string, never>;

export interface BaseArgProps {
  description?: string;
  required?: boolean;
  allowed?: readonly string[];
}

export interface BaseArgDefinition {
  type: string;
  description?: string;
  required?: boolean;
  default?: any;
  allowed?: readonly any[];
  dependencies?: string[];
}

export type PositionalArgDefinition = BaseArgDefinition & {
  type: "positional";
  default?: string;
  allowed?: readonly string[];
};

export type BooleanArgDefinition = BaseArgDefinition & {
  type: "boolean";
  default?: boolean;
  allowed?: readonly boolean[];
  alias?: string;
};

export type StringArgDefinition = BaseArgDefinition & {
  type: "string";
  default?: string;
  allowed?: readonly string[];
  alias?: string;
};

export type NumberArgDefinition = BaseArgDefinition & {
  type: "number";
  default?: number;
  allowed?: readonly number[];
  alias?: string;
};

export type ArrayArgDefinition = BaseArgDefinition & {
  type: "array";
  default?: string | readonly string[];
  allowed?: readonly string[];
  alias?: string;
};

export type ArgDefinition =
  | PositionalArgDefinition
  | BooleanArgDefinition
  | StringArgDefinition
  | NumberArgDefinition
  | ArrayArgDefinition;

export type ArgDefinitions = Record<string, ArgDefinition>;

export interface CommandMeta {
  name: string;
  version?: string;
  description?: string;
  hidden?: boolean;
  aliases?: string[];
}

/**
 * A subcommand can be either:
 * 1) A string path to a module with a default export of type Command.
 * 2) A lazy import function returning a Promise that resolves to
 *    { default: Command<any> } or directly to a Command instance.
 */
export type CommandSpec = string | (() => Promise<{ default: Command<any> } | Command<any>>);

export type CommandsMap = Record<string, CommandSpec>;

export interface CommandContext<ARGS> {
  args: ARGS;
  raw: string[];
}

export type CommandRun<ARGS> = (ctx: CommandContext<ARGS>) => void | Promise<void>;

export type CommandHook<ARGS> = (ctx: CommandContext<ARGS>) => void | Promise<void>;

export interface DefineCommandOptions<A extends ArgDefinitions = EmptyArgs> {
  meta?: CommandMeta;
  args?: A;
  run?: CommandRun<InferArgTypes<A>>;
  /**
   * Object subcommands for this command.
   */
  commands?: CommandsMap;
  /**
   * @deprecated Use `commands` instead. Will be removed in a future major version.
   */
  subCommands?: CommandsMap;
  /**
   * Called before the command runs. Receives `{ args, raw }` (parsed args and raw argv).
   */
  onCmdInit?: CommandHook<InferArgTypes<A>>;
  /**
   * Called after the command finishes. Receives `{ args, raw }` (parsed args and raw argv).
   */
  onCmdExit?: CommandHook<InferArgTypes<A>>;
  /**
   * @deprecated Use onCmdInit instead
   */
  setup?: CommandHook<InferArgTypes<A>>;
  /**
   * @deprecated Use onCmdExit instead
   */
  cleanup?: CommandHook<InferArgTypes<A>>;
  /**
   * Called once per CLI process, before any command/run() is executed
   */
  onLauncherInit?: () => void | Promise<void>;
  /**
   * Called once per CLI process, after all command/run() logic is finished
   */
  onLauncherExit?: () => void | Promise<void>;
}

export interface Command<A extends ArgDefinitions = EmptyArgs> {
  meta?: CommandMeta;
  args: A;
  run?: CommandRun<InferArgTypes<A>>;
  /**
   * Object subcommands for this command.
   */
  commands?: CommandsMap;
  /**
   * @deprecated Use `commands` instead. Will be removed in a future major version.
   */
  subCommands?: CommandsMap;
  /**
   * Called before the command runs. Receives `{ args, raw }` (parsed args and raw argv).
   */
  onCmdInit?: CommandHook<InferArgTypes<A>>;
  /**
   * Called after the command finishes. Receives `{ args, raw }` (parsed args and raw argv).
   */
  onCmdExit?: CommandHook<InferArgTypes<A>>;
  /**
   * @deprecated Use onCmdInit instead
   */
  setup?: CommandHook<InferArgTypes<A>>;
  /**
   * @deprecated Use onCmdExit instead
   */
  cleanup?: CommandHook<InferArgTypes<A>>;
  /**
   * Called once per CLI process, before any command/run() is executed
   */
  onLauncherInit?: () => void | Promise<void>;
  /**
   * Called once per CLI process, after all command/run() logic is finished
   */
  onLauncherExit?: () => void | Promise<void>;
}

// Utility type to extract allowed values as literal types
type ExtractAllowed<T extends ArgDefinition> = T extends {
  type: "positional";
  allowed: readonly (infer U)[];
}
  ? U
  : T extends { type: "positional" }
    ? string
    : T extends { type: "boolean"; allowed: readonly (infer U)[] }
      ? U
      : T extends { type: "boolean" }
        ? boolean
        : T extends { type: "string"; allowed: readonly (infer U)[] }
          ? U
          : T extends { type: "string" }
            ? string
            : T extends { type: "number"; allowed: readonly (infer U)[] }
              ? U
              : T extends { type: "number" }
                ? number
                : T extends { type: "array"; allowed: readonly (infer U)[] }
                  ? U[]
                  : T extends { type: "array" }
                    ? string[]
                    : never;

export type InferArgTypes<A extends ArgDefinitions> = {
  [K in keyof A]: ExtractAllowed<A[K]>;
};

export interface FileBasedOptions {
  enable: boolean;
  cmdsRootPath: string;
}
