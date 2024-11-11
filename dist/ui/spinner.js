import process from "node:process";
import ora from "ora";
import color from "picocolors";
import { cursor, erase } from "sisteransi";
export function createSpinner(options) {
  const { initialMessage, delay = 100, solution, spinnerType } = options;
  let message = initialMessage;
  let interval = null;
  let frameIndex = 0;
  if (solution === "ora") {
    const oraSpinner = ora({
      text: initialMessage,
      spinner: spinnerType
    });
    const start = (msg = "") => {
      oraSpinner.text = msg || message;
      oraSpinner.start();
    };
    const stop = (finalMessage = "", code = 0) => {
      code === 0 ? oraSpinner.succeed(finalMessage) : oraSpinner.fail(finalMessage);
    };
    const updateMessage = (newMessage) => {
      message = newMessage;
      oraSpinner.text = newMessage;
    };
    return { start, stop, updateMessage };
  } else {
    const simpleSpinners = {
      default: ["\u280B", "\u2819", "\u2839", "\u2838", "\u283C", "\u2834", "\u2826", "\u2827", "\u2807", "\u280F"],
      dottedCircle: ["\u25CB", "\u25D4", "\u25D1", "\u25D5", "\u25CF"],
      boxSpinner: ["\u2596", "\u2598", "\u259D", "\u2597"]
    };
    const frames = spinnerType && spinnerType in simpleSpinners ? simpleSpinners[spinnerType] : simpleSpinners.default;
    const start = (msg = "") => {
      if (interval) {
        return;
      }
      message = msg || message;
      process.stdout.write(cursor.hide);
      interval = setInterval(() => {
        const frame = color.magenta(frames[frameIndex]);
        process.stdout.write(
          `${cursor.move(-999, 0)}${erase.line}${frame} ${color.cyan(message)}`
        );
        frameIndex = (frameIndex + 1) % frames.length;
      }, delay);
    };
    const stop = (finalMessage = "", code = 0) => {
      if (!interval) {
        return;
      }
      clearInterval(interval);
      interval = null;
      const statusSymbol = code === 0 ? color.green("\u2714") : color.red("\u2716");
      process.stdout.write(`\r${erase.line}${statusSymbol} ${finalMessage}
`);
      process.stdout.write(cursor.show);
    };
    const updateMessage = (newMessage) => {
      message = newMessage;
    };
    return { start, stop, updateMessage };
  }
}
