import { msg } from "~/utils/messages.js";

import type { ProgressBarOptions } from "./types.js";

import { progressTaskPrompt } from "./progress.js";

/**
 * Options for the progressbar helper function.
 */
export type ProgressBarTaskOptions = ProgressBarOptions & {
  /**
   * The amount to increment the progress bar each step.
   * @default 1
   */
  increment?: number;

  /**
   * Desired total time for the progress bar to complete in milliseconds.
   * @default 3000
   */
  desiredTotalTime?: number;
};

/**
 * Displays a progress bar that completes based on the provided options.
 * @param options - Configuration options for the progress bar.
 * @returns A promise that resolves when the progress bar completes.
 */
export async function progressbar(
  options: ProgressBarTaskOptions,
): Promise<void> {
  const {
    total,
    increment = 1,
    desiredTotalTime = 2000,
    ...progressBarOptions
  } = options;

  if (increment <= 0) {
    throw new Error("Increment must be a positive number");
  }

  const iterations = Math.ceil(total / increment) + 1;
  const delay = desiredTotalTime / iterations;

  const progressBar = await progressTaskPrompt({
    total,
    ...progressBarOptions,
  });

  try {
    for (let i = 0; i <= total; i += increment) {
      await progressBar.update(i);
      await sleep(delay);
    }

    if (total % increment !== 0) {
      await progressBar.update(total);
    }

    msg({
      type: "M_MIDDLE",
      title: "",
      borderColor: "dim",
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Progress bar error";
    console.error("Progress bar encountered an error:", errorMessage);
    throw new Error(errorMessage);
  }
}

/**
 * Sleep for a specified number of milliseconds.
 * @param ms - Milliseconds to sleep.
 */
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
