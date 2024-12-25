import { stdin as input, stdout as output } from "node:process";
import readline from "node:readline/promises";
import pc from "picocolors";

import type { ColorName, TypographyName } from "~/types/general.js";
import type { VariantName } from "~/utils/variants.js";

import { colorize } from "~/utils/colorize.js";
import { bar, msg, msgUndoAll } from "~/utils/messages.js";
import { deleteLastLine } from "~/utils/terminal.js";

export type ConfirmPromptOptions = {
  title: string;
  defaultValue?: boolean;
  content?: string;
  titleColor?: ColorName;
  titleTypography?: TypographyName;
  titleVariant?: VariantName;
  contentColor?: ColorName;
  contentTypography?: TypographyName;
  contentVariant?: VariantName;
  borderColor?: ColorName;
  hintPlaceholderColor?: ColorName;
  variantOptions?: any;
  action?: () => Promise<void>;
  displayInstructions?: boolean;
  debug?: boolean;
  endTitle?: string;
  endTitleColor?: ColorName;
  border?: boolean;
  terminalWidth?: number;
};

/**
 * Builds the prompt lines using `msg()` calls.
 * Returns the number of interactive UI lines rendered (for clearing during re-renders).
 */
function renderPrompt(params: {
  title: string;
  content?: string;
  borderColor: ColorName;
  titleColor: ColorName;
  titleTypography: TypographyName;
  titleVariant?: VariantName;
  contentColor: ColorName;
  contentTypography: TypographyName;
  contentVariant?: VariantName;
  hintPlaceholderColor: ColorName;
  border: boolean;
  variantOptions: any;
  errorMessage: string;
  effectiveDefault: boolean;
  displayInstructions: boolean;
  defaultHint: string;
  instructions: string;
  isRerender?: boolean;
}): number {
  const {
    title,
    content,
    borderColor,
    titleColor,
    titleTypography,
    titleVariant,
    contentColor,
    contentTypography,
    contentVariant,
    hintPlaceholderColor,
    border,
    variantOptions,
    errorMessage,
    displayInstructions,
    instructions,
    isRerender = false,
  } = params;

  let uiLineCount = 0;

  // Only render title and content on first render
  if (!isRerender) {
    msg({
      hintPlaceholderColor,
      type: errorMessage ? "M_ERROR" : "M_GENERAL",
      title,
      titleColor,
      titleTypography,
      ...(titleVariant ? { titleVariant } : {}),
      ...(content
        ? {
            content: content
              .split("\n")
              .map((line) => line.trim())
              .join("\n"),
          }
        : {}),
      contentColor,
      contentTypography,
      ...(contentVariant ? { contentVariant } : {}),
      borderColor,
      variantOptions,
      errorMessage,
      border,
    });
  }

  // Display hint and instructions together
  if (displayInstructions && !isRerender) {
    msg({
      type: "M_NULL",
      title: pc.blue(instructions),
    });
    uiLineCount++;
  }

  // Display error message if present
  if (errorMessage) {
    msg({
      type: "M_NULL",
      title: pc.redBright(errorMessage),
    });
    uiLineCount++;
  }

  return uiLineCount;
}

/**
 * Ends the prompt by optionally displaying an end message and running the action if confirmed.
 * Preserves the last prompt state unless there's an endTitle.
 */
async function endPrompt(
  endTitle: string,
  endTitleColor: ColorName,
  titleTypography: TypographyName,
  titleVariant: VariantName | undefined,
  border: boolean,
  borderColor: ColorName,
  action?: () => Promise<void>,
  value?: boolean,
): Promise<boolean> {
  if (action && value) {
    await action();
  }

  if (endTitle) {
    // Only clear previous lines if we need to show an end title
    msgUndoAll();
    msg({
      type: "M_END",
      title: endTitle,
      titleColor: endTitleColor,
      titleTypography,
      ...(titleVariant ? { titleVariant } : {}),
      border,
      borderColor,
    });
  } else {
    // Add a bar between prompts when there's no end title
    msg({
      type: "M_BAR",
      borderColor,
    });
  }

  return value ?? false;
}

/**
 * Prompts the user with a yes/no question, returning a boolean based on their input.
 */
export async function confirmPrompt(
  options: ConfirmPromptOptions,
): Promise<boolean> {
  const {
    title = "",
    defaultValue,
    titleColor = "cyan",
    titleTypography = "none",
    titleVariant,
    content,
    contentColor = "dim",
    contentTypography = "italic",
    contentVariant,
    borderColor = "dim",
    hintPlaceholderColor = "blue",
    variantOptions,
    action,
    displayInstructions = false,
    endTitle = "",
    endTitleColor = "dim",
    border = true,
  } = options;

  const rl = readline.createInterface({ input, output });
  let errorMessage = "";
  const effectiveDefault = defaultValue ?? true;

  // Define the default hint
  const defaultHint = effectiveDefault ? "[Y/n]" : "[y/N]";
  // Only prepend the default hint to the title if instructions are not displayed
  const adjustedTitle = displayInstructions
    ? title
    : `${pc.blue(defaultHint)} ${title}`;

  const instructions = `Use <y/n> to confirm or deny, <Enter> for default (${effectiveDefault ? "Y" : "N"}), <Ctrl+C> to exit`;

  let lastUILineCount = 0;

  try {
    while (true) {
      // Clear only the previous UI lines if this is a re-render
      if (lastUILineCount > 0) {
        for (let i = 0; i < lastUILineCount; i++) {
          process.stdout.write("\x1b[1A\x1b[2K");
        }
      }

      // Render prompt and track UI line count
      lastUILineCount = renderPrompt({
        title: adjustedTitle,
        ...(content ? { content } : {}),
        borderColor,
        titleColor,
        titleTypography,
        ...(titleVariant ? { titleVariant } : {}),
        contentColor,
        contentTypography,
        ...(contentVariant ? { contentVariant } : {}),
        hintPlaceholderColor,
        border,
        variantOptions,
        errorMessage,
        effectiveDefault,
        displayInstructions,
        defaultHint,
        instructions,
        isRerender: errorMessage !== "", // Only rerender if there's an error
      });

      const formattedBar = bar({ borderColor });
      const answer = (await rl.question(`${formattedBar}  `))
        .toLowerCase()
        .trim();

      let result: boolean;
      if (!answer) {
        // Enter pressed with no input, use default
        // Show the chosen answer without clearing previous lines
        deleteLastLine();
        msg({
          type: "M_NULL",
          title: `${colorize(pc.reset(formattedBar), borderColor)}  ${pc.reset(effectiveDefault ? "y" : "n")}`,
        });
        result = effectiveDefault;
      } else if (answer === "y" || answer === "yes") {
        result = true;
      } else if (answer === "n" || answer === "no") {
        result = false;
      } else {
        // Invalid answer, show error and repeat
        errorMessage = 'Please answer with "y" or "n".';
        // Clear the invalid input
        deleteLastLine();
        continue;
      }

      return await endPrompt(
        endTitle,
        endTitleColor,
        titleTypography,
        titleVariant ? titleVariant : undefined,
        border,
        borderColor,
        action,
        result,
      );
    }
  } finally {
    rl.close();
  }
}
