import type { Fonts } from "figlet";

import type { PromptOptions } from "~/types.js";

import { animateText } from "~/libs/animate/animate-mod.js";
import { msg } from "~/libs/msg-fmt/messages.js";
import { getExactTerminalWidth } from "~/libs/msg-fmt/terminal.js";
import { createAsciiArt } from "~/libs/visual/visual-mod.js";

type EndPromptOptions = PromptOptions & {
  variant?: "footer" | "ascii-art";
  asciiArtFont?: Fonts;
};

export async function outroPrompt(
  optionsOrTitle: EndPromptOptions | string,
): Promise<void> {
  const options =
    typeof optionsOrTitle === "string"
      ? { title: optionsOrTitle }
      : optionsOrTitle;

  const {
    title = "",
    titleColor = "cyan",
    titleTypography = "none",
    titleVariant,
    titleAnimation,
    titleAnimationDelay,
    border = true,
    borderColor = "dim",
    horizontalLineLength: initialHorizontalLineLength = 0,
    variant = "footer",
    asciiArtFont,
  } = options;

  let horizontalLineLength = initialHorizontalLineLength;

  if (variant === "ascii-art") {
    await createAsciiArt({
      message: title || " ",
      font: asciiArtFont,
    });
    return;
  }

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
