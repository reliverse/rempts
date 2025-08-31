import process from "node:process";
import type { WriteStream } from "node:tty";
import { type ColorName, re } from "@reliverse/relico";
import cliCursor from "cli-cursor";
import cliSpinners, { type Spinner } from "cli-spinners";
import isInteractive from "is-interactive";
import isUnicodeSupported from "is-unicode-supported";

import stdinDiscarder from "stdin-discarder";
import stringWidth from "string-width";
import stripAnsi from "strip-ansi";

const _isUnicodeSupported = isUnicodeSupported();

export const info = re.blue(_isUnicodeSupported ? "ℹ" : "i");
export const success = re.green(_isUnicodeSupported ? "✔" : "√");
export const warning = re.yellow(_isUnicodeSupported ? "⚠" : "‼");
export const error = re.red(_isUnicodeSupported ? "✖" : "×");

export interface OraOptions {
  text?: string | undefined;
  spinner?: string | Spinner;
  color?: ColorName;
  stream?: WriteStream;
  discardStdin?: boolean;
  hideCursor?: boolean;
  interval?: number;
  isEnabled?: boolean;
  isSilent?: boolean;
  prefixText?: string | (() => string) | undefined;
  suffixText?: string | (() => string) | undefined;
  indent?: number;
}

export interface StopAndPersistOptions {
  symbol?: string;
  text?: string | undefined;
  prefixText?: string | (() => string) | undefined;
  suffixText?: string | (() => string) | undefined;
}

export interface OraPromiseOptions<T = any> extends OraOptions {
  successText?: string | ((result: T) => string);
  failText?: string | ((error: any) => string);
}

export class Ora {
  #linesToClear = 0;
  #isDiscardingStdin = false;
  #lineCount = 0;
  #frameIndex = -1;
  #lastSpinnerFrameTime = 0;
  #options: OraOptions;
  #spinner!: Spinner;
  #stream: WriteStream;
  #id: NodeJS.Timeout | undefined;
  #initialInterval: number | undefined;
  #isEnabled!: boolean;
  #isSilent!: boolean;
  #indent!: number;
  #text!: string;
  #prefixText!: string | (() => string) | undefined;
  #suffixText!: string | (() => string) | undefined;
  color!: ColorName;
  lastIndent?: number;
  _stream?: WriteStream;
  _isEnabled?: boolean;

  constructor(options?: string | OraOptions) {
    if (typeof options === "string") {
      options = {
        text: options,
      };
    }

    this.#options = {
      color: "cyan",
      stream: process.stderr,
      discardStdin: true,
      hideCursor: true,
      ...options,
    };

    // Public
    this.color = this.#options.color ?? "cyan";

    // It's important that these use the public setters.
    this.spinner = this.#options.spinner;

