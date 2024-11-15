import type { OptionalPromptOptions } from "~/types/prod";

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
