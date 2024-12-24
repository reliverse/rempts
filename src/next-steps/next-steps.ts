import type {
  VariantName,
  TypographyName,
  ColorName,
} from "~/types/general.js";

import { msg } from "~/utils/messages.js";

type NextStepsPromptOptions = {
  title?: string;
  titleColor?: ColorName;
  titleVariant?: VariantName;
  titleTypography?: TypographyName;
  content: string[];
  contentColor?: ColorName;
  contentVariant?: VariantName;
  contentTypography?: TypographyName;
};

export async function nextStepsPrompt(
  options: NextStepsPromptOptions,
): Promise<void> {
  const {
    title = "",
    titleColor = "cyan",
    titleVariant,
    titleTypography = "none",
    content = [],
    contentColor = "dim",
    contentVariant,
    contentTypography = "italic",
  } = options;

  msg({
    type: "M_INFO",
    title,
    titleColor,
    titleVariant,
    titleTypography,
    content: Array.isArray(content) ? content.join("\n") : content,
    contentColor,
    contentVariant,
    contentTypography,
  });
}
