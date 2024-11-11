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
}: PromptOptions): Promise<void> {
  console.clear();

  const coloredTitle = colorize(title, titleColor, titleTypography);

  const styledTitle = applyVariant(
    [coloredTitle],
    titleVariant,
    variantOptions?.box,
  );

  msg("M_START", styledTitle);
}
