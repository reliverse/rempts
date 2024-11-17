import { type SpinnerName } from "cli-spinners";
import process from "node:process";
import ora from "ora";
import color from "picocolors";
import { cursor, erase } from "sisteransi";

type SimpleSpinnerType = "default" | "dottedCircle" | "boxSpinner";
type OraAllowedSpinners = "dots" | "bouncingBar" | "arc";
type OraSpinnerType = Extract<SpinnerName, OraAllowedSpinners>;

type CreateSpinnerOptions<T extends "simple" | "ora"> = {
  initialMessage: string;
  delay?: number;
  spinnerSolution: T;
  spinnerType?: T extends "simple" ? SimpleSpinnerType : OraSpinnerType;
  action: (updateMessage: (message: string) => void) => Promise<void>;
  successMessage?: string;
};

export async function spinnerPrompts<T extends "simple" | "ora">(
  options: CreateSpinnerOptions<T>,
): Promise<void> {
  const {
    initialMessage,
    delay = 100,
    spinnerSolution,
    spinnerType,
    action,
    successMessage = "Task completed successfully.",
  } = options;

  let message = initialMessage;
  let interval: NodeJS.Timer | null = null;
  let frameIndex = 0;

  if (spinnerSolution === "ora") {
    const oraSpinner = ora({
      text: initialMessage,
      spinner: spinnerType as OraSpinnerType,
    });

    try {
      oraSpinner.start();

      await action((newMessage: string) => {
        message = newMessage;
        oraSpinner.text = newMessage;
      });

      oraSpinner.succeed(color.green(successMessage));
    } catch (error) {
      oraSpinner.fail(
        color.red(
          error instanceof Error ? error.message : "An unknown error occurred.",
        ),
      );
      process.exit(1);
    }
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
        return;
      }
    };

    try {
      if (
        process.stdin.isTTY &&
        typeof process.stdin.setRawMode === "function"
      ) {
        process.stdin.setRawMode(true);
        process.stdin.resume();
        process.stdin.on("data", handleInput);
      }

      interval = setInterval(() => {
        const frame = color.magenta(frames[frameIndex]);
        process.stdout.write(
          `${cursor.move(-999, 0)}${erase.line}${frame} ${color.cyan(message)}`,
        );
        frameIndex = (frameIndex + 1) % frames.length;
      }, delay);

      await action((newMessage: string) => {
        message = newMessage;
      });

      clearInterval(interval);
      interval = null;

      process.stdout.write(
        `\r${erase.line}${color.green("✔")} ${successMessage}\n`,
      );
    } catch (error) {
      if (interval) {
        clearInterval(interval);
      }

      process.stdout.write(
        `\r${erase.line}${color.red("✖")} ${
          error instanceof Error ? error.message : "An unknown error occurred."
        }\n`,
      );
      process.exit(1);
    } finally {
      if (
        process.stdin.isTTY &&
        typeof process.stdin.setRawMode === "function"
      ) {
        process.stdin.setRawMode(false);
        process.stdin.pause();
        process.stdin.removeListener("data", handleInput);
      }
    }
  }
}
