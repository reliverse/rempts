import type { TSchema, Static } from "@sinclair/typebox";

import { Value } from "@sinclair/typebox/value";
import { stdin as input, stdout as output } from "node:process";
import readline from "node:readline/promises";

import type {
  ColorName,
  TypographyName,
  VariantName,
} from "~/types/general.js";

import { fmt, msg } from "~/utils/messages.js";
import {
  countLines,
  deleteLastLine,
  deleteLastLines,
} from "~/utils/terminal.js";

/**
 * PromptOptions for inputPrompt focusing on string input.
 */
type InputPromptOptions = {
  title: string;
  hint?: string;
  validate?: (value: string) => string | void | Promise<string | void>;
  defaultValue?: string;
  schema?: TSchema;
  titleColor?: ColorName;
  titleTypography?: TypographyName;
  titleVariant?: VariantName;
  content?: string;
  contentColor?: ColorName;
  contentTypography?: TypographyName;
  contentVariant?: VariantName;
  borderColor?: ColorName;
  variantOptions?: any;
  placeholder?: string;
};

/**
 * Prompts the user to enter input, with optional validation and default value.
 * @param options Configuration options for the prompt.
 * @returns The input entered by the user or the default value.
 */
export async function inputPrompt(
  options: InputPromptOptions,
): Promise<string> {
  const {
    title,
    hint,
    validate,
    defaultValue = "",
    schema,
    titleColor = "cyanBright",
    titleTypography = "bold",
    titleVariant,
    content,
    contentColor,
    contentTypography,
    contentVariant,
    borderColor = "viceGradient",
    variantOptions,
    placeholder,
  } = options;

  const rl = readline.createInterface({ input, output });

  let linesToDelete = 0;
  let errorMessage = "";
  let currentInput = "";
  let showPlaceholder = true;

  while (true) {
    if (linesToDelete > 0) {
      deleteLastLines(linesToDelete);
      linesToDelete = 0;
    }

    const question = fmt({
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
      hint,
      placeholder: showPlaceholder ? placeholder : undefined,
      variantOptions,
      errorMessage,
    });

    const questionLines = countLines(question);
    const prompt = await rl.question(question);
    currentInput = prompt.trim();

    if (showPlaceholder && currentInput !== "") {
      showPlaceholder = false;
      deleteLastLine();
      deleteLastLine();
      msg({ type: "M_MIDDLE", title: `  ${currentInput}` });
    }

    linesToDelete += questionLines + 1;

    const answer = currentInput || defaultValue;

    if (currentInput === "" && defaultValue !== "") {
      deleteLastLine();
      deleteLastLine();
      const defaultMsg = fmt({
        type: "M_MIDDLE",
        title: `  ${defaultValue}`,
        borderColor,
      });
      console.log(defaultMsg);
      linesToDelete += countLines(defaultMsg);
    }

    let isValid = true;
    errorMessage = "";
    if (schema) {
      isValid = Value.Check(schema, answer);
      if (!isValid) {
        const errors = [...Value.Errors(schema, answer)];
        if (errors.length > 0) {
          errorMessage = errors[0]?.message ?? "Invalid input.";
        } else {
          errorMessage = "Invalid input.";
        }
      }
    }

    if (validate && isValid) {
      const validationResult = await validate(answer);
      if (typeof validationResult === "string") {
        isValid = false;
        errorMessage = validationResult;
      }
    }

    if (isValid) {
      msg({ type: "M_NEWLINE" });
      rl.close();
      return answer;
    } else {
      // Prepare to re-render with error message
      linesToDelete += 0;
    }
  }
}
