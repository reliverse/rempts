import type { PromptOptions, PromptState } from "~/types";

import { colorize } from "~/utils/colorize";
import { symbol } from "~/utils/symbols";
import { applyVariant } from "~/utils/variant";

export async function startPrompt(
  options: PromptOptions,
  currentState: PromptState = {
    id: options.id ?? "start",
    state: options.state ?? "initial",
    figure: symbol("S_MIDDLE", options.state ?? "initial"),
    value: undefined,
  },
): Promise<void> {
  const {
    title,
    titleColor,
    titleTypography,
    titleVariant,
    variantOptions,
    repeatBarAfterStart,
  } = options;

  currentState.state = options.state ?? "initial";
  currentState.figure = symbol("S_MIDDLE", currentState.state);

  const coloredTitle = colorize(title, titleColor, titleTypography);

  const styledTitle = applyVariant(
    [coloredTitle],
    titleVariant,
    variantOptions?.box,
  );

  console.log(
    `${symbol("S_START", currentState.state)} ${styledTitle} ${symbol(
      "S_LINE",
      currentState.state,
      repeatBarAfterStart ?? 23,
    )}`,
  );
}
