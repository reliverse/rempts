/**
 * Environment toggles:
 * - Disable by setting CLI_NO_SPINNER=1 or CLI_NO_COLOR=1
 * - Auto-disables in CI and when not a TTY; override with isEnabled: true
 * - Respect env behavior can be bypassed with respectEnv: false
 * Defaults:
 * - spinner: "dots", color: "cyan", hideCursor: true, discardStdin: true, stream defaults to stderr.
 */

import { re } from "@reliverse/relico";
import cliSpinners, { randomSpinner } from "cli-spinners";
import ora, {
  type Ora,
  type Options as OraOptions,
  type PromiseOptions as OraPromiseOptions,
  oraPromise,
} from "ora";
import prettyBytes from "pretty-bytes";
import prettyMilliseconds from "pretty-ms";

export interface SpinnerOptions extends OraOptions {
  // Allow opting-out via env while still letting explicit isEnabled override
  readonly respectEnv?: boolean;
  // Auto-append timing information to success messages
  readonly showTiming?: boolean;
  // Default success/fail messages when not provided
  readonly defaultSuccess?: string;
  readonly defaultFail?: string;
  // Optional color enhancers via re (string method name or function)
  readonly textColor?: string | ((text: string) => string);
  readonly prefixColor?: string | ((text: string) => string);
  readonly suffixColor?: string | ((text: string) => string);
  readonly successColor?: string | ((text: string) => string);
  readonly failColor?: string | ((text: string) => string);
  readonly theme?: {
    readonly info?: (text: string) => string;
    readonly success?: (text: string) => string;
    readonly error?: (text: string) => string;
    readonly dim?: (text: string) => string;
    readonly progress?: (text: string) => string;
    readonly rate?: (text: string) => string;
    readonly bytes?: (text: string) => string;
    readonly percentage?: (text: string) => string;
  };
}

export interface SpinnerGroupOptions extends SpinnerOptions {
  readonly items: readonly string[];
  readonly concurrent?: boolean;
}

export interface FileProgressOptions {
  readonly totalBytes?: number;
  readonly showBytes?: boolean;
  readonly showRate?: boolean;
}

export type SimpleSpinner = Ora;
function isColorsEnabled(isSpinnerEnabledFlag: boolean): boolean {
  if (process.env["CLI_NO_COLOR"] === "1") return false;
  return isSpinnerEnabledFlag;
}

function toStyler(
  input: string | ((text: string) => string) | undefined,
  fallback: (text: string) => string,
): (text: string) => string {
  if (!input) return fallback;
  if (typeof input === "function") return input;
  const fn = (re as unknown as Record<string, unknown>)[input];
  if (typeof fn === "function") return fn as (text: string) => string;
  return fallback;
}

const identity = (s: string) => s;

function isCIEnvironment(): boolean {
  const { CI, GITHUB_ACTIONS, BUILD_NUMBER, RUN_ID } = process.env;
  return (
    CI === "true" ||
    GITHUB_ACTIONS === "true" ||
    typeof BUILD_NUMBER !== "undefined" ||
    typeof RUN_ID !== "undefined"
  );
}

const defaultStderr: NodeJS.WriteStream = process.stderr as unknown as NodeJS.WriteStream;

function isInteractive(stream: NodeJS.WriteStream = defaultStderr): boolean {
  return Boolean(stream && (stream as NodeJS.WriteStream).isTTY);
}

function getDefaultEnabled(stream: NodeJS.WriteStream = defaultStderr): boolean {
  const disabledByEnv =
    process.env["CLI_NO_SPINNER"] === "1" || process.env["CLI_NO_COLOR"] === "1";
  if (disabledByEnv) return false;
  if (isCIEnvironment()) return false;
  return isInteractive(stream);
}

export const defaultSpinnerOptions: Readonly<SpinnerOptions> = {
  color: "cyan",
  spinner: "dots",
  hideCursor: true,
  indent: 0,
  discardStdin: true,
  respectEnv: true,
  showTiming: false,
};

