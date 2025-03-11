import logUpdate from "log-update";
import { cursor } from "sisteransi";

import { fmt, type ColorName } from "~/main.js";
import { endPrompt } from "~/main.js";
import { streamText } from "~/utils/stream-text.js";

const DEFAULT_MESSAGE = "Press any key to continue...";

const CTRL_C_CODE = 3;

/**
 * Terminal control utilities
 */
const terminal = {
  /**
   * Move cursor to start of line
   */
  moveToStart: () => process.stdout.write("\r"),

  /**
   * Clear current line and move cursor up
   */
  clearLineAndMoveUp: () => process.stdout.write("\x1b[1A\x1b[2K"),

  /**
   * Clear multiple lines above current position
   */
  clearLines: (count: number) => {
    terminal.moveToStart();
    // Clear current line first
    process.stdout.write("\x1b[2K");
    // Then clear previous lines
    for (let i = 0; i < count; i++) {
      terminal.clearLineAndMoveUp();
    }
  },
};

type Options = {
  ctrlC?: number | false | "reject";
  preserveLog?: boolean;
  hideMessage?: boolean;
  shouldStream?: boolean;
  streamDelay?: number;
  color?: ColorName;
  placeholderColor?: ColorName;
};

export async function anykeyPrompt(
  message: string = DEFAULT_MESSAGE,
  options: Options = {},
): Promise<void> {
  const {
    ctrlC = 1,
    preserveLog = false,
    hideMessage = false,
    shouldStream = false,
    streamDelay = 20,
    color = "dim",
    placeholderColor = "gray",
  } = options;

  if (message) {
    if (!shouldStream) {
      const { text } = fmt({
        hintPlaceholderColor: placeholderColor,
        type: "M_GENERAL",
        title: message,
        titleColor: color,
        dontRemoveBar: true,
      });
      message = text;
    }
  }

  if (message && !hideMessage) {
    if (shouldStream) {
      await streamText({
        text: `◆  ${message}`,
        delay: streamDelay,
        newline: false,
        clearLine: true,
        color: color,
      });
      // Clear previous output
      const lineCount = message.split("\n").length;
      terminal.clearLines(lineCount);

      const { text } = fmt({
        hintPlaceholderColor: placeholderColor,
        type: "M_GENERAL",
        title: message,
        titleColor: color,
        dontRemoveBar: true,
      });
      terminal.moveToStart();
      logUpdate(text);
    } else {
      logUpdate(message);
    }
  }

  return new Promise((resolve, reject) => {
    const cleanup = () => {
      process.stdin.removeListener("data", handler);
      if (
        process.stdin.isTTY &&
        typeof process.stdin.setRawMode === "function"
      ) {
        process.stdin.setRawMode(false);
      }
      process.stdin.pause();
      process.stdout.write(cursor.show);
    };

    const handleCtrlC = () => {
      cleanup();
      void endPrompt({
        title: "✋ User pressed Ctrl+C, exiting...",
        titleAnimation: "pulse",
        titleColor: "redBright",
        titleTypography: "bold",
        endTitleColor: "redBright",
        titleAnimationDelay: 400,
      })
        .then(() => {
          if (ctrlC === "reject") {
            reject(new Error("User pressed CTRL+C"));
          } else if (ctrlC === false) {
            resolve();
          } else if (typeof ctrlC === "number") {
            process.exit(0);
          } else {
            throw new TypeError("Invalid ctrlC option");
          }
        })
        .catch(reject);
    };

    const handler = (buffer: Buffer) => {
      cleanup();

      if (message && !preserveLog) {
        logUpdate.clear();
      } else {
        logUpdate.done();
        process.stdout.write("\n");
      }

      const [firstByte] = buffer;
      if (firstByte === CTRL_C_CODE) {
        handleCtrlC();
      } else {
        resolve();
      }
    };

    process.stdin.resume();
    if (process.stdin.isTTY && typeof process.stdin.setRawMode === "function") {
      process.stdin.setRawMode(true);
    }
    process.stdin.once("data", handler);
  });
}
