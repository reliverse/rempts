import type { TSchema, Static } from "@sinclair/typebox";

import { Value } from "@sinclair/typebox/value";
import { stdin as input, stdout as output } from "node:process";
import readline from "node:readline/promises";
import { cursor, erase } from "sisteransi";

import type { PromptOptions, PromptState } from "~/types";

import { colorize } from "~/utils/colorize";
import { getFigure } from "~/utils/states";
import { applyVariant } from "~/utils/variant";

export async function textPrompt<T extends TSchema>(
  options: PromptOptions<T>,
  currentState: PromptState = {
    id: "",
    state: "initial",
    figure: getFigure("initial"),
    value: undefined,
  },
): Promise<Static<T>> {
  const {
    title,
    stateCompletedTitle,
    hint,
    validate,
    default: defaultValue,
    schema,
    titleColor,
    titleTypography,
    message,
    msgColor,
    msgTypography,
    titleVariant,
    msgVariant,
    action,
  } = options;

  currentState.state = options.state ?? "initial";
  currentState.figure = getFigure(currentState.state);

  const rl = readline.createInterface({ input, output });

  const coloredTitle = colorize(title, titleColor, titleTypography);
  const completedTitle = colorize(
    stateCompletedTitle ?? title,
    titleColor,
    titleTypography,
  );
  const coloredMessage = message
    ? colorize(message, msgColor, msgTypography)
    : "";

  const titleText = applyVariant([coloredTitle], titleVariant);
  const completedTitleText = applyVariant([completedTitle], titleVariant);
  const messageText = coloredMessage
    ? applyVariant([coloredMessage], msgVariant)
    : "";

  const promptLines = [titleText, messageText].filter(Boolean);
  const promptText = promptLines.map((line) => line).join("\n");

  const question = `${promptText}${hint ? ` (${hint})` : ""}${
    defaultValue ? ` [${defaultValue}]` : ""
  }: `;

  function displayPrompt(isCompleted = false) {
    const displayTitle = isCompleted ? completedTitleText : titleText;
    process.stdout.write(
      `${cursor.move(-999, 0)}${erase.line}${currentState.figure} ${displayTitle}\n`,
    );
    if (messageText) {
      process.stdout.write(`${erase.line}- ${messageText}\n`);
    }
    process.stdout.write(`${erase.line}-\n`);
  }

  function clearPrompt() {
    const linesToClear = messageText ? 3 : 2;
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
        currentState.figure = getFigure(currentState.state);
      }
    }

    if (validate && isValid) {
      const validation = await validate(answer);
      if (validation !== true) {
        isValid = false;
        errorMessage =
          typeof validation === "string" ? validation : "Invalid input.";
        currentState.state = "error";
        currentState.figure = getFigure(currentState.state);
      }
    }

    if (isValid) {
      // Execute the action before marking the prompt as completed
      if (action) {
        await action();
      }

      // Update state to "completed" and display the completed title
      currentState.state = "completed";
      currentState.figure = getFigure("completed");
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
        `${erase.line}${currentState.figure} ${errorMessage}\n`,
      );
    }
  }
}