export function isSpinnerEnabled(options?: {
  stream?: NodeJS.WriteStream;
  respectEnv?: boolean;
  isEnabled?: boolean;
}): boolean {
  const stream = (options?.stream as NodeJS.WriteStream | undefined) ?? defaultStderr;
  const respectEnv = options?.respectEnv !== false;
  if (typeof options?.isEnabled === "boolean") return options.isEnabled;
  return respectEnv ? getDefaultEnabled(stream) : true;
}

export function createSpinner(input?: string | SpinnerOptions): SimpleSpinner {
  const base: SpinnerOptions = typeof input === "string" ? { text: input } : { ...(input ?? {}) };

  const stream: NodeJS.WriteStream =
    (base.stream as NodeJS.WriteStream | undefined) ?? defaultStderr;
  const respectEnv = base.respectEnv !== false; // default true
  const isEnabled = base.isEnabled ?? (respectEnv ? getDefaultEnabled(stream) : true);
  const isSilent = base.isSilent ?? false;

  const resolvedColor = (base.color ?? defaultSpinnerOptions.color ?? "cyan") as NonNullable<
    OraOptions["color"]
  >;
  const resolvedSpinner = (base.spinner ?? defaultSpinnerOptions.spinner ?? "dots") as NonNullable<
    OraOptions["spinner"]
  >;
  const resolvedHideCursor = base.hideCursor ?? defaultSpinnerOptions.hideCursor ?? true;
  const resolvedIndent = base.indent ?? defaultSpinnerOptions.indent ?? 0;
  const resolvedDiscardStdin = base.discardStdin ?? defaultSpinnerOptions.discardStdin ?? true;

  const options = {
    // Defaults chosen to be broadly useful; callers can override
    color: resolvedColor,
    hideCursor: resolvedHideCursor,
    indent: resolvedIndent,
    stream,
    isEnabled,
    isSilent,
    discardStdin: resolvedDiscardStdin,
    ...(resolvedSpinner !== undefined ? { spinner: resolvedSpinner } : {}),
    ...(base.interval !== undefined ? { interval: base.interval } : {}),
    ...(base.prefixText !== undefined ? { prefixText: base.prefixText } : {}),
    ...(base.suffixText !== undefined ? { suffixText: base.suffixText } : {}),
    ...(base.text !== undefined ? { text: base.text } : {}),
  } satisfies OraOptions;

  const spinner = ora(options);

  // Attach color-aware helpers on the spinner instance for internal usage
  const colorsEnabled = isColorsEnabled(isEnabled);
  const themeObj = base.theme ?? {};
  const dim = colorsEnabled ? (themeObj.dim ?? (re as any).dim ?? identity) : identity;
  const info = colorsEnabled ? (themeObj.info ?? (re as any).cyan ?? identity) : identity;
  const success = colorsEnabled ? (themeObj.success ?? (re as any).green ?? identity) : identity;
  const error = colorsEnabled ? (themeObj.error ?? (re as any).red ?? identity) : identity;
  const progress = colorsEnabled ? (themeObj.progress ?? (re as any).cyan ?? identity) : identity;
  const rate = colorsEnabled ? (themeObj.rate ?? (re as any).cyan ?? identity) : identity;
  const bytesColor = colorsEnabled ? (themeObj.bytes ?? (re as any).cyan ?? identity) : identity;
  const percent = colorsEnabled
    ? (themeObj.percentage ?? (re as any).yellow ?? identity)
    : identity;

  // Store helpers for use by other exported functions
  (spinner as any).__reTheme = { dim, info, success, error, progress, rate, bytesColor, percent };
  (spinner as any).__textStyler = toStyler(base.textColor, info);
  (spinner as any).__prefixStyler = toStyler(base.prefixColor, identity);
  (spinner as any).__suffixStyler = toStyler(base.suffixColor, identity);
  (spinner as any).__successStyler = toStyler(base.successColor, success);
  (spinner as any).__failStyler = toStyler(base.failColor, error);

  // If initial text provided, colorize once
  if ((options as any).text) {
    const style = (spinner as any).__textStyler as (s: string) => string;
    spinner.text = style((options as any).text as string);
  }

  return spinner;
}

export async function withSpinnerPromise<T>(
  action: Promise<T> | ((spinner: Ora) => Promise<T>),
  options?: string | (OraPromiseOptions<T> & SpinnerOptions),
): Promise<T> {
  return oraPromise<T>(
    action as Promise<T> | ((spinner: Ora) => Promise<T>),
    options as OraPromiseOptions<T> | string,
  );
}

