import type { ChoiceOptionalOptions } from "~/types/prod";

import { selectPrompt } from "~/components/select";
import { colorize } from "~/utils/colorize";
import { errorHandler } from "~/utils/errors";

const selectPromptConfig = {
  description: colorize("(not finished)", "red"),
  titleTypography: "bold",
} satisfies ChoiceOptionalOptions;

async function examplesRunner() {
  // console.clear();

  await import("./1-main-example");

  /* const exampleToRun = await selectPrompt({
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
        id: "1-main-example",
        title: "1. Main Example",
        description: colorize("(recommended)", "viceGradient"),
        action: async () => {
          await import("./1-main-example");
        },
      },
      {
        id: "2-mono-example",
        title: "2. Mono Example",
        ...selectPromptConfig,
        action: async () => {
          await import("./2-mono-example");
        },
      },
      {
        id: "3-basic-example",
        title: "3. Basic Example",
        ...selectPromptConfig,
        action: async () => {
          await import("./3-basic-example");
        },
      },
      {
        id: "exit",
        title: "4. Exit",
        description: colorize("(Ctrl+C)", "passionGradient"),
      },
    ],
  });

  if (exampleToRun === "exit") {
    process.exit(0);
  } */
}

await examplesRunner().catch((error) => errorHandler(error));
