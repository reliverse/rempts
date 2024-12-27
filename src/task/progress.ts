import pc from "picocolors";
import { cursor, erase } from "sisteransi";

import type { ProgressBar, ProgressBarOptions } from "./types.js";

export async function progressTaskPrompt(
  options: ProgressBarOptions,
): Promise<ProgressBar> {
  if (options.total <= 0) {
    throw new Error("Total must be a positive number");
  }

  const state = {
    total: options.total,
    current: 0,
    width: options.width ?? 40,
    completeChar: options.completeChar ?? "█",
    incompleteChar: options.incompleteChar ?? "░",
    startTime: Date.now(),
    format:
      options.format ?? "Progress: [:bar] :percent% | Elapsed: :elapsed s",
    colorize: options.colorize ?? false,
  };

  const getElapsedTime = () => {
    return ((Date.now() - state.startTime) / 1000).toFixed(2);
  };

  const getPercentage = () => {
    return ((state.current / state.total) * 100).toFixed(2);
  };

  const getBar = () => {
    const percent = state.current / state.total;
    const filledLength = Math.round(state.width * percent);
    const emptyLength = state.width - filledLength;

    const filled = state.completeChar.repeat(filledLength);
    const empty = state.incompleteChar.repeat(emptyLength);

    return state.colorize ? pc.green(filled) + pc.red(empty) : filled + empty;
  };

  const render = async () => {
    const bar = getBar();
    const percentage = getPercentage();
    const elapsed = getElapsedTime();

    const output = state.format
      .replace(":bar", bar)
      .replace(":percent", percentage)
      .replace(":elapsed", elapsed);

    process.stdout.write(cursor.move(-999, 0) + erase.line);
    process.stdout.write(pc.green("◆") + "  " + output);

    if (state.current >= state.total) {
      process.stdout.write("\n");
    }
  };

  const update = async (value: number) => {
    const newValue = Math.min(value, state.total);
    if (newValue !== state.current) {
      state.current = newValue;
      await render();
    }
  };

  const increment = async (amount = 1) => {
    await update(state.current + amount);
  };

  return {
    update,
    increment,
    render,
  };
}