export async function withSpinner<T>(
  textOrOptions: string | SpinnerOptions,
  action: (spinner: Ora) => Promise<T>,
  onSuccessText?: string | ((result: T) => string),
  onFailText?: string | ((error: Error) => string),
): Promise<T> {
  const startTime = Date.now();
  const options = typeof textOrOptions === "string" ? { text: textOrOptions } : textOrOptions;
  const spinner = createSpinner(textOrOptions).start();

  try {
    const result = await action(spinner);
    const successMsg = getSuccessMessage(result, onSuccessText, options, startTime);
    const style =
      ((spinner as any).__successStyler as ((s: string) => string) | undefined) ?? identity;
    spinner.succeed(successMsg ? style(successMsg) : undefined);
    return result;
  } catch (error) {
    const err = error as Error;
    const failMsg = getFailMessage(err, onFailText, options);
    const style =
      ((spinner as any).__failStyler as ((s: string) => string) | undefined) ?? identity;
    spinner.fail(failMsg ? style(failMsg) : undefined);
    throw err;
  }
}

function getSuccessMessage<T>(
  result: T,
  onSuccessText: string | ((result: T) => string) | undefined,
  options: SpinnerOptions,
  startTime: number,
): string | undefined {
  let message: string | undefined;

  if (typeof onSuccessText === "function") {
    message = onSuccessText(result);
  } else if (typeof onSuccessText === "string") {
    message = onSuccessText;
  } else if (options.defaultSuccess) {
    message = options.defaultSuccess;
  }

  if (options.showTiming && message) {
    const elapsed = Date.now() - startTime;
    const timing = prettyMilliseconds(elapsed, { compact: true });
    message = `${message} (${timing})`;
  }

  return message;
}

function getFailMessage(
  error: Error,
  onFailText: string | ((error: Error) => string) | undefined,
  options: SpinnerOptions,
): string | undefined {
  if (typeof onFailText === "function") {
    return onFailText(error);
  } else if (typeof onFailText === "string") {
    return onFailText;
  } else if (options.defaultFail) {
    return options.defaultFail;
  }
}

// === Additional utility functions ===

/**
 * Update spinner text with optional prefix/suffix
 */
export function updateSpinnerText(
  spinner: SimpleSpinner,
  text: string,
  options?: { prefix?: string; suffix?: string },
): void {
  const { prefix, suffix } = options ?? {};
  const styleText =
    ((spinner as any).__textStyler as ((s: string) => string) | undefined) ?? identity;
  const stylePrefix =
    ((spinner as any).__prefixStyler as ((s: string) => string) | undefined) ?? identity;
  const styleSuffix =
    ((spinner as any).__suffixStyler as ((s: string) => string) | undefined) ?? identity;

  const prefixStyled = prefix ? stylePrefix(prefix) : "";
  const suffixStyled = suffix ? styleSuffix(suffix) : "";
  const fullText = `${prefixStyled}${styleText(text)}${suffixStyled}`;
  spinner.text = fullText;
}

/**
 * Stop spinner and persist with custom symbol and text
 */
export function stopAndPersist(
  spinner: SimpleSpinner,
  options: {
    symbol?: string;
    text?: string;
    prefixText?: string | (() => string);
    suffixText?: string | (() => string);
  },
): void {
  spinner.stopAndPersist({
    symbol: options.symbol ?? " ",
    text: options.text ?? spinner.text,
    prefixText: options.prefixText ?? spinner.prefixText,
    suffixText: options.suffixText ?? spinner.suffixText,
  });
}

/**
 * Create a spinner with timing that automatically shows elapsed time
 */
