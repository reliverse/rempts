import type { PromptOptions } from "~/types/general.js";

import { msg } from "~/utils/messages.js";

export async function nextStepsPrompt(options: PromptOptions): Promise<void> {
  const {
    title = "",
    titleColor = "blueBright",
    titleVariant,
    titleTypography = "bold",
    content,
    contentColor = "dim",
    contentVariant,
    contentTypography = "italic",
  } = options;

  msg({
    type: "M_INFO",
    title,
    titleColor,
    titleVariant,
    titleTypography,
    content,
    contentColor,
    contentVariant,
    contentTypography,
  });
}