    this.#initialInterval = this.#options.interval;
    this.#stream = this.#options.stream ?? process.stderr;
    this.#isEnabled =
      typeof this.#options.isEnabled === "boolean"
        ? this.#options.isEnabled
        : isInteractive({ stream: this.#stream });
    this.#isSilent = typeof this.#options.isSilent === "boolean" ? this.#options.isSilent : false;

    // Set *after* `this.#stream`.
    // It's important that these use the public setters.
    this.text = this.#options.text ?? "";
    this.prefixText = this.#options.prefixText ?? "";
    this.suffixText = this.#options.suffixText ?? "";
    this.indent = this.#options.indent ?? 0;

    if (process.env.NODE_ENV === "test") {
      this._stream = this.#stream;
      this._isEnabled = this.#isEnabled;

      Object.defineProperty(this, "_linesToClear", {
        get() {
          return this.#linesToClear;
        },
        set(newValue) {
          this.#linesToClear = newValue;
        },
      });

      Object.defineProperty(this, "_frameIndex", {
        get() {
          return this.#frameIndex;
        },
      });

      Object.defineProperty(this, "_lineCount", {
        get() {
          return this.#lineCount;
        },
      });
    }
  }

  get indent() {
    return this.#indent;
  }

  set indent(indent: number | undefined) {
    const indentValue = indent ?? 0;
    if (!(indentValue >= 0 && Number.isInteger(indentValue))) {
      throw new Error("The `indent` option must be an integer from 0 and up");
    }

    this.#indent = indentValue;
    this.#updateLineCount();
  }

  get interval() {
    return this.#initialInterval ?? this.#spinner.interval ?? 100;
  }

  get spinner() {
    return this.#spinner;
  }

  set spinner(spinner: string | Spinner | undefined) {
    this.#frameIndex = -1;
    this.#initialInterval = undefined;

    if (typeof spinner === "object") {
      if (spinner.frames === undefined) {
        throw new Error("The given spinner must have a `frames` property");
      }

      this.#spinner = spinner;
    } else if (!isUnicodeSupported()) {
      this.#spinner = cliSpinners.line;
    } else if (spinner === undefined) {
      // Set default spinner
      this.#spinner = cliSpinners.dots;
    } else if (spinner !== "default" && typeof spinner === "string" && spinner in cliSpinners) {
      this.#spinner = cliSpinners[spinner as keyof typeof cliSpinners];
    } else {
      throw new Error(
        `There is no built-in spinner named '${spinner}'. See https://github.com/sindresorhus/cli-spinners/blob/main/spinners.json for a full list.`,
      );
    }
  }

  get text() {
    return this.#text;
  }

  set text(value: string | undefined) {
    this.#text = value ?? "";
    this.#updateLineCount();
  }

  get prefixText() {
    return this.#prefixText;
  }

  set prefixText(value: string | (() => string) | undefined) {
    this.#prefixText = value;
    this.#updateLineCount();
  }

  get suffixText() {
    return this.#suffixText;
  }

  set suffixText(value: string | (() => string) | undefined) {
    this.#suffixText = value;
    this.#updateLineCount();
  }

  get isSpinning() {
    return this.#id !== undefined;
  }

  #getFullPrefixText(prefixText = this.#prefixText, postfix = " ") {
    if (typeof prefixText === "string" && prefixText !== "") {
      return prefixText + postfix;
    }

    if (typeof prefixText === "function") {
      return prefixText() + postfix;
    }

    return "";
  }

  #getFullSuffixText(suffixText = this.#suffixText, prefix = " ") {
    if (typeof suffixText === "string" && suffixText !== "") {
      return prefix + suffixText;
    }

    if (typeof suffixText === "function") {
      return prefix + suffixText();
    }

