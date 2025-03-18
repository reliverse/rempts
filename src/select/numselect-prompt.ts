import { Value } from "@sinclair/typebox/value";
import { stdin as input, stdout as output } from "node:process";
import readline from "node:readline/promises";

import type { PromptOptions } from "~/types/general.js";

import {
  bar,
  countLines,
  deleteLastLines,
  fmt,
  msg,
  deleteLastLine,
} from "~/main.js";
import { colorize } from "~/utils/colorize.js";

type NumSelectPromptOptions = PromptOptions & {
  inline?: boolean;
  defaultValue?: string;
};

export async function numSelectPrompt(opts: NumSelectPromptOptions) {
  const {
    title = "",
    hint,
    hintPlaceholderColor = "blue",
    validate,
    defaultValue,
    schema,
    titleColor = "cyan",
    titleTypography = "none",
    titleVariant,
    content,
    contentColor = "dim",
    contentTypography = "italic",
    contentVariant,
    borderColor = "dim",
    variantOptions,
    inline = true,
    choices,
  } = opts;

  if (!choices || choices.length === 0) {
    throw new Error("Choices are required for select prompt.");
  }

  const rl = readline.createInterface({ input, output });

  const formattedBar = bar({ borderColor });

  let linesToDelete = 0;
  let errorMessage = "";

  while (true) {
    if (linesToDelete > 0) {
      deleteLastLines(linesToDelete);
    }

    const { text: question } = fmt({
      hintPlaceholderColor,
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
      variantOptions,
      errorMessage,
    });

    // Generate choices text
    let choicesText = "";
    if (inline) {
      choicesText = choices
        .map(
          (choice, index) =>
            `${index + 1}) ${choice.title}${
              choice.description ? ` (${choice.description})` : ""
            }`,
        )
        .join(" / ");
    } else {
      choicesText = choices
        .map(
          (choice, index) =>
            `${index + 1}) ${choice.title}${
              choice.description ? ` - ${choice.description}` : ""
            }`,
        )
        .join(`\n${formattedBar} `);
    }

    // Combine question and choices
    const { text: formattedPrompt } = fmt({
      hintPlaceholderColor,
      type: "M_NULL",
      title: `${question}\n${choicesText}\n${formattedBar}  ${colorize(
        "Enter your choice:",
        contentColor,
      )}\n${formattedBar}  `,
    });

    const questionLines = countLines(formattedPrompt);

    // Include the extra lines in linesToDelete
    linesToDelete = questionLines + 1; // +1 for the user's input line

    const prompt = await rl.question(formattedPrompt);

    const answer = prompt.trim() || defaultValue;

    // Show defaultValue if used
    if (!prompt.trim() && defaultValue !== undefined) {
      deleteLastLine();
      msg({
        type: "M_MIDDLE",
        title: `  ${defaultValue}`,
        titleColor: "none",
      });
      msg({ type: "M_BAR", borderColor });
    }

    const num = Number(answer);
    if (Number.isNaN(num) || num < 1 || num > choices.length) {
      errorMessage = `Please enter a number between 1 and ${choices.length}.`;
      continue;
    }

    const selectedChoice = choices[num - 1];
    const selectedValue = selectedChoice?.id ?? num;

    let isValid = true;
    errorMessage = ""; // Reset errorMessage

    if (schema) {
      isValid = Value.Check(schema, selectedValue);
      if (!isValid) {
        const errors = [...Value.Errors(schema, selectedValue)];
        if (errors.length > 0) {
          errorMessage = errors[0]?.message ?? "Invalid input.";
        } else {
          errorMessage = "Invalid input.";
        }
      }
    }
    if (validate && isValid) {
      const validation = await validate(selectedValue);
      if (validation !== true) {
        isValid = false;
        errorMessage =
          typeof validation === "string" ? validation : "Invalid input.";
      }
    }

    if (isValid) {
      rl.close();
      if (selectedChoice?.action) {
        await selectedChoice.action();
      }
      return selectedValue;
    }
  }
}
