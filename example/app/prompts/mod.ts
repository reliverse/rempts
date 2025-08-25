// An advanced example of a CLI app with a beautiful UI config.
// This example demonstrates all possible prompt components.

import { re } from "@reliverse/relico";
import { relinka } from "@reliverse/relinka";
import { isBunRuntime } from "@reliverse/runtime";

import { defineCommand, multiselectPrompt, runMain, selectPrompt } from "~/mod";
import {
  DEFAULT_USER_INPUT,
  EXAMPLE_OPTIONS,
  handleExample,
  INPUT_EXAMPLES,
  processOutputExamples,
  validateUserInput,
} from "./impl/impl";
import { showAnykeyPrompt, showStartPrompt } from "./impl/prompts";
import type { UserInput } from "./impl/schema";

/**
 * Main example function that orchestrates the entire demo.
 * Collects user input and displays various UI components.
 */
const main = defineCommand({
  meta: {
    name: "e-prompts",
    version: "1.0.0",
    description: "See @reliverse/rempts's prompts in action",
  },
  args: {
    exampleArg: {
      type: "string",
      default: "defaultValue",
      description: "An example argument",
    },
  },
  async run() {
    await showStartPrompt();

    const exampleToRun = await selectPrompt({
      title: "Choose an example to run",
      displayInstructions: true,
      options: [
        {
          label: "✨ Full-Featured",
          value: "main",
          hint: "recommended",
        },
        {
          label: re.dim("Spinner"),
          value: "spinner",
          hint: re.dim("not finished"),
        },
        {
          label: re.dim("Task"),
          value: "task",
          hint: re.dim("not finished"),
        },
        {
          label: re.dim("Progressbar"),
          value: "progressbar",
          hint: re.dim("not finished"),
        },
        {
          label: re.dim("Simple"),
          value: "simple",
          hint: re.dim("not finished"),
        },
        {
          label: re.dim("with flags 1"),
          value: "cmd-a",
          hint: re.dim("not finished"),
        },
        {
          label: re.dim("with flags 2"),
          value: "cmd-b",
          hint: re.dim("not finished"),
        },
        { label: "🗝️  Exit", value: "exit" },
      ] as const,
      shouldStream: !isBunRuntime(),
      streamDelay: 20,
      defaultValue: "main",
    });

    switch (exampleToRun) {
      case "main":
        await fullFeaturedExample();
        break;
      case "spinner": {
        // await runCmd(await getCmdHooks(), ["--flag"]);
        break;
      }
      case "cmd-a":
        relinka("clear", "");
        relinka("log", "`bun example/app/e-other/args-a.ts Alice --friendly --age 22 --adj cool`");
        relinka("log", "Run without any arguments to see the help message.");
        break;
      case "cmd-b":
        relinka("clear", "");
        relinka(
          "log",
          "1. [BUILD] `bun example/app/e-other/args-b.ts build ./src --workDir ./src`",
        );
        relinka(
          "log",
          "2. [DEBUG] `bun example/app/e-other/args-b.ts debug --feature database-query`",
        );
        relinka(
          "log",
          "3. [DEPLOY] `bun example/app/e-other/args-b.ts deploy --include '*.js' --exclude '*.d.ts'`",
        );
        relinka("log", "Run without any arguments to see the help message.");
        break;
      case "exit":
      case "task":
      case "progressbar":
      case "simple":
        // These cases are currently not implemented or intentionally do nothing
        break;
    }
  },
});

await runMain(main);

async function fullFeaturedExample() {
  await showStartPrompt();
  await showAnykeyPrompt("privacy");

  const selectedExamples = await multiselectPrompt({
    title: "Which examples do you want to check?",
    displayInstructions: true,
    options: EXAMPLE_OPTIONS,
    selectAll: true,
  });

  // Initialize userInput with default values
  const userInput: Partial<UserInput> = { ...DEFAULT_USER_INPUT };

  // Process each selected input example
  for (const example of INPUT_EXAMPLES) {
    if (selectedExamples.includes(example)) {
      await handleExample(example, userInput, selectedExamples);
    }
  }

  // Ensure all required fields are present
  const completeUserInput = validateUserInput(userInput);

  // Process all output/visualization examples
  await processOutputExamples(selectedExamples, completeUserInput);
}
