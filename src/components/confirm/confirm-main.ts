import { stdin as input, stdout as output } from "node:process";
import readline from "node:readline/promises";

import type {
  ColorName,
  TypographyName,
  VariantName,
} from "~/types/general.js";

import { colorize } from "~/utils/colorize.js";
import { bar, fmt, msg } from "~/utils/messages.js";
import { countLines, deleteLastLines } from "~/utils/terminal.js";

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
  hintColor?: ColorName;
  variantOptions?: any;
  action?: () => Promise<void>;
};

/**
 * Prompts the user for a yes/no confirmation.
 *
 * @param options - Configuration options for the confirmation prompt.
 * @returns A promise that resolves to a boolean based on user input.
 */
export async function confirmPrompt(
  options: ConfirmPromptOptions,
): Promise<boolean> {
  const {
    title = "",
    defaultValue,
    titleColor = "blueBright",
    titleTypography = "bold",
    titleVariant,
    content,
    contentColor = "dim",
    contentTypography = "italic",
    contentVariant,
    borderColor = "viceGradient",
    hintColor = "gray",
    variantOptions,
    action,
  } = options;

  const rl = readline.createInterface({ input, output });

  let linesToDelete = 0;
  let errorMessage = "";

  try {
    while (true) {
      if (linesToDelete > 0) {
        deleteLastLines(linesToDelete);
      }

      const question = fmt({
        hintColor,
        type: errorMessage !== "" ? "M_ERROR" : "M_GENERAL",
        title,
        titleColor,
        titleTypography,
        titleVariant,
        content,
        contentColor,
        contentTypography,
        contentVariant,
        borderColor,
        variantOptions,
        errorMessage,
      });

      let defaultHint = "";
      if (defaultValue) {
        defaultHint = "[Y/n]";
      } else if (!defaultValue) {
        defaultHint = "[y/N]";
      } else {
        defaultHint = "[y/n]";
      }

      const fullPrompt = `${question}${colorize(defaultHint, hintColor)}: `;

      const formattedPrompt = fmt({
        hintColor,
        type: "M_NULL",
        title: fullPrompt,
      });

      const questionLines = countLines(formattedPrompt);
      linesToDelete = questionLines + 1; // +1 for the user's input line

      const answer = (await rl.question(formattedPrompt)).toLowerCase().trim();

      let value: boolean;

      const formattedBar = bar({ borderColor });

      if (!answer && defaultValue !== undefined) {
        // Inject the used answer into the console
        const injectedAnswer = defaultValue ? "y" : "n";
        process.stdout.write(`${formattedBar}  ${injectedAnswer}\n`);
        value = defaultValue;
      } else if (answer === "y" || answer === "yes") {
        value = true;
      } else if (answer === "n" || answer === "no") {
        value = false;
      } else {
        errorMessage = 'Please answer with "y" or "n".';
        continue;
      }

      msg({ type: "M_NEWLINE" });
      rl.close();
      if (action && value) {
        await action();
      }
      return value;
    }
  } finally {
    rl.close();
  }
}
