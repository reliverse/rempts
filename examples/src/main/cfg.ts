import type { PromptOptions } from "~/main.js";

export const basicConfig = {
  titleColor: "cyan",
  borderColor: "dim",
} satisfies PromptOptions;

export const extendedConfig = {
  ...basicConfig,
  contentTypography: "italic",
  contentColor: "dim",
} satisfies PromptOptions;
