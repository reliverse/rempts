import { createSpinner } from "~/ui/spinner";
import { colorize } from "~/utils/colorize";

export async function handleAnswer(
  isCorrect: boolean,
  successMsg: string,
  failMsg: string,
) {
  const spinner = createSpinner({
    initialMessage: "Checking answer...",
    solution: "ora",
    spinnerType: "dots",
  });
  spinner.start();
  await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate delay

  if (isCorrect) {
    spinner.stop(colorize(successMsg, "green"), 0);
  } else {
    spinner.stop(colorize(failMsg, "red"), 1);
    process.exit(1);
  }
}
