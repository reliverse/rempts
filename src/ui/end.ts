import type { PromptOptions } from "~/types";

import { colorize } from "~/utils/colorize";
import { msg } from "~/utils/messages";
import { applyVariant } from "~/utils/variants";

export async function endPrompt(options: PromptOptions): Promise<void> {
  const {
    title,
    titleColor,
    titleVariant,
    titleTypography,
    content,
    contentColor,
    contentVariant,
    contentTypography,
  } = options;

  const coloredTitle = colorize(title, titleColor, titleTypography);
  const coloredContent = content
    ? colorize(content, contentColor, contentTypography)
    : "";

  const titleText = applyVariant([coloredTitle], titleVariant);
  const contentText = coloredContent
    ? applyVariant([coloredContent], contentVariant)
    : "";

  const styledText = [titleText, contentText].filter(Boolean).join("\n");

  msg("M_END", styledText);
}
