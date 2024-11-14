import type { ChoiceOptionalOptions } from "~/types/prod";

import { selectPrompt } from "~/components/select";
import { colorize } from "~/utils/colorize";

import { errorHandler } from "./helpers/error-handler";

async function examplesRunner() {
  const selectPromptConfig = {
    description: colorize("(not finished)", "red"),
    titleTypography: "bold",
  } satisfies ChoiceOptionalOptions;

  const exampleToRun = await selectPrompt({
    id: "start",
    title: "Choose an example to run",
    titleColor: "green",
    titleTypography: "bold",
    choices: [
      {
        id: "install-deps",
        title: "Install Dependencies",
        description: colorize("(recommended)", "viceGradient"),
        action: async () => {
          await import("./reliverse/detailed-example");
        },
      },
      {
        id: "user-signup",
        title: "User Signup",
        ...selectPromptConfig,
        action: async () => {
          await import("./reliverse/user-signup");
        },
      },
      {
        id: "simple-check",
        title: "Simple Library Check",
        ...selectPromptConfig,
        action: async () => {
          await import("./reliverse/experiments/simple-check");
        },
      },
      {
        id: "win-mln-js",
        title: "Who Wants To Be A JavaScript Millionaire?",
        ...selectPromptConfig,
        action: async () => {
          await import("./reliverse/experiments/win-mln-js");
        },
      },
      {
        id: "exit",
        title: "Exit (Ctrl+C)",
      },
    ],
  });

  if (exampleToRun === "exit") {
    process.exit(0);
  }
}

await examplesRunner().catch((error) => errorHandler(error));
