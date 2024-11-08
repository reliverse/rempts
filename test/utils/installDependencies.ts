import { createSpinner } from "~/ui/spinner";

const spinner = createSpinner({
  initialMessage: "Installing dependencies...",
  solution: "ora",
  spinnerType: "bouncingBar",
});

export async function installDependencies() {
  spinner.start();

  try {
    // Simulate a long-running task
    await new Promise((resolve) => setTimeout(resolve, 2000));
    spinner.updateMessage("Finishing up...");
    await new Promise((resolve) => setTimeout(resolve, 1000));
  } finally {
    spinner.stop("Dependencies installed successfully.");
  }
}
