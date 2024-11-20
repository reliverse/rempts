import type { PromptOptions } from "~/types/prod.js";

import { animateText } from "~/components/animate.js";
import { msg } from "~/utils/messages.js";

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
