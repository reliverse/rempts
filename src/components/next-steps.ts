import type { PromptOptions } from "~/types/prod";

import { msg } from "~/utils/messages";

export async function nextStepsPrompt(options: PromptOptions): Promise<void> {
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
