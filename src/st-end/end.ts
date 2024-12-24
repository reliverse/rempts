import type { PromptOptions } from "~/types/general.js";

import { getTerminalWidth, getExactTerminalWidth } from "~/core/utils.js";
import { msg } from "~/utils/messages.js";
import { animateText } from "~/visual/animate/animate.js";

export async function endPrompt({
  title = "",
  titleColor = "cyan",
  titleTypography = "none",
  titleVariant,
  titleAnimation,
  titleAnimationDelay,
  border = true,
  borderColor = "dim",
  horizontalLineLength = 0,
}: PromptOptions): Promise<void> {
  const isEndPrompt = true;

  if (horizontalLineLength === 0) {
    horizontalLineLength = getExactTerminalWidth() - 3;
  }

  if (titleAnimation) {
    await animateText({
      title,
      anim: titleAnimation,
      delay: titleAnimationDelay,
      type: "M_END",
      titleColor,
      titleTypography,
      border,
      borderColor,
      isEndPrompt,
      horizontalLineLength,
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
      horizontalLineLength,
    });
  }
}
