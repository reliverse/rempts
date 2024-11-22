import {
  SingleBar,
  Presets,
} from "@/deprecated/external/another/progressbar/index.js";
import { errorHandler } from "~/utils/errors.js";

export async function example() {
  // Create a new SingleBar instance with default options
  const bar = new SingleBar({}, Presets.shades_classic);

  // Start the progress bar with a total value of 100
  bar.start(100, 0);

  // Simulate progress updates
  const interval = setInterval(() => {
    bar.increment(4); // Increment by 4

    // Use getter methods to access current value and total
    if (bar.getValue() >= bar.getTotal()) {
      clearInterval(interval); // Clear the interval when done
      bar.stop(); // Stop the progress bar
    }
  }, 100); // Update every 100ms
}

await example().catch((error) => errorHandler(error));
