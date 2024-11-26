// 3-basic-example.ts: A basic example demonstrating core functionalities of @reliverse/prompts. Everything in a single file.

import { showSpinner } from "@/src/prompts.js";

import type { OptionalPromptOptions } from "~/types/general.js";

import { numberPrompt, inputPrompt } from "~/components/prompts/index.js";
import { errorHandler } from "~/utils/errors.js";

export const basicConfig = {
  titleColor: "cyanBright",
  titleTypography: "bold",
  borderColor: "viceGradient",
} satisfies OptionalPromptOptions;

export const extendedConfig = {
  ...basicConfig,
  contentTypography: "italic",
  contentColor: "dim",
} satisfies OptionalPromptOptions;

async function main() {
  await inputPrompt({
    title: "Hello, Reliverse Community! 👋",
    content: "You are testing the basic example of @reliverse/prompts",
    ...extendedConfig,
    titleVariant: "box",
    contentVariant: "underline",
    variantOptions: { box: { limit: 50 } },
  });

  await numberPrompt({
    title: "Enter a number",
    content: "Type a number between 1 and 100",
    ...extendedConfig,
    titleVariant: "doubleBox",
    contentVariant: "underline",
    defaultValue: 50,
  });

  await showSpinner();
}

await main().catch((error) => errorHandler(error));
