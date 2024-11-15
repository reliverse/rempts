import { type SpinnerName } from "cli-spinners";
import process from "node:process";
import ora from "ora";
import color from "picocolors";
import { cursor, erase } from "sisteransi";

import { removeCursor, restoreCursor } from "~/utils/terminal";

type SimpleSpinnerType = "default" | "dottedCircle" | "boxSpinner";
type OraAllowedSpinners = "dots" | "bouncingBar" | "arc";
type OraSpinnerType = Extract<SpinnerName, OraAllowedSpinners>;

type SpinnerReturnType = {
  start: (msg?: string) => void;
  stop: (finalMessage?: string, code?: number) => void;
  updateMessage: (newMessage: string) => void;
};

type CreateSpinnerOptions<T extends "simple" | "ora"> = {
  initialMessage: string;
  delay?: number;
  solution: T;
} & (T extends "simple"
  ? { spinnerType?: SimpleSpinnerType }
  : { spinnerType?: OraSpinnerType });

export function createSpinner<T extends "simple" | "ora">(
  options: CreateSpinnerOptions<T>,
): SpinnerReturnType {
  const { initialMessage, delay = 100, solution, spinnerType } = options;

  let message = initialMessage;
  let interval: NodeJS.Timer | null = null;
  let frameIndex = 0;

  if (solution === "ora") {
    const oraSpinner = ora({
      text: initialMessage,
      spinner: spinnerType as OraSpinnerType,
    });

    const start = (msg = ""): void => {
      oraSpinner.text = msg || message;
      oraSpinner.start();
    };

    const stop = (finalMessage = "", code = 0): void => {
      code === 0
        ? oraSpinner.succeed(finalMessage)
        : oraSpinner.fail(finalMessage);
    };

    const updateMessage = (newMessage: string) => {
      message = newMessage;
      oraSpinner.text = newMessage;
    };

    return { start, stop, updateMessage };
  } else {
    const simpleSpinners = {
      default: ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"],
      dottedCircle: ["○", "◔", "◑", "◕", "●"],
      boxSpinner: ["▖", "▘", "▝", "▗"],
    };

    const frames =
      spinnerType && spinnerType in simpleSpinners
        ? simpleSpinners[spinnerType as SimpleSpinnerType]
        : simpleSpinners.default;

    const handleInput = (data: Buffer) => {
      const key = data.toString();
      if (key === "\r" || key === "\n") {
        // Ignore Enter key
        return;
      }
    };

    const start = (msg = ""): void => {
      if (interval) {
        return; // Prevent multiple starts
      }
      message = msg || message;

      // Check if stdin is a TTY and setRawMode is available
      if (
        process.stdin.isTTY &&
        typeof process.stdin.setRawMode === "function"
      ) {
        process.stdin.setRawMode(true);
        process.stdin.resume();
        process.stdin.on("data", handleInput);
      }

      removeCursor();

      interval = setInterval(() => {
        const frame = color.magenta(frames[frameIndex]);
        process.stdout.write(
          `${cursor.move(-999, 0)}${erase.line}${frame} ${color.cyan(message)}`,
        );
        frameIndex = (frameIndex + 1) % frames.length;
      }, delay);
    };

    const stop = (finalMessage = "", code = 0): void => {
      if (!interval) {
        return;
      }
      clearInterval(interval);
      interval = null;

      // Clean up stdin if it was modified
      if (
        process.stdin.isTTY &&
        typeof process.stdin.setRawMode === "function"
      ) {
        process.stdin.setRawMode(false);
        process.stdin.pause();
        process.stdin.removeListener("data", handleInput);
      }

      restoreCursor();

      const statusSymbol = code === 0 ? color.green("✔") : color.red("✖");
      process.stdout.write(`\r${erase.line}${statusSymbol} ${finalMessage}\n`);
    };

    const updateMessage = (newMessage: string) => {
      message = newMessage;
    };

    return { start, stop, updateMessage };
  }
}
