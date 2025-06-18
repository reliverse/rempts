import { re } from "@reliverse/relico";

import { block } from "~/libs/cancel/cancel.js";

interface SpinnerOptions {
  cancelMessage?: string;
  color?: string;
  delay?: number;
  errorMessage?: string;
  failText?: string;
  frames?: string[];
  hideCursor?: boolean;
  indicator?: "dots" | "timer";
  onCancel?: () => void;
  prefixText?: string;
  signal?: AbortSignal;
  silent?: boolean;
  spinner?: string;
  successText?: string;
  text: string;
}

interface ProgressOptions {
  current: number;
  total: number;
  format?: "percentage" | "count" | "both";
}

interface SpinnerControls {
  start: (text?: string) => SpinnerControls;
  stop: (text?: string, code?: number) => void;
  setText: (text: string) => void;
  setProgress: (progress: ProgressOptions) => void;
  succeed: (text?: string) => void;
  fail: (text?: string) => void;
  warn: (text?: string) => void;
  info: (text?: string) => void;
  isSpinning: () => boolean;
  clear: () => void;
  getElapsedTime: () => number;
  pause: () => void;
  resume: () => void;
  dispose: () => void;
  isCancelled: boolean;
}

interface SpinnerState {
  isActive: boolean;
  isPaused: boolean;
  startTime: number | null;
  pausedTime: number;
  text: string;
  isCancelled: boolean;
  prevMessage?: string;
  origin: number;
  indicatorTimer: number;
}

const unicode =
  process.platform !== "win32" || process.env.TERM_PROGRAM === "vscode";
const defaultFrames = unicode ? ["◒", "◐", "◓", "◑"] : ["•", "o", "O", "0"];
const defaultDelay = unicode ? 80 : 120;

/**
 * Detects if the environment supports interactive spinners
 */
function isInteractive(): boolean {
  return (
    process.stdout.isTTY &&
    !process.env.CI &&
    !process.env.GITHUB_ACTIONS &&
    !process.env.GITLAB_CI &&
    !process.env.BUILDKITE &&
    process.env.TERM !== "dumb"
  );
}

/**
 * Formats progress information
 */
function formatProgress(options: ProgressOptions): string {
  const { current, total, format = "both" } = options;
  const percentage = Math.round((current / total) * 100);

  switch (format) {
    case "percentage":
      return `${percentage}%`;
    case "count":
      return `${current}/${total}`;
    case "both":
      return `${current}/${total} (${percentage}%)`;
    default:
      return `${current}/${total}`;
  }
}

/**
 * Formats timer information
 */
function formatTimer(origin: number): string {
  const duration = (performance.now() - origin) / 1000;
  const min = Math.floor(duration / 60);
  const secs = Math.floor(duration % 60);
  return min > 0 ? `[${min}m ${secs}s]` : `[${secs}s]`;
}

/**
 * Removes trailing dots from a message
 */
function removeTrailingDots(msg: string): string {
  return msg.replace(/\.+$/, "");
}

/**
 * Creates a terminal spinner with enhanced controls and styling options.
 *
 * @example
 * ```typescript
 * // Basic usage
 * const spinner = useSpinner({ text: "Loading..." }).start();
 * spinner.stop();
 *
 * // With progress tracking
 * const spinner = useSpinner({ text: "Processing files..." }).start();
 * for (let i = 0; i < files.length; i++) {
 *   spinner.setProgress({ current: i + 1, total: files.length });
 *   await processFile(files[i]);
 * }
 * spinner.succeed();
 *
 * // With custom color and spinner
 * const spinner = useSpinner({
 *   text: "Processing...",
 *   color: "cyan",
 *   spinner: "dots"
 * }).start();
 *
 * // With success/failure states
 * const spinner = useSpinner({
 *   text: "Uploading...",
 *   successText: "Upload complete!",
 *   failText: "Upload failed!"
 * }).start();
 * try {
 *   await uploadFile();
 *   spinner.succeed();
 * } catch (error) {
 *   spinner.fail();
 * }
 *
 * // Using the wrapper for async operations
 * await useSpinner.promise(
 *   async (spinner) => {
 *     await longOperation();
 *     spinner.setProgress({ current: 50, total: 100 });
 *   },
 *   {
 *     text: "Working...",
 *     successText: "Done!",
 *     failText: "Failed!"
 *   }
 * );
 * ```
 */