export function createTimedSpinner(input?: string | Omit<SpinnerOptions, "showTiming">): {
  spinner: SimpleSpinner;
  getElapsed: () => number;
  succeedWithTiming: (text?: string) => void;
  failWithTiming: (text?: string) => void;
} {
  const startTime = Date.now();
  const options = typeof input === "string" ? { text: input } : { ...(input ?? {}) };
  const spinner = createSpinner({ ...options, showTiming: true });

  return {
    spinner,
    getElapsed: () => Date.now() - startTime,
    succeedWithTiming: (text?: string) => {
      const elapsed = Date.now() - startTime;
      const timing = prettyMilliseconds(elapsed, { compact: true });
      const dim =
        ((spinner as any).__reTheme?.dim as ((s: string) => string) | undefined) ?? identity;
      const successStyle =
        ((spinner as any).__successStyler as ((s: string) => string) | undefined) ?? identity;
      const message = text ? `${successStyle(text)} ${dim(`(${timing})`)}` : undefined;
      spinner.succeed(message);
    },
    failWithTiming: (text?: string) => {
      const elapsed = Date.now() - startTime;
      const timing = prettyMilliseconds(elapsed, { compact: true });
      const dim =
        ((spinner as any).__reTheme?.dim as ((s: string) => string) | undefined) ?? identity;
      const failStyle =
        ((spinner as any).__failStyler as ((s: string) => string) | undefined) ?? identity;
      const message = text ? `${failStyle(text)} ${dim(`(failed after ${timing})`)}` : undefined;
      spinner.fail(message);
    },
  };
}

/**
 * Create multiple spinners for concurrent operations
 */
export function createSpinnerGroup(options: SpinnerGroupOptions): {
  spinners: SimpleSpinner[];
  updateAll: (text: string) => void;
  succeedAll: (text?: string) => void;
  failAll: (text?: string) => void;
  stopAll: () => void;
} {
  const { items, concurrent = false, ...baseOptions } = options;

  const spinners = items.map((item, index) => {
    const spinnerOptions = {
      ...baseOptions,
      text: item,
      indent: (baseOptions.indent ?? 0) + (concurrent ? 0 : index * 2),
    };
    return createSpinner(spinnerOptions);
  });

  return {
    spinners,
    updateAll: (text: string) => {
      for (const spinner of spinners) {
        updateSpinnerText(spinner, text);
      }
    },
    succeedAll: (text?: string) => {
      for (const spinner of spinners) {
        const style =
          ((spinner as any).__successStyler as ((s: string) => string) | undefined) ?? identity;
        spinner.succeed(text ? style(text) : undefined);
      }
    },
    failAll: (text?: string) => {
      for (const spinner of spinners) {
        const style =
          ((spinner as any).__failStyler as ((s: string) => string) | undefined) ?? identity;
        spinner.fail(text ? style(text) : undefined);
      }
    },
    stopAll: () => {
      for (const spinner of spinners) {
        spinner.stop();
      }
    },
  };
}

/**
 * Enhanced withSpinner that includes common patterns used in the codebase
 */
export async function withEnhancedSpinner<T>(
  textOrOptions:
    | string
    | (SpinnerOptions & {
        successText?: string;
        failText?: string;
        showTiming?: boolean;
      }),
  action: (
    spinner: SimpleSpinner & {
      updateText: (text: string, options?: { prefix?: string; suffix?: string }) => void;
      setProgress: (current: number, total: number, text?: string) => void;
    },
  ) => Promise<T>,
): Promise<T> {
  const startTime = Date.now();
  const options =
    typeof textOrOptions === "string"
      ? { text: textOrOptions, showTiming: false }
      : { showTiming: false, ...textOrOptions };

  const baseSpinner = createSpinner(options).start();

  // Enhanced spinner with additional methods
  const enhancedSpinner = Object.assign(baseSpinner, {
    updateText: (text: string, updateOptions?: { prefix?: string; suffix?: string }) => {
      updateSpinnerText(baseSpinner, text, updateOptions);
    },
    setProgress: (current: number, total: number, text?: string) => {
      const progressText = text ? `${text} (${current}/${total})` : `${current}/${total}`;
      baseSpinner.text = progressText;
    },
  });

  try {
    const result = await action(enhancedSpinner);

    let successText = options.successText;
    if (options.showTiming && successText) {
      const elapsed = Date.now() - startTime;
      const timing = prettyMilliseconds(elapsed, { compact: true });
      successText = `${successText} (${timing})`;
    }

    baseSpinner.succeed(successText);
    return result;
  } catch (error) {
    const err = error as Error;
    let failText = options.failText;

    if (options.showTiming && failText) {
      const elapsed = Date.now() - startTime;
      const timing = prettyMilliseconds(elapsed, { compact: true });
      failText = `${failText} (failed after ${timing})`;
    }

    baseSpinner.fail(failText);
    throw err;
  }
}

