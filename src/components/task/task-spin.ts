import type { SpinnerName } from "cli-spinners";

import { re } from "@reliverse/relico";
import process from "node:process";
import ora from "ora";
import { cursor, erase } from "sisteransi";

import { msg } from "~/components/msg-fmt/messages.js";

type SimpleSpinnerType = "default" | "dottedCircle" | "boxSpinner";
type OraSpinnerType = Extract<SpinnerName, OraAllowedSpinners>;
type OraAllowedSpinners = "dots" | "bouncingBar" | "arc";

interface TaskOptions<T extends "simple" | "ora"> {
  initialMessage: string;
  successMessage?: string;
  errorMessage?: string;
  delay?: number;
  spinnerSolution: T;
  spinnerType?: T extends "simple" ? SimpleSpinnerType : OraSpinnerType;
  action: (updateMessage: (message: string) => void) => Promise<void>;
}

export async function taskSpinPrompt<T extends "simple" | "ora">(
  options: TaskOptions<T>,
): Promise<void> {
  const {
    initialMessage,
    successMessage = "Task completed successfully.",
    errorMessage = "An error occurred during the task.",
    delay = 100,
    spinnerSolution,
    spinnerType,
    action,
  } = options;

  let message = initialMessage;
  let interval: ReturnType<typeof setInterval> | null = null;
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

      oraSpinner.stop();

      msg({
        type: "M_INFO",
        title: successMessage,
        titleColor: "cyan",
      });
    } catch (error) {
      oraSpinner.stopAndPersist({
        symbol: re.red("✖"),
        text: errorMessage,
      });

      msg({
        type: "M_ERROR",
        title:
          error instanceof Error ? error.message : "An unknown error occurred.",
        titleColor: "red",
      });

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
        const frame = re.magenta(frames[frameIndex] ?? "");
        process.stdout.write(
          `${cursor.move(-999, 0)}${erase.line}${frame} ${re.cyan(message)}`,
        );
        frameIndex = (frameIndex + 1) % frames.length;
      }, delay);

      await action((newMessage: string) => {
        message = newMessage;
      });

      clearInterval(interval);
      interval = null;

      process.stdout.write(
        `\r${erase.line}${re.green("✔")} ${successMessage}\n`,
      );

      msg({
        type: "M_INFO",
        title: successMessage,
        titleColor: "cyan",
      });
    } catch (error) {
      if (interval) {
        clearInterval(interval);
      }

      process.stdout.write(
        `\r${erase.line}${re.red("✖")} ${
          error instanceof Error ? errorMessage : "An unknown error occurred."
        }\n`,
      );

      msg({
        type: "M_ERROR",
        title:
          error instanceof Error ? error.message : "An unknown error occurred.",
        titleColor: "red",
      });

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
