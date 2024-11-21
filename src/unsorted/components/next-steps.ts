import type { PromptOptions } from "~/unsorted/types/general";

import { msg } from "~/unsorted/utils/messages";

export async function nextStepsPrompt(options: PromptOptions): Promise<void> {
  const {
    title,
    titleColor = "cyanBright",
    answerColor = "none",
    titleVariant,
    titleTypography = "bold",
    content,
    contentColor,
    contentVariant,
    contentTypography,
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