/**
 * Check if a spinner is currently running
 */
export function isSpinnerRunning(spinner: SimpleSpinner): boolean {
  return spinner.isSpinning;
}

/**
 * Safely stop a spinner if it's running
 */
export function safeStopSpinner(spinner: SimpleSpinner | null): void {
  if (spinner?.isSpinning) {
    spinner.stop();
  }
}

/**
 * Create a spinner that automatically handles common build/publish patterns
 */
export function createBuildSpinner(
  operation: string,
  options?: Omit<SpinnerOptions, "text">,
): {
  spinner: SimpleSpinner;
  complete: (message?: string) => void;
  error: (error: Error | string) => void;
  updateProgress: (step: string) => void;
} {
  const spinner = createSpinner({ text: operation, ...options }).start();

  return {
    spinner,
    complete: (message?: string) => {
      const successStyle =
        ((spinner as any).__successStyler as ((s: string) => string) | undefined) ?? identity;
      spinner.succeed(successStyle(message ?? `${operation} completed successfully!`));
    },
    error: (error: Error | string) => {
      const errorMessage = typeof error === "string" ? error : error.message;
      const failStyle =
        ((spinner as any).__failStyler as ((s: string) => string) | undefined) ?? identity;
      spinner.fail(failStyle(`${operation} failed: ${errorMessage}`));
    },
    updateProgress: (step: string) => {
      const info =
        ((spinner as any).__reTheme?.info as ((s: string) => string) | undefined) ?? identity;
      updateSpinnerText(spinner, `${operation} - ${info(step)}`);
    },
  };
}

/**
 * Create a spinner with file progress tracking
 */
export function createFileProgressSpinner(
  operation: string,
  options?: SpinnerOptions & FileProgressOptions,
): {
  spinner: SimpleSpinner;
  updateProgress: (bytesProcessed: number, fileName?: string) => void;
  updateRate: (bytesPerSecond: number) => void;
  complete: (message?: string) => void;
  error: (error: Error | string) => void;
} {
  const { totalBytes, showBytes = true, showRate = false, ...spinnerOptions } = options ?? {};
  const startTime = Date.now();

  const spinner = createSpinner({ text: operation, ...spinnerOptions }).start();

  return {
    spinner,
    updateProgress: (bytesProcessed: number, fileName?: string) => {
      let progressText = operation;

      if (fileName) {
        const info =
          ((spinner as any).__reTheme?.info as ((s: string) => string) | undefined) ?? identity;
        progressText += ` - ${info(fileName)}`;
      }

      if (showBytes) {
        if (totalBytes) {
          const percentage = Math.round((bytesProcessed / totalBytes) * 100);
          const bytesColor =
            ((spinner as any).__reTheme?.bytesColor as ((s: string) => string) | undefined) ??
            identity;
          const percent =
            ((spinner as any).__reTheme?.percent as ((s: string) => string) | undefined) ??
            identity;
          progressText += ` (${bytesColor(prettyBytes(bytesProcessed))}/${bytesColor(prettyBytes(totalBytes))} - ${percent(`${percentage}%`)})`;
        } else {
          const bytesColor =
            ((spinner as any).__reTheme?.bytesColor as ((s: string) => string) | undefined) ??
            identity;
          progressText += ` (${bytesColor(prettyBytes(bytesProcessed))})`;
        }
      }

      spinner.text = progressText;
    },
    updateRate: (bytesPerSecond: number) => {
      if (showRate) {
        const currentText = spinner.text;
        const rate =
          ((spinner as any).__reTheme?.rate as ((s: string) => string) | undefined) ?? identity;
        const rateText = rate(`${prettyBytes(bytesPerSecond)}/s`);
        spinner.text = `${currentText} @ ${rateText}`;
      }
    },
    complete: (message?: string) => {
      const elapsed = Date.now() - startTime;
      const timing = prettyMilliseconds(elapsed, { compact: true });
      const dim =
        ((spinner as any).__reTheme?.dim as ((s: string) => string) | undefined) ?? identity;
      const successStyle =
        ((spinner as any).__successStyler as ((s: string) => string) | undefined) ?? identity;
      const successMessage = successStyle(message ?? `${operation} completed successfully`);
      spinner.succeed(`${successMessage} ${dim(`(${timing})`)}`);
    },
    error: (error: Error | string) => {
      const elapsed = Date.now() - startTime;
      const timing = prettyMilliseconds(elapsed, { compact: true });
      const errorMessage = typeof error === "string" ? error : error.message;
      const dim =
        ((spinner as any).__reTheme?.dim as ((s: string) => string) | undefined) ?? identity;
      const failStyle =
        ((spinner as any).__failStyler as ((s: string) => string) | undefined) ?? identity;
      spinner.fail(
        `${failStyle(`${operation} failed: ${errorMessage}`)} ${dim(`(after ${timing})`)}`,
      );
    },
  };
}

