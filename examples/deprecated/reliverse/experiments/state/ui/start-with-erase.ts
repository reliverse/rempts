import { symbol } from "@/deprecated/reliverse/experiments/utils/symbols.js";
import { cursor, erase } from "sisteransi";

import type {
  PromptOptionsDeprecated,
  PromptStateDeprecated,
} from "~/types/internal.js";

import { colorize } from "~/utils/colorize.js";
import { applyVariant } from "~/utils/variants.js";

export async function startPrompt(
  options: PromptOptionsDeprecated,
  currentState: PromptStateDeprecated = {
    id: options.id ?? "start",
    state: options.state ?? "initial",
    symbol: symbol("S_MIDDLE", options.state ?? "initial"),
    value: undefined,
  },
): Promise<void> {
  const {
    title,
    titleColor,
    titleTypography,
    titleVariant,
    content,
    contentColor = "dim",
    contentTypography = "italic",
    contentVariant,
    variantOptions,
  } = options;

  // Initialize currentState properties based on provided options
  currentState.state = options.state ?? "initial";
  currentState.symbol = symbol("S_MIDDLE", currentState.state);

  const coloredTitle = colorize(title, titleColor, titleTypography);
  const coloredContent = content
    ? colorize(content, contentColor, contentTypography)
    : "";

  const styledTitle = applyVariant(
    [coloredTitle],
    titleVariant,
    variantOptions?.box,
  );
  const styledContent = coloredContent
    ? applyVariant([coloredContent], contentVariant, variantOptions?.box)
    : "";

  // Initial display of the prompt with the current symbol and styles
  console.log(`| ${currentState.symbol} ${styledTitle}`);
  if (styledContent) {
    console.log(`- ${styledContent}`);
  }
  console.log("-");

  // Update the currentState to "completed" after the initial display
  currentState.state = "completed";
  currentState.symbol = symbol("S_MIDDLE", currentState.state); // Update symbol for "completed" state

  // Move the cursor up by the number of lines used for the initial display
  const linesToMoveUp = styledContent ? 3 : 2;
  process.stdout.write(cursor.up(linesToMoveUp));

  // Clear each line and replace with the updated prompt
  process.stdout.write(
    `${erase.line}| ${currentState.symbol} ${styledTitle}\n`,
  );
  if (styledContent) {
    process.stdout.write(`${erase.line}- ${styledContent}\n`);
  }
  process.stdout.write(`${erase.line}-\n`);
}
