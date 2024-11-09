import type { PromptOptions } from "~/types";

import { colorize } from "~/utils/colorize";
import { BAR, BAR_END, BAR_START, symbol } from "~/utils/states";
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
    state = "initial",
  } = options;

  const figure = symbol(state);

  const coloredTitle = colorize(title, titleColor, titleTypography);
  const coloredMessage = message
    ? colorize(message, msgColor, msgTypography)
    : "";

  const styledTitle = applyVariant(
    [coloredTitle],
    titleVariant,
    variantOptions?.box,
  );
  const styledMessage = coloredMessage
    ? applyVariant([coloredMessage], msgVariant, variantOptions?.box)
    : "";

  console.log(`${BAR_START}${styledTitle}\n${BAR}`);
  if (styledMessage) {
    console.log(`${figure}${styledMessage}\n${BAR_END}`);
  }
}