/**
 * Create a multi-step operation spinner with automatic timing
 */
export function createMultiStepSpinner(
  operationName: string,
  steps: readonly string[],
  options?: SpinnerOptions,
): {
  spinner: SimpleSpinner;
  nextStep: (stepIndex?: number) => void;
  complete: (message?: string) => void;
  error: (error: Error | string, stepIndex?: number) => void;
  getCurrentStep: () => number;
} {
  const startTime = Date.now();
  let currentStepIndex = 0;
  const totalSteps = steps.length;

  const getStepText = (stepIndex: number) => {
    const step = steps[stepIndex];
    return `${operationName} - ${step} (${stepIndex + 1}/${totalSteps})`;
  };

  const spinner = createSpinner({ text: getStepText(0), ...options }).start();

  return {
    spinner,
    nextStep: (stepIndex?: number) => {
      if (stepIndex !== undefined) {
        currentStepIndex = Math.min(stepIndex, totalSteps - 1);
      } else {
        currentStepIndex = Math.min(currentStepIndex + 1, totalSteps - 1);
      }
      const text = getStepText(currentStepIndex);
      updateSpinnerText(spinner, text);
    },
    complete: (message?: string) => {
      const elapsed = Date.now() - startTime;
      const timing = prettyMilliseconds(elapsed, { compact: true });
      const dim =
        ((spinner as any).__reTheme?.dim as ((s: string) => string) | undefined) ?? identity;
      const successStyle =
        ((spinner as any).__successStyler as ((s: string) => string) | undefined) ?? identity;
      const successMessage = successStyle(message ?? `${operationName} completed successfully`);
      spinner.succeed(`${successMessage} ${dim(`(${timing})`)}`);
    },
    error: (error: Error | string, stepIndex?: number) => {
      const elapsed = Date.now() - startTime;
      const timing = prettyMilliseconds(elapsed, { compact: true });
      const errorMessage = typeof error === "string" ? error : error.message;
      const stepInfo = stepIndex !== undefined ? ` at step ${stepIndex + 1}` : "";
      const dim =
        ((spinner as any).__reTheme?.dim as ((s: string) => string) | undefined) ?? identity;
      const failStyle =
        ((spinner as any).__failStyler as ((s: string) => string) | undefined) ?? identity;
      spinner.fail(
        `${failStyle(`${operationName} failed${stepInfo}: ${errorMessage}`)} ${dim(`(after ${timing})`)}`,
      );
    },
    getCurrentStep: () => currentStepIndex,
  };
}

/**
 * Enhanced timing utility using pretty-ms
 */
export function formatSpinnerTiming(startTime: number, options?: { verbose?: boolean }): string {
  const elapsed = Date.now() - startTime;
  const pmOptions: Record<string, unknown> = { compact: !options?.verbose };
  if (options?.verbose !== undefined) pmOptions["verbose"] = options.verbose;
  return prettyMilliseconds(elapsed, pmOptions as Parameters<typeof prettyMilliseconds>[1]);
}

/**
 * Format bytes for spinner display using pretty-bytes
 */
export function formatSpinnerBytes(bytes: number, options?: { binary?: boolean }): string {
  return prettyBytes(bytes, options);
}

