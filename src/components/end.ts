import type { PromptOptions } from "~/types/prod";

import { promptsAnimateText } from "~/components/animate";
import { msg } from "~/utils/messages";

type EndPromptOptions = PromptOptions & {
  titleAnimation?: string;
  titleAnimated?: string;
};

export async function endPrompt({
  title,
  titleAnimated,
  titleColor,
  titleTypography,
  titleVariant,
  titleAnimation,
  titleAnimationDelay,
  borderColor = "none",
}: EndPromptOptions): Promise<void> {
  if (titleAnimation) {
    if (!titleAnimated) {
      throw new Error(
        "[endPrompt] titleAnimated is required when titleAnimation is provided",
      );
    }
    await promptsAnimateText({
      title,
      titleAnimated,
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
