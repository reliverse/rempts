import { cursor, erase } from "sisteransi";

import type { PromptOptions, PromptState } from "~/types";

import { colorize } from "~/utils/colorize";
import { getFigure } from "~/utils/states";
import { applyVariant } from "~/utils/variant";

export async function startPrompt(
  options: PromptOptions,
  currentState: PromptState = {
    id: options.id ?? "start", // default to "start" or use provided ID
    state: options.state ?? "initial",
    figure: getFigure(options.state ?? "initial"),
    value: undefined,
  },
): Promise<void> {
  const {
    title,
    titleColor,
    titleTypography,
    titleVariant,
    message,
    msgColor,
    msgTypography,
    msgVariant,
    variantOptions,
  } = options;

  // Initialize currentState properties based on provided options
  currentState.state = options.state ?? "initial";
  currentState.figure = getFigure(currentState.state);

  const coloredTitle = colorize(title, titleColor, titleTypography);
  const coloredMessage = message
    ? colorize(message, msgColor, msgTypography)
    : "";

  const styledTitle = applyVariant(
    [coloredTitle],
    titleVariant,
    variantOptions?.box,
  );
  const styledMessage = coloredMessage
    ? applyVariant([coloredMessage], msgVariant, variantOptions?.box)
    : "";

  // Initial display of the prompt with the current figure and styles
  console.log(`| ${currentState.figure} ${styledTitle}`);
  if (styledMessage) {
    console.log(`- ${styledMessage}`);
  }
  console.log("-");

  // Update the currentState to "completed" after the initial display
  currentState.state = "completed";
  currentState.figure = getFigure("completed"); // Update figure for "completed" state

  // Move the cursor up by the number of lines used for the initial display
  const linesToMoveUp = styledMessage ? 3 : 2;
  process.stdout.write(cursor.up(linesToMoveUp));

  // Clear each line and replace with the updated prompt
  process.stdout.write(
    `${erase.line}| ${currentState.figure} ${styledTitle}\n`,
  );
  if (styledMessage) {
    process.stdout.write(`${erase.line}- ${styledMessage}\n`);
  }
  process.stdout.write(`${erase.line}-\n`);
}
