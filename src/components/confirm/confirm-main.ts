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
  defaultValue?: boolean; // true = Y, false = N
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

  // If no defaultValue is passed, default to true (Y)
  const effectiveDefault = defaultValue !== undefined ? defaultValue : true;

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

      // Adjust the default hint based on defaultValue
      const defaultHint = effectiveDefault ? "[Y/n]" : "[y/N]";

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

      if (!answer) {
        // User pressed Enter, use the default value
        const injectedAnswer = effectiveDefault ? "y" : "n";
        process.stdout.write(`${formattedBar}  ${injectedAnswer}\n`);
        value = effectiveDefault;
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
