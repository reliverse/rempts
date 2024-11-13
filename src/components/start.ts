import type { PromptOptions } from "~/types/prod";

import { msg } from "~/utils/messages";

export async function startPrompt({
  title,
  titleColor,
  titleTypography,
  titleVariant,
  borderColor = "none",
  clearConsole = true,
}: PromptOptions): Promise<void> {
  if (clearConsole) {
    console.clear();
    console.log();
  } else {
    console.log();
  }

  msg({
    type: "M_START",
    title: ` ${title} `,
    titleColor,
    titleTypography,
    titleVariant,
    borderColor,
  });
}
