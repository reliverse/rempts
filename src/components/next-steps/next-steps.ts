import type { TypographyName, ColorName } from "~/types.js";
import type { VariantName } from "~/types.js";

import { msg } from "~/components/msg-fmt/messages.js";

interface NextStepsPromptOptions {
  title?: string;
  titleColor?: ColorName;
  titleVariant?: VariantName;
  titleTypography?: TypographyName;
  content: string[];
  contentColor?: ColorName;
  contentVariant?: VariantName;
  contentTypography?: TypographyName;
}

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
