// 3-basic-example.ts: A basic example demonstrating core functionalities of @reliverse/prompts. Everything in a single file.

import { exampleSpinner } from "@/reliverse/main-utils";

import type { OptionalPromptOptions } from "~/types/prod";

import { numberPrompt, textPrompt } from "~/main";
import { errorHandler } from "~/utils/helpers/errors";

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
  await textPrompt({
    id: "start",
    title: "Hello, Reliverse Community! 👋",
    content: "You are testing the basic example of @reliverse/prompts",
    ...extendedConfig,
    titleVariant: "box",
    contentVariant: "underline",
    variantOptions: { box: { limit: 50 } },
  });

  await numberPrompt({
    id: "number",
    title: "Enter a number",
    content: "Type a number between 1 and 100",
    ...extendedConfig,
    titleVariant: "doubleBox",
    contentVariant: "underline",
    defaultValue: 50,
  });

  await exampleSpinner();
}

await main().catch((error) => errorHandler(error));
