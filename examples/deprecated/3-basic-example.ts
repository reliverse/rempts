// 3-basic-example.ts: A basic example demonstrating core functionalities of @reliverse/relinka. Everything in a single file.

import { showSpinner } from "@/extended/modules/prompts.js";

import type { OptionalPromptOptions } from "~/types/general.js";

import { numberPromptTwo, textPromptTwo } from "~/components/prompts/index.js";
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
  await textPromptTwo({
    id: "start",
    title: "Hello, Reliverse Community! 👋",
    content: "You are testing the basic example of @reliverse/relinka",
    ...extendedConfig,
    titleVariant: "box",
    contentVariant: "underline",
    variantOptions: { box: { limit: 50 } },
  });

  await numberPromptTwo({
    id: "number",
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