    return "";
  }

  #updateLineCount() {
    const columns = this.#stream.columns ?? 80;
    const fullPrefixText = this.#getFullPrefixText(this.#prefixText, "-");
    const fullSuffixText = this.#getFullSuffixText(this.#suffixText, "-");
    const fullText =
      " ".repeat(this.#indent) + fullPrefixText + "--" + this.#text + "--" + fullSuffixText;

    this.#lineCount = 0;
    for (const line of stripAnsi(fullText).split("\n")) {
      this.#lineCount += Math.max(
        1,
        Math.ceil(stringWidth(line, { countAnsiEscapeCodes: true }) / columns),
      );
    }
  }

  get isEnabled() {
    return this.#isEnabled && !this.#isSilent;
  }

  set isEnabled(value) {
    if (typeof value !== "boolean") {
      throw new TypeError("The `isEnabled` option must be a boolean");
    }

    this.#isEnabled = value;
  }

  get isSilent() {
    return this.#isSilent;
  }

  set isSilent(value) {
    if (typeof value !== "boolean") {
      throw new TypeError("The `isSilent` option must be a boolean");
    }

    this.#isSilent = value;
  }

  frame() {
    // Ensure we only update the spinner frame at the wanted interval,
    // even if the render method is called more often.
    const now = Date.now();
    if (this.#frameIndex === -1 || now - this.#lastSpinnerFrameTime >= this.interval) {
      this.#frameIndex = ++this.#frameIndex % this.#spinner.frames.length;
      this.#lastSpinnerFrameTime = now;
    }

    const { frames } = this.#spinner;
    let frame = frames[this.#frameIndex];

    if (this.color) {
      frame = re[this.color](frame ?? "");
    }

    const fullPrefixText =
      typeof this.#prefixText === "string" && this.#prefixText !== "" ? this.#prefixText + " " : "";
    const fullText = typeof this.text === "string" ? " " + this.text : "";
    const fullSuffixText =
      typeof this.#suffixText === "string" && this.#suffixText !== "" ? " " + this.#suffixText : "";

    return fullPrefixText + frame + fullText + fullSuffixText;
  }

  clear() {
    if (!this.#isEnabled || !this.#stream.isTTY) {
      return this;
    }

    this.#stream.cursorTo(0);

    for (let index = 0; index < this.#linesToClear; index++) {
      if (index > 0) {
        this.#stream.moveCursor(0, -1);
      }

      this.#stream.clearLine(1);
    }

    if (this.#indent || this.lastIndent !== this.#indent) {
      this.#stream.cursorTo(this.#indent);
    }

    this.lastIndent = this.#indent;
    this.#linesToClear = 0;

    return this;
  }

  render() {
    if (this.#isSilent) {
      return this;
    }

    this.clear();
    this.#stream.write(this.frame());
    this.#linesToClear = this.#lineCount;

    return this;
  }

  start(text?: string): this {
    if (text) {
      this.text = text;
    }

    if (this.#isSilent) {
      return this;
    }

    if (!this.#isEnabled) {
      if (this.text) {
        this.#stream.write(`- ${this.text}\n`);
      }

      return this;
    }

    if (this.isSpinning) {
      return this;
    }

    if (this.#options.hideCursor) {
      cliCursor.hide(this.#stream);
    }

    if (this.#options.discardStdin && process.stdin.isTTY) {
      this.#isDiscardingStdin = true;
      stdinDiscarder.start();
    }

    this.render();
    this.#id = setInterval(this.render.bind(this), this.interval);

    return this;
  }

  stop() {
    if (!this.#isEnabled) {
      return this;
    }

    clearInterval(this.#id);
    this.#id = undefined;
    this.#frameIndex = 0;
    this.clear();
    if (this.#options.hideCursor) {
      cliCursor.show(this.#stream);
    }

    if (this.#options.discardStdin && process.stdin.isTTY && this.#isDiscardingStdin) {
      stdinDiscarder.stop();
      this.#isDiscardingStdin = false;
    }

    return this;
  }

  succeed(text?: string): this {
    return this.stopAndPersist({ symbol: success, text });
  }

  fail(text?: string): this {
    return this.stopAndPersist({ symbol: error, text });
  }

  warn(text?: string): this {
    return this.stopAndPersist({ symbol: warning, text });
  }

  info(text?: string): this {
    return this.stopAndPersist({ symbol: info, text });
  }

  stopAndPersist(options: StopAndPersistOptions = {}): this {
    if (this.#isSilent) {
      return this;
    }

    const prefixText = options.prefixText ?? this.#prefixText;
    const fullPrefixText = this.#getFullPrefixText(prefixText, " ");

    const symbolText = options.symbol ?? " ";

    const text = options.text ?? this.text;
    const separatorText = symbolText ? " " : "";
    const fullText = typeof text === "string" ? separatorText + text : "";

    const suffixText = options.suffixText ?? this.#suffixText;
    const fullSuffixText = this.#getFullSuffixText(suffixText, " ");

    const textToWrite = fullPrefixText + symbolText + fullText + fullSuffixText + "\n";

    this.stop();
    this.#stream.write(textToWrite);

    return this;
  }
}

export function ora(options?: string | OraOptions): Ora {
  return new Ora(options);
}

export async function oraPromise<T>(
  action: ((spinner: Ora) => Promise<T>) | Promise<T>,
  options?: string | (OraPromiseOptions<T> & { text?: string | undefined }),
): Promise<T> {
  const actionIsFunction = typeof action === "function";
  const actionIsPromise = !actionIsFunction && typeof (action as Promise<T>).then === "function";

  if (!actionIsFunction && !actionIsPromise) {
    throw new TypeError("Parameter `action` must be a Function or a Promise");
  }

  const { successText, failText } =
    typeof options === "object" ? options : { successText: undefined, failText: undefined };

  const spinnerOptions: OraOptions =
    typeof options === "object" && "text" in options
      ? (options as OraOptions)
      : typeof options === "string"
        ? { text: options }
        : {};

  const spinner = ora(spinnerOptions).start();

  try {
    const promise = actionIsFunction ? action(spinner) : action;
    const result = await promise;

    spinner.succeed(
      successText === undefined
        ? undefined
        : typeof successText === "string"
          ? successText
          : successText(result),
    );

    return result;
  } catch (error) {
    spinner.fail(
      failText === undefined
        ? undefined
        : typeof failText === "string"
          ? failText
          : failText(error),
    );

    throw error;
  }
}

export { default as spinners, randomSpinner } from "cli-spinners";

// LICENSE NOTICE
// Some parts of this file are based on and significantly adapt:
// - https://github.com/sindresorhus/ora/tree/79d0339 – MIT © Sindre Sorhus (sindresorhus)
