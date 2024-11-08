import type { PromptOptions } from "~/types";

import { colorize } from "~/utils/colorize";
import { applyVariant } from "~/utils/variant";

export async function startPrompt(options: PromptOptions): Promise<void> {
  const {
    title,
    titleColor,
    titleTypography,
    titleVariant,
    message,
    msgColor,
    msgTypography,
    msgVariant,
    variantOptions,
  } = options;

  const coloredTitle = colorize(title, titleColor, titleTypography);
  const coloredMessage = message
    ? colorize(message, msgColor, msgTypography)
    : "";

  const titleText = applyVariant(
    [coloredTitle],
    titleVariant,
    variantOptions?.box,
  );
  const messageText = coloredMessage
    ? applyVariant([coloredMessage], msgVariant, variantOptions?.box)
    : "";

  const styledText = [titleText, messageText].filter(Boolean).join("\n");

  console.log(styledText);
}
