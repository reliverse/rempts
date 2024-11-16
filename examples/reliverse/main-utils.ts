import { createSpinner } from "~/components/spinner";
import { colorize } from "~/utils/colorize";

export async function exampleSpinner() {
  const spinner = createSpinner({
    initialMessage: "Some long-running task is in progress...",
    solution: "ora",
    spinnerType: "bouncingBar",
  });
  spinner.start();
  try {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    spinner.updateMessage(
      "This is just an example with setTimeout(), nothing really happens...",
    );
    await new Promise((resolve) => setTimeout(resolve, 1000));

    spinner.stop(colorize("Task completed successfully.", "green"), 0);
  } catch (error: unknown) {
    if (error instanceof Error) {
      spinner.stop(colorize(error.message, "red"), 1);
    } else {
      spinner.stop(colorize("An unknown error occurred", "red"), 1);
    }
    process.exit(1);
  }
}

