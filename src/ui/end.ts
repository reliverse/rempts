import type { PromptOptions } from "~/types";

import { colorize } from "~/utils/colorize";
import { symbol } from "~/utils/symbols";
import { applyVariant } from "~/utils/variant";

export async function endPrompt(options: PromptOptions): Promise<void> {
  const {
    title,
    titleColor,
    titleVariant,
    titleTypography,
    message,
    msgColor,
    msgVariant,
    msgTypography,
    state = "initial",
  } = options;

  const figure = symbol("S_MIDDLE", state);

  const coloredTitle = colorize(title, titleColor, titleTypography);
  const coloredMessage = message
    ? colorize(message, msgColor, msgTypography)
    : "";

  const titleText = applyVariant([coloredTitle], titleVariant);
  const messageText = coloredMessage
    ? applyVariant([coloredMessage], msgVariant)
    : "";

  const styledText = [titleText, messageText].filter(Boolean).join("\n");

  console.log(`${figure} ${styledText}`);
}
