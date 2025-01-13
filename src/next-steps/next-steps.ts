import type { VariantName } from "@reliverse/relinka";
import type { TypographyName, ColorName } from "@reliverse/relinka";

import { msg } from "@reliverse/relinka";

type NextStepsPromptOptions = {
  title?: string;
  titleColor?: ColorName;
  titleVariant?: VariantName;
  titleTypography?: TypographyName;
  content: string[];
  contentColor?: ColorName;
  contentVariant?: VariantName;
  contentTypography?: TypographyName;
};

export async function nextStepsPrompt(
  options: NextStepsPromptOptions,
): Promise<void> {
  const {
    title = "",
    titleColor = "cyan",
    titleVariant,
    titleTypography = "none",
    content = [],
    contentColor = "dim",
    contentVariant,
    contentTypography = "italic",
  } = options;

  msg({
    type: "M_INFO",
    title,
    titleColor,
    titleTypography,
    ...(titleVariant ? { titleVariant } : {}),
    content: Array.isArray(content) ? content.join("\n") : content,
    contentColor,
    contentTypography,
    ...(contentVariant ? { contentVariant } : {}),
  });
}
