import { emojify } from "node-emoji";

import type { PromptOptions } from "~/main.js";

export const basicConfig = {
  titleColor: "cyanBright",
  titleTypography: "bold",
  borderColor: "viceGradient",
} satisfies PromptOptions;

export const extendedConfig = {
  ...basicConfig,
  contentTypography: "italic",
  contentColor: "dim",
} satisfies PromptOptions;

export const experimentalConfig = {
  titleColor: "cyanBright",
  titleTypography: "bold",
  endTitle: emojify(
    ":books: Learn the docs here: https://docs.reliverse.org/relinka",
  ),
  endTitleColor: "retroGradient",
} satisfies PromptOptions;
