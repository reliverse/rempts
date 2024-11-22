import type { TSchema, Static } from "@sinclair/typebox";

import { symbol } from "@/deprecated/reliverse/experiments/utils/symbols.js";
import { Value } from "@sinclair/typebox/value";
import { stdin as input, stdout as output } from "node:process";
import readline from "node:readline/promises";
import { cursor, erase } from "sisteransi";

import type {
  PromptOptionsDeprecated,
  PromptStateDeprecated,
} from "~/types/internal.js";

import { colorize } from "~/utils/colorize.js";
import { applyVariant } from "~/utils/variants.js";

export async function textPrompt<T extends TSchema>(
  options: PromptOptionsDeprecated<T>,
  currentState: PromptStateDeprecated = {
    id: "",
    state: "initial",
    symbol: symbol("S_MIDDLE", "initial"),
    value: undefined,
  },
): Promise<Static<T>> {
  const {
    title,
    stateCompletedTitle,
    hint,
    validate,
    defaultValue,
    schema,
    titleColor,
    titleTypography,
    content,
    contentColor,
    contentTypography,
    titleVariant,
    contentVariant,
    action,
  } = options;

  currentState.state = options.state ?? "initial";
  currentState.symbol = symbol("S_MIDDLE", currentState.state);

  const rl = readline.createInterface({ input, output });

  const coloredTitle = colorize(title, titleColor, titleTypography);
  const completedTitle = colorize(
    stateCompletedTitle ?? title,
    titleColor,
    titleTypography,
  );
  const coloredContent = content
    ? colorize(content, contentColor, contentTypography)
    : "";

  const titleText = applyVariant([coloredTitle], titleVariant);
  const completedTitleText = applyVariant([completedTitle], titleVariant);
  const contentText = coloredContent
    ? applyVariant([coloredContent], contentVariant)
    : "";

  const promptLines = [titleText, contentText].filter(Boolean);
  const promptText = promptLines.map((line) => line).join("\n");

  const question = `${promptText}${hint ? ` (${hint})` : ""}${
    defaultValue ? ` [${defaultValue}]` : ""
  }: `;

  function displayPrompt(isCompleted = false) {
    const displayTitle = isCompleted ? completedTitleText : titleText;
    process.stdout.write(
      `${cursor.move(-999, 0)}${erase.line}${currentState.symbol} ${displayTitle}\n`,
    );
    if (contentText) {
      process.stdout.write(`${erase.line}- ${contentText}\n`);
    }
    process.stdout.write(`${erase.line}-\n`);
  }

  function clearPrompt() {
    const linesToClear = contentText ? 3 : 2;
    process.stdout.write(
      cursor.move(-999, -linesToClear) + erase.down(linesToClear),
    );
  }

  // Initial display of the prompt
  // displayPrompt();

  while (true) {
    const answer = (await rl.question(question)) || defaultValue;

    if (!answer) {
      continue;
    }

    let isValid = true;
    let errorMessage = "";

    if (schema) {
      isValid = Value.Check(schema, answer);
      if (!isValid) {
        const errors = [...Value.Errors(schema, answer)];
        errorMessage = errors[0]?.message || "Invalid input.";
        currentState.state = "error";
        currentState.symbol = symbol("S_MIDDLE", currentState.state);
      }
    }

    if (validate && isValid) {
      const validation = await validate(answer);
      if (validation !== true) {
        isValid = false;
        errorMessage =
          typeof validation === "string" ? validation : "Invalid input.";
        currentState.state = "error";
        currentState.symbol = symbol("S_MIDDLE", currentState.state);
      }
    }

    if (isValid) {
      // Execute the action before marking the prompt as completed
      if (action) {
        await action();
      }

      // Update state to "completed" and display the completed title
      currentState.state = "completed";
      currentState.symbol = symbol("S_MIDDLE", currentState.state);
      currentState.value = answer;

      clearPrompt();
      displayPrompt(true); // Display completed prompt

      rl.close();
      return answer as Static<T>;
    } else {
      // Clear the previous prompt, re-display title and message, and then display error message
      clearPrompt();
      displayPrompt();
      process.stdout.write(
        `${erase.line}${currentState.symbol} ${errorMessage}\n`,
      );
    }
  }
}