/**
 * Format elapsed time for spinner display using pretty-ms
 */
export function formatSpinnerElapsed(elapsed: number, options?: { verbose?: boolean }): string {
  const pmOptions: Record<string, unknown> = { compact: !options?.verbose };
  if (options?.verbose !== undefined) pmOptions["verbose"] = options.verbose;
  return prettyMilliseconds(elapsed, pmOptions as Parameters<typeof prettyMilliseconds>[1]);
}

/**
 * Create a spinner for download/upload operations with byte tracking
 */
export function createTransferSpinner(
  operation: string,
  options?: SpinnerOptions & {
    totalBytes?: number;
    showRate?: boolean;
  },
): {
  spinner: SimpleSpinner;
  updateBytes: (bytesTransferred: number, fileName?: string) => void;
  updateRate: (bytesPerSecond: number) => void;
  complete: (message?: string, totalBytesTransferred?: number) => void;
  error: (error: Error | string) => void;
} {
  const { totalBytes, showRate = true, ...spinnerOptions } = options ?? {};
  const startTime = Date.now();

  const spinner = createSpinner({ text: operation, ...spinnerOptions }).start();

  return {
    spinner,
    updateBytes: (bytesTransferred: number, fileName?: string) => {
      let text = operation;

      if (fileName) {
        const info =
          ((spinner as any).__reTheme?.info as ((s: string) => string) | undefined) ?? identity;
        text += ` - ${info(fileName)}`;
      }

      if (totalBytes) {
        const percentage = Math.round((bytesTransferred / totalBytes) * 100);
        const bytesColor =
          ((spinner as any).__reTheme?.bytesColor as ((s: string) => string) | undefined) ??
          identity;
        const percent =
          ((spinner as any).__reTheme?.percent as ((s: string) => string) | undefined) ?? identity;
        text += ` (${bytesColor(prettyBytes(bytesTransferred))}/${bytesColor(prettyBytes(totalBytes))} - ${percent(`${percentage}%`)})`;
      } else {
        const bytesColor =
          ((spinner as any).__reTheme?.bytesColor as ((s: string) => string) | undefined) ??
          identity;
        text += ` (${bytesColor(prettyBytes(bytesTransferred))})`;
      }

      spinner.text = text;
    },
    updateRate: (bytesPerSecond: number) => {
      if (showRate) {
        const currentText = spinner.text;
        const rate =
          ((spinner as any).__reTheme?.rate as ((s: string) => string) | undefined) ?? identity;
        const rateText = rate(`${prettyBytes(bytesPerSecond)}/s`);
        spinner.text = `${currentText} @ ${rateText}`;
      }
    },
    complete: (message?: string, totalBytesTransferred?: number) => {
      const elapsed = Date.now() - startTime;
      const timing = prettyMilliseconds(elapsed, { compact: true });

      const dim =
        ((spinner as any).__reTheme?.dim as ((s: string) => string) | undefined) ?? identity;
      const successStyle =
        ((spinner as any).__successStyler as ((s: string) => string) | undefined) ?? identity;
      let successMessage = successStyle(message ?? `${operation} completed successfully`);
      if (totalBytesTransferred) {
        const bytesColor =
          ((spinner as any).__reTheme?.bytesColor as ((s: string) => string) | undefined) ??
          identity;
        successMessage += ` (${bytesColor(prettyBytes(totalBytesTransferred))})`;
      }
      successMessage += ` ${dim(`in ${timing}`)}`;

      spinner.succeed(successMessage);
    },
    error: (error: Error | string) => {
      const elapsed = Date.now() - startTime;
      const timing = prettyMilliseconds(elapsed, { compact: true });
      const errorMessage = typeof error === "string" ? error : error.message;
      const dim =
        ((spinner as any).__reTheme?.dim as ((s: string) => string) | undefined) ?? identity;
      const failStyle =
        ((spinner as any).__failStyler as ((s: string) => string) | undefined) ?? identity;
      spinner.fail(
        `${failStyle(`${operation} failed: ${errorMessage}`)} ${dim(`(after ${timing})`)}`,
      );
    },
  };
}

export const spinners = cliSpinners;
export { randomSpinner, prettyBytes, prettyMilliseconds };
