import type { PromptOptions } from "~/libs/core/core-types.js";

import { msg } from "~/libs/core/core-impl/msg-fmt/messages.js";
import { getExactTerminalWidth } from "~/libs/core/core-impl/msg-fmt/terminal.js";
import { animateText } from "~/libs/core/core-impl/visual/animate/animate.js";

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
