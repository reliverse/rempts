import { colorize, re } from "@reliverse/relico";
import { stdin as input, stdout as output } from "node:process";
import readline from "node:readline/promises";

import type {
  ColorName,
  ConfirmPromptOptions,
  TypographyName,
  VariantName,
} from "~/types.js";

import { bar, msg } from "~/libs/msg-fmt/messages.js";
import { deleteLastLine } from "~/libs/msg-fmt/terminal.js";
import { completePrompt } from "~/libs/utils/prompt-end.js";

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
      title: re.blue(instructions),
    });
    uiLineCount++;
  }

  // Display error message if present
  if (errorMessage) {
    msg({
      type: "M_NULL",
      title: re.redBright(errorMessage),
    });
    uiLineCount++;
  }

  return uiLineCount;
}

/**
 * Prompts the user with a yes/no question, returning a boolean based on their input.
 */
export async function confirmPrompt(
  options: ConfirmPromptOptions,
): Promise<boolean> {
  const {
    title = "",
    message, // Alias for title
    defaultValue,
    initialValue, // Alias for defaultValue
    content,
    titleColor = "cyan",
    titleTypography = "none",
    titleVariant,
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

  // Use message as alias for title, concatenating both if provided
  const finalTitle =
    message && title ? `${title}: ${message}` : (message ?? title ?? "Confirm");

  // Use initialValue as alias for defaultValue, prioritizing defaultValue if both are provided
  const finalDefaultValue = defaultValue ?? initialValue;

  const rl = readline.createInterface({ input, output });
  let errorMessage = "";
  const effectiveDefault = finalDefaultValue ?? true;

  // Define the default hint
  const defaultHint = effectiveDefault ? "[Y/n]" : "[y/N]";
  // Only prepend the default hint to the title if instructions are not displayed
  const adjustedTitle = displayInstructions
    ? finalTitle
    : `${re.blue(defaultHint)} ${finalTitle}`;

  const instructions = `Use <y/n> to confirm or deny, <Enter> for default (${effectiveDefault ? "Y" : "N"}), <Ctrl+C> to exit`;

  let lastUILineCount = 0;

  function endPrompt(isCtrlC = false): void {
    if (endTitle !== "") {
      msg({
        type: "M_END",
        title: endTitle,
        titleColor: endTitleColor,
        titleTypography,
        ...(titleVariant ? { titleVariant } : {}),
        border,
        borderColor,
      });
    }
    rl.close();
    if (isCtrlC) {
      process.exit(0);
    }
  }

  // Handle Ctrl+C
  rl.on("SIGINT", () => {
    endPrompt(true);
  });

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
          title: `${colorize(re.reset(formattedBar), borderColor)}  ${effectiveDefault ? "y" : "n"}`,
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

      return await completePrompt(
        "confirm",
        false,
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
