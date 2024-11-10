import type { PromptOptions, State, SymbolMessages } from "~/types";

import { colorize } from "~/utils/colorize";
import { msg } from "~/utils/symbols";
import { applyVariant } from "~/utils/variant";

export async function startPrompt({
  title,
  titleColor,
  titleTypography,
  titleVariant,
  variantOptions,
  dashCount = 23,
}: PromptOptions): Promise<void> {
  const coloredTitle = colorize(title, titleColor, titleTypography);
  const styledTitle = applyVariant(
    [coloredTitle],
    titleVariant,
    variantOptions?.box,
  );

  msg("M_START_PROMPT", "initial", styledTitle, dashCount);
}
