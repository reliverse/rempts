import { getExactTerminalWidth, msg } from "@reliverse/relinka";

import type { PromptOptions } from "~/types/general.js";

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
  if (horizontalLineLength === 0) {
    horizontalLineLength = getExactTerminalWidth() - 3;
  }

  if (titleAnimation) {
    await animateText({
      title: title ? title : " ",
      anim: titleAnimation,
      delay: titleAnimationDelay,
      type: "M_END",
      titleColor,
      titleTypography,
      border,
      borderColor,
      horizontalLineLength,
    });
  } else {
    msg({
      type: "M_END",
      title: title ? title : " ",
      titleColor,
      titleTypography,
      titleVariant,
      border,
      borderColor,
      horizontalLineLength,
    });
  }
}
