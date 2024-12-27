import type MuteStream from "mute-stream";
import type { ReadStream } from "node:fs";
import type { Interface as ReadLine } from "node:readline";
import type { Writable } from "node:stream";
import type { ReadableStream } from "node:stream/web";

export type BetterReadline = {
  input: ReadStream & { fd: 0 };
  output: MuteStream;
  line: string;
  cursor: number;
  clearLine(dir: number): void;
} & ReadLine;

export type Context = {
  input?: (ReadStream & { fd: 0 }) | ReadableStream | MuteStream;
  output?: NodeJS.WriteStream | Writable;
  signal?: AbortSignal;
  clearPromptOnDone?: boolean;
  nonInteractive?: boolean;
};

export type PromptConfig<Theme = unknown> = {
  message?: string;
  default?: string | number | boolean;
  theme?: Theme;
  [key: string]: any;
};

export type Prompt<
  Value = unknown,
  Config extends PromptConfig = PromptConfig,
> = (
  config: Prettify<Config>,
  context?: Context,
) => Promise<Value> & { cancel: () => void };

export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type State = "initial" | "active" | "loading" | "done" | "error";
