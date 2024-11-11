import type { PromptOptions } from "~/types";

import { colorize } from "~/utils/colorize";
import { msg } from "~/utils/messages";
import { applyVariant } from "~/utils/variants";

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

  msg("MT_START", "initial", styledTitle, dashCount);
}
