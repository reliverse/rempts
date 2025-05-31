import ora, { type Ora, type Color, type Options as OraOptions } from "ora";

type SpinnerOptions = {
  text: string;
  color?: Color;
  spinner?: OraOptions["spinner"];
  successText?: string;
  failText?: string;
};

type SpinnerControls = {
  start: (text?: string) => SpinnerControls;
  stop: () => void;
  setText: (text: string) => void;
  succeed: (text?: string) => void;
  fail: (text?: string) => void;
  warn: (text?: string) => void;
  info: (text?: string) => void;
  isSpinning: () => boolean;
  clear: () => void;
};

/**
 * Creates a terminal spinner with enhanced controls and styling options.
 *
 * @example
 * ```typescript
 * // Basic usage
 * const spinner = useSpinner({ text: "Loading..." }).start();
 * spinner.stop();
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
 *   async () => { await longOperation(); },
 *   {
 *     text: "Working...",
 *     successText: "Done!",
 *     failText: "Failed!"
 *   }
 * );
 * ```
 */
export function useSpinner(options: SpinnerOptions): SpinnerControls {
  let spinnerInstance: Ora | null = null;

  const controls: SpinnerControls = {
    start: (text?: string) => {
      if (text) {
        options.text = text;
      }
      if (!spinnerInstance) {
        spinnerInstance = ora({
          text: options.text,
          color: options.color,
          spinner: options.spinner,
        });
      } else {
        spinnerInstance.text = options.text;
      }
      spinnerInstance.start();
      return controls;
    },
    stop: () => {
      if (spinnerInstance) {
        spinnerInstance.stop();
      }
    },
    setText: (text: string) => {
      if (spinnerInstance) {
        spinnerInstance.text = text;
      } else {
        options.text = text;
      }
    },
    succeed: (text?: string) => {
      if (spinnerInstance) {
        spinnerInstance.succeed(text ?? options.successText);
      }
    },
    fail: (text?: string) => {
      if (spinnerInstance) {
        spinnerInstance.fail(text ?? options.failText);
      }
    },
    warn: (text?: string) => {
      if (spinnerInstance) {
        spinnerInstance.warn(text);
      }
    },
    info: (text?: string) => {
      if (spinnerInstance) {
        spinnerInstance.info(text);
      }
    },
    isSpinning: () => {
      return spinnerInstance?.isSpinning ?? false;
    },
    clear: () => {
      if (spinnerInstance) {
        spinnerInstance.clear();
      }
    },
  };

  return controls;
}

/**
 * A wrapper for async operations that manages spinner state automatically.
 *
 * @param operation - The async operation to perform
 * @param options - Spinner options
 * @returns The result of the operation
 */
useSpinner.promise = async <T>(
  operation: () => Promise<T>,
  options: SpinnerOptions,
): Promise<T> => {
  const spinner = useSpinner(options).start();

  try {
    const result = await operation();
    spinner.succeed();
    return result;
  } catch (error) {
    spinner.fail();
    throw error;
  }
};
