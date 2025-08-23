import { stdin, stdout } from "node:process";
import type { Key } from "node:readline";
import * as readline from "node:readline";
import type { Readable, Writable } from "node:stream";
import { ReadStream, WriteStream } from "node:tty";
import { cursor } from "sisteransi";

/**
 * Special value that indicates a cancelled operation
 */
export const CANCEL = Symbol("CANCEL");

/**
 * Type for the cancel value
 */
export type CancelValue = typeof CANCEL;

export const isWindows = globalThis.process.platform.startsWith("win");

/**
 * Sets raw mode on input stream
 */
export function setRawMode(input: Readable, value: boolean) {
  const i = input as typeof stdin;
  if (i.isTTY) i.setRawMode(value);
}

/**
 * Gets the number of columns in the terminal
 */
export function getColumns(output: Writable): number {
  if (output instanceof WriteStream && output.columns) {
    return output.columns;
  }
  return 80;
}

interface BlockOptions {
  input?: Readable;
  output?: Writable;
  overwrite?: boolean;
  hideCursor?: boolean;
}

/**
 * Creates a block for handling input with proper cursor and cleanup
 */
export function block({
  input = stdin,
  output = stdout,
  overwrite = true,
  hideCursor = true,
}: BlockOptions = {}) {
  const rl = readline.createInterface({
    input,
    output,
    prompt: "",
    tabSize: 1,
  });
  readline.emitKeypressEvents(input, rl);

  if (input instanceof ReadStream && input.isTTY) {
    input.setRawMode(true);
  }

  const clear = (data: Buffer, { name, sequence }: Key) => {
    const str = String(data);
    if (str === "\x03" || (name === "c" && sequence === "\x03")) {
      if (hideCursor) output.write(cursor.show);
      process.exit(0);
      return;
    }
    if (!overwrite) return;
    const dx = name === "return" ? 0 : -1;
    const dy = name === "return" ? -1 : 0;

    readline.moveCursor(output, dx, dy, () => {
      readline.clearLine(output, 1, () => {
        input.once("keypress", clear);
      });
    });
  };
  if (hideCursor) output.write(cursor.hide);
  input.once("keypress", clear);

  return () => {
    input.off("keypress", clear);
    if (hideCursor) output.write(cursor.show);

    // Prevent Windows specific issues
    if (input instanceof ReadStream && input.isTTY && !isWindows) {
      input.setRawMode(false);
    }

    // @ts-expect-error fix for https://github.com/nodejs/node/issues/31762#issuecomment-1441223907
    rl.terminal = false;
    rl.close();
  };
}

/**
 * Checks if a value represents a cancelled operation
 * @param value - The value to check
 * @returns true if the value represents a cancelled operation
 */
export function isCancel(value: unknown): value is CancelValue {
  return value === CANCEL;
}

/**
 * Handles cancellation of an operation
 * @param message - Optional message to display before exiting
 */
export function cancel(message?: string): never {
  if (message) {
    console.log(message);
  }
  process.exit(0);
}

/**
 * Creates a cancel value that can be returned from operations
 * @returns The cancel value
 */
export function createCancel(): CancelValue {
  return CANCEL;
}
