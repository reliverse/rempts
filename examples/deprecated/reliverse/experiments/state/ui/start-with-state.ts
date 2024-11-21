import { symbol } from "@/deprecated/reliverse/experiments/utils/symbols";

import type {
  PromptOptionsDeprecated,
  PromptStateDeprecated,
} from "~/unsorted/types/internal";

import { colorize } from "~/unsorted/utils/colorize";
import { applyVariant } from "~/unsorted/utils/variants";

export async function startPrompt(
  options: PromptOptionsDeprecated,
  currentState: PromptStateDeprecated = {
    id: options.id ?? "start",
    state: options.state ?? "initial",
    symbol: symbol("S_MIDDLE", options.state ?? "initial"),
    value: undefined,
  },
): Promise<void> {
  const { title, titleColor, titleTypography, titleVariant, variantOptions } =
    options;

  currentState.state = options.state ?? "initial";
  currentState.symbol = symbol("S_MIDDLE", currentState.state);

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
    )}`,
  );
}
