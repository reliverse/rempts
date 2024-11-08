import type { PromptOptions } from "~/types";

import { colorize } from "~/utils/colorize";
import { applyVariant } from "~/utils/variant";

export async function nextStepsPrompt(options: PromptOptions): Promise<void> {
  const { title, color, variant } = options;
  const styledTitle = applyVariant(colorize(title, color), variant);
  console.log(styledTitle);
}
