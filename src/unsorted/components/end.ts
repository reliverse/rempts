import type { PromptOptions } from "~/unsorted/types/general";

import { animateText } from "~/unsorted/components/animate";
import { msg } from "~/unsorted/utils/messages";

export async function endPrompt({
  title,
  titleColor = "cyanBright",
  answerColor = "none",
  titleTypography = "bold",
  titleVariant,
  titleAnimation,
  titleAnimationDelay,
  border = true,
  borderColor = "viceGradient",
}: PromptOptions): Promise<void> {
  if (titleAnimation) {
    await animateText({
      title,
      anim: titleAnimation,
      delay: titleAnimationDelay,
      type: "M_END_ANIMATED",
      titleColor,
      titleTypography,
      border,
      borderColor,
    });
  } else {
    msg({
      type: "M_END",
      title,
      titleColor,
      titleTypography,
      titleVariant,
      border,
      borderColor,
    });
  }
}
