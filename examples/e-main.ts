// An advanced example of a CLI app with a beautiful UI config.
// This example demonstrates all possible prompt components.

import type { UserInput } from "@/e-src/e-main/schema.js";

import { showAnykeyPrompt, showStartPrompt } from "@/e-src/e-main/prompts.js";

import { errorHandler, multiselectPrompt } from "~/main.js";

import {
  DEFAULT_USER_INPUT,
  EXAMPLE_OPTIONS,
  handleExample,
  INPUT_EXAMPLES,
  processOutputExamples,
  validateUserInput,
} from "./e-src/e-main/impl.js";

/**
 * Main example function that orchestrates the entire demo.
 * Collects user input and displays various UI components.
 */
export async function detailedExample(): Promise<void> {
  try {
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
  } catch (error: unknown) {
    errorHandler(error instanceof Error ? error : new Error(String(error)));
  }
}

// Run the example
await detailedExample().catch((error) => errorHandler(error));
