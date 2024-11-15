import { createSpinner } from "~/components/spinner";
import { colorize } from "~/utils/colorize";

export async function installDependencies() {
  const spinner = createSpinner({
    initialMessage: "Installing dependencies...",
    solution: "ora",
    spinnerType: "bouncingBar",
  });
  spinner.start();
  try {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    spinner.updateMessage("Finishing up...");
    await new Promise((resolve) => setTimeout(resolve, 1000));

    spinner.stop(colorize("Dependencies installed successfully.", "green"), 0);
  } catch (error: unknown) {
    if (error instanceof Error) {
      spinner.stop(colorize(error.message, "red"), 1);
    } else {
      spinner.stop(colorize("An unknown error occurred", "red"), 1);
    }
    process.exit(1);
  }
}

export const errorHandler = (error: Error) => {
  const separator = "─".repeat(71);
  console.error("│" + separator);
  console.error("│  AN ERROR OCCURRED:\n│ ", error.message);
  console.error("│" + separator);
  console.error(
    "│  If this issue is related to @reliverse/prompts itself, please\n│  report the details at https://github.com/reliverse/prompts/issues",
  );
  console.error("╰" + separator);
  process.exit(1);
};
