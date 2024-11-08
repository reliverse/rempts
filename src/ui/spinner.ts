import { type SpinnerName } from "cli-spinners";
import process from "node:process";
import ora from "ora";
import color from "picocolors";
import { cursor, erase } from "sisteransi";

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

    const start = (msg = ""): void => {
      if (interval) {
        return;
      } // Prevent multiple starts
      message = msg || message;
      process.stdout.write(cursor.hide);
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
      } // Stop only if running

      clearInterval(interval);
      interval = null;
      const statusSymbol = code === 0 ? color.green("✔") : color.red("✖");
      process.stdout.write(`\r${erase.line}${statusSymbol} ${finalMessage}\n`);
      process.stdout.write(cursor.show); // Restore cursor
    };

    const updateMessage = (newMessage: string) => {
      message = newMessage;
    };

    return { start, stop, updateMessage };
  }
}