export function useSpinner(options: SpinnerOptions): SpinnerControls {
  let loop: NodeJS.Timeout;
  const interactive = isInteractive();
  let unblock: (() => void) | null = null;

  const state: SpinnerState = {
    isActive: false,
    isPaused: false,
    startTime: null,
    pausedTime: 0,
    text: options.text,
    isCancelled: false,
    origin: performance.now(),
    indicatorTimer: 0,
  };

  const handleExit = (code: number) => {
    const msg =
      code > 1
        ? (options.errorMessage ?? "Operation failed")
        : (options.cancelMessage ?? "Operation cancelled");
    state.isCancelled = code === 1;
    if (state.isActive) {
      controls.stop(msg, code);
      if (state.isCancelled && typeof options.onCancel === "function") {
        options.onCancel();
      }
    }
  };

  const errorEventHandler = () => handleExit(2);
  const signalEventHandler = () => handleExit(1);

  const registerHooks = () => {
    process.on("uncaughtExceptionMonitor", errorEventHandler);
    process.on("unhandledRejection", errorEventHandler);
    process.on("SIGINT", signalEventHandler);
    process.on("SIGTERM", signalEventHandler);
    process.on("exit", handleExit);

    if (options.signal) {
      options.signal.addEventListener("abort", signalEventHandler);
    }
  };

  const clearHooks = () => {
    process.removeListener("uncaughtExceptionMonitor", errorEventHandler);
    process.removeListener("unhandledRejection", errorEventHandler);
    process.removeListener("SIGINT", signalEventHandler);
    process.removeListener("SIGTERM", signalEventHandler);
    process.removeListener("exit", handleExit);

    if (options.signal) {
      options.signal.removeEventListener("abort", signalEventHandler);
    }
  };

  const clearPrevMessage = () => {
    if (state.prevMessage === undefined) return;
    if (process.env.CI) process.stdout.write("\n");
    const prevLines = state.prevMessage.split("\n");
    process.stdout.write(`\x1b[${prevLines.length}A`);
    process.stdout.write("\x1b[0J");
  };

  const controls: SpinnerControls = {
    start: (text?: string) => {
      if (text) {
        options.text = text;
        state.text = text;
      }

      if (options.silent || !interactive) {
        console.log(
          options.prefixText
            ? `${options.prefixText} ${options.text}`
            : options.text,
        );
        state.isActive = true;
        state.startTime = Date.now();
        return controls;
      }

      state.isActive = true;
      state.origin = performance.now();
      unblock = block({ output: process.stdout });
      process.stdout.write(`${re.dim("│")}\n`);

      let frameIndex = 0;
      registerHooks();

      loop = setInterval(() => {
        if (process.env.CI && state.text === state.prevMessage) {
          return;
        }

        clearPrevMessage();
        state.prevMessage = state.text;
        const frame = re.magenta(
          (options.frames ?? defaultFrames)[frameIndex] ?? "",
        );

        if (process.env.CI) {
          process.stdout.write(`${frame}  ${state.text}...`);
        } else if (options.indicator === "timer") {
          process.stdout.write(
            `${frame}  ${state.text} ${formatTimer(state.origin)}`,
          );
        } else {
          const loadingDots = "."
            .repeat(Math.floor(state.indicatorTimer))
            .slice(0, 3);
          process.stdout.write(`${frame}  ${state.text}${loadingDots}`);
        }

        frameIndex =
          (frameIndex + 1) % (options.frames ?? defaultFrames).length;
        state.indicatorTimer =
          state.indicatorTimer < 4 ? state.indicatorTimer + 0.125 : 0;
      }, options.delay ?? defaultDelay);

      return controls;
    },

    stop: (text?: string, code = 0) => {
      if (!state.isActive) return;

      state.isActive = false;
      clearInterval(loop);
      clearPrevMessage();

      const step =
        code === 0 ? re.green("✓") : code === 1 ? re.red("✗") : re.red("✗");

      const finalText = text ?? state.text;
      if (options.indicator === "timer") {
        process.stdout.write(
          `${step}  ${finalText} ${formatTimer(state.origin)}\n`,
        );
      } else {
        process.stdout.write(`${step}  ${finalText}\n`);
      }

      clearHooks();
      if (unblock) unblock();
    },

    setText: (text: string) => {
      state.text = removeTrailingDots(text);
      options.text = text;
    },

    setProgress: (progress: ProgressOptions) => {
      const progressText = formatProgress(progress);
      const newText = `${state.text} [${progressText}]`;
      state.text = newText;
      options.text = newText;
    },

    succeed: (text?: string) => {
      const successText = text ?? options.successText ?? state.text;
      controls.stop(successText, 0);
    },

    fail: (text?: string) => {
      const failText = text ?? options.failText ?? state.text;
      controls.stop(failText, 2);
    },

    warn: (text?: string) => {
      const warnText = text ?? state.text;
      controls.stop(warnText, 0);
    },

    info: (text?: string) => {
      const infoText = text ?? state.text;
      controls.stop(infoText, 0);
    },

    isSpinning: () => {
      return state.isActive && !state.isPaused;
    },

    clear: () => {
      clearPrevMessage();
    },

    getElapsedTime: () => {
      if (!state.startTime) return 0;
      const currentTime = Date.now();
      return currentTime - state.startTime - state.pausedTime;
    },

    pause: () => {
      if (state.isActive && !state.isPaused) {
        clearInterval(loop);
        state.isPaused = true;
      }
    },

    resume: () => {
      if (state.isActive && state.isPaused) {
        loop = setInterval(() => {
          // ... same interval logic as in start()
        }, options.delay ?? defaultDelay);
        state.isPaused = false;
      }
    },

    dispose: () => {
      if (state.isActive) {
        controls.stop();
      }
      state.isActive = false;
      state.isPaused = false;
    },

    get isCancelled() {
      return state.isCancelled;
    },
  };

  return controls;
}

