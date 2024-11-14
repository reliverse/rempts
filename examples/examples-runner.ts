import type { ChoiceOptionalOptions } from "~/types/prod";

import { selectPrompt } from "~/components/select";
import { colorize } from "~/utils/colorize";

import { errorHandler } from "./helpers/error-handler";

const selectPromptConfig = {
  description: colorize("(not finished)", "red"),
  titleTypography: "bold",
} satisfies ChoiceOptionalOptions;

async function examplesRunner() {
  console.clear();

  const exampleToRun = await selectPrompt({
    id: "start",
    title: "Choose an example to run",
    content: colorize(
      "Use arrow keys to navigate or just press the corresponding number",
      "dim",
    ),
    titleColor: "green",
    titleTypography: "bold",
    choices: [
      {
        id: "install-deps",
        title: "1. Install Dependencies",
        description: colorize("(recommended)", "viceGradient"),
        action: async () => {
          await import("./reliverse/detailed-example");
        },
      },
      {
        id: "user-signup",
        title: "2. User Signup",
        ...selectPromptConfig,
        action: async () => {
          await import("./reliverse/user-signup");
        },
      },
      {
        id: "simple-check",
        title: "3. Simple Library Check",
        ...selectPromptConfig,
        action: async () => {
          await import("./reliverse/experiments/simple-check");
        },
      },
      {
        id: "win-mln-js",
        title: "4. Who Wants To Be A JavaScript Millionaire?",
        ...selectPromptConfig,
        action: async () => {
          await import("./reliverse/experiments/win-mln-js");
        },
      },
      {
        id: "exit",
        title: "5. Exit",
        description: colorize("(Ctrl+C)", "passionGradient"),
      },
    ],
  });

  if (exampleToRun === "exit") {
    process.exit(0);
  }
}

await examplesRunner().catch((error) => errorHandler(error));
