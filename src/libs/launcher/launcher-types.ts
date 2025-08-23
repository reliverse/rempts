// -------------------------
//   Type Definitions
// -------------------------

import type { AnyRouter } from "./trpc-orpc-support/trpc-compat";

export type EmptyArgs = Record<string, never>;

export interface BaseArgProps {
  description?: string;
  required?: boolean;
  allowed?: string[];
}

export interface BaseArgDefinition {
  type: string;
  description?: string;
  required?: boolean;
  default?: any;
  allowed?: any[];
  dependencies?: string[];
}

export type PositionalArgDefinition = BaseArgDefinition & {
  type: "positional";
  default?: string;
};

export type BooleanArgDefinition = BaseArgDefinition & {
  type: "boolean";
  default?: boolean;
  allowed?: boolean[];
  alias?: string;
};

export type StringArgDefinition = BaseArgDefinition & {
  type: "string";
  default?: string;
  alias?: string;
};

export type NumberArgDefinition = BaseArgDefinition & {
  type: "number";
  default?: number;
  allowed?: number[];
  alias?: string;
};

export type ArrayArgDefinition = BaseArgDefinition & {
  type: "array";
  default?: string | readonly string[];
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
  /**
   * tRPC/oRPC router for RPC mode. When provided, the command will automatically
   * switch to RPC mode and use the router's procedures as CLI commands.
   */
  router?: AnyRouter;
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
  /**
   * tRPC/oRPC router for RPC mode. When provided, the command will automatically
   * switch to RPC mode and use the router's procedures as CLI commands.
   */
  router?: AnyRouter;
}

export type InferArgTypes<A extends ArgDefinitions> = {
  [K in keyof A]: A[K] extends PositionalArgDefinition
    ? string
    : A[K] extends BooleanArgDefinition
      ? boolean
      : A[K] extends StringArgDefinition
        ? string
        : A[K] extends NumberArgDefinition
          ? number
          : A[K] extends { type: "array" }
            ? string[]
            : never;
};

export interface FileBasedOptions {
  enable: boolean;
  cmdsRootPath: string;
}
