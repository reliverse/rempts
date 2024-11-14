import type { PromptOptions } from "~/types/prod";

import { animateText } from "~/components/animate";
import { msg } from "~/utils/messages";

export async function endPrompt({
  title,
  titleColor,
  titleTypography,
  titleVariant,
  titleAnimation,
  titleAnimationDelay,
  borderColor = "none",
}: PromptOptions): Promise<void> {
  if (titleAnimation) {
    await animateText({
      title,
      anim: titleAnimation,
      delay: titleAnimationDelay,
      type: "M_END_ANIMATED",
      titleColor,
      titleTypography,
      borderColor,
    });
  } else {
    msg({
      type: "M_END",
      title,
      titleColor,
      titleTypography,
      titleVariant,
      borderColor,
    });
  }
}
