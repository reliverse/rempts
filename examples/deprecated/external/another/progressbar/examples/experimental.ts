import type { FormatterFunction } from "@/deprecated/external/another/progressbar/modules/options.js";

import {
  SingleBar,
  Presets,
} from "@/deprecated/external/another/progressbar/index.js";
import { errorHandler } from "~/utils/errors.js";

export async function example() {
  const customFormatter: FormatterFunction = (options, params, payload) => {
    return `\u001b[32m{bar}\u001b[0m {percentage}% | ETA: {eta_formatted} | {value}/{total}`;
  };

  const options = {
    format: customFormatter,
    barCompleteChar: "\u2588", // Full block
    barIncompleteChar: "\u2591", // Light shade
  };

  const bar = new SingleBar(
    { ...options, format: customFormatter.toString() },
    Presets.shades_classic,
  );

  bar.start(100, 0);

  // Simulate progress
  const timer = setInterval(() => {
    bar.increment();

    if (bar.getValue() >= bar.getTotal()) {
      clearInterval(timer);
      bar.stop();
    }
  }, 100); // Update every 100ms

  process.exit(0);
}

await example().catch((error) => errorHandler(error));
