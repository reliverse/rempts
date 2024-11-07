import process from "node:process";
import color from "picocolors";
import { cursor, erase } from "sisteransi";

export function createSpinner(initialMessage: string, delay = 100) {
  let interval: NodeJS.Timer | null = null;
  let frameIndex = 0;
  const unicodeFrames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
  const asciiFrames = ["+", "x", "*"];
  const frames = color.isColorSupported ? unicodeFrames : asciiFrames;
  let message = initialMessage;

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