/**
 * A wrapper for async operations that manages spinner state automatically.
 *
 * @param operation - The async operation to perform (receives spinner controls as parameter)
 * @param options - Spinner options
 * @returns The result of the operation
 */
useSpinner.promise = async <T>(
  operation: (spinner: SpinnerControls) => Promise<T>,
  options: SpinnerOptions,
): Promise<T> => {
  const spinner = useSpinner(options).start();

  try {
    const result = await operation(spinner);
    spinner.succeed();
    return result;
  } catch (error) {
    spinner.fail();
    throw error;
  } finally {
    spinner.dispose();
  }
};

/**
 * Creates a hierarchical spinner that can manage multiple child operations
 */
useSpinner.nested = (parentOptions: SpinnerOptions) => {
  const parentSpinner = useSpinner({
    ...parentOptions,
    silent: true, // Parent is silent, children will show progress
  });

  return {
    start: () => {
      parentSpinner.start();
      return {
        child: (childOptions: SpinnerOptions) => useSpinner(childOptions),
        finish: (success: boolean, text?: string) => {
          if (success) {
            parentSpinner.succeed(text);
          } else {
            parentSpinner.fail(text);
          }
        },
        dispose: () => parentSpinner.dispose(),
      };
    },
  };
};

/**
 * Utility for measuring operation performance with spinner
 */
useSpinner.withTiming = async <T>(
  operation: (spinner: SpinnerControls) => Promise<T>,
  options: SpinnerOptions,
): Promise<{ result: T; duration: number }> => {
  const spinner = useSpinner(options).start();
  const startTime = Date.now();

  try {
    const result = await operation(spinner);
    const duration = Date.now() - startTime;
    spinner.succeed(`${options.successText || options.text} (${duration}ms)`);
    return { result, duration };
  } catch (error) {
    const duration = Date.now() - startTime;
    spinner.fail(
      `${options.failText || options.text} (failed after ${duration}ms)`,
    );
    throw error;
  } finally {
    spinner.dispose();
  }
};
