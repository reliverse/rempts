import type { TSchema, Static } from "@sinclair/typebox";

import { Value } from "@sinclair/typebox/value";
import { stdin as input, stdout as output } from "node:process";
import readline from "node:readline/promises";

import type { PromptOptions, State } from "~/types";

import { colorize } from "~/utils/colorize";
import { getFigure } from "~/utils/states";
import { applyVariant } from "~/utils/variant";

export async function numberPrompt<T extends TSchema>(
  options: PromptOptions<T>,
): Promise<Static<T>> {
  const {
    title,
    hint,
    validate,
    default: defaultValue,
    schema,
    titleColor,
    titleTypography,
    titleVariant,
    message,
    msgColor,
    msgTypography,
    msgVariant,
    state: initialState = "initial",
  } = options;

  let state = initialState;
  let figure = getFigure(state);

  function setState(newState: State) {
    state = newState;
    figure = getFigure(state);
  }

  const rl = readline.createInterface({ input, output });

  const coloredTitle = colorize(title, titleColor, titleTypography);
  const coloredMessage = message
    ? colorize(message, msgColor, msgTypography)
    : "";

  const titleText = applyVariant([coloredTitle], titleVariant);
  const messageText = coloredMessage
    ? applyVariant([coloredMessage], msgVariant)
    : "";

  const promptLines = [titleText, messageText].filter(Boolean);
  const promptText = promptLines.map((line) => line).join("\n");

  const question = `${promptText}${
    hint ? ` (${hint})` : ""
  }${defaultValue !== undefined ? ` [${defaultValue}]` : ""}: `;

  while (true) {
    const answer = (await rl.question(question)) || defaultValue;

    const num = Number(answer);
    if (isNaN(num)) {
      setState("error");
      console.log(`${figure} Please enter a valid number.`);
      continue;
    }

    let isValid = true;
    let errorMessage = "Invalid input.";
    if (schema) {
      isValid = Value.Check(schema, num);
      if (!isValid) {
        const errors = [...Value.Errors(schema, num)];
        if (errors.length > 0) {
          errorMessage = errors[0]?.message ?? "Invalid input.";
        }
      }
    }
    if (validate && isValid) {
      const validation = await validate(num);
      if (validation !== true) {
        isValid = false;
        errorMessage =
          typeof validation === "string" ? validation : "Invalid input.";
      }
    }
    if (isValid) {
      rl.close();
      return num as Static<T>;
    } else {
      setState("error");
      console.log(`${figure} ${errorMessage}`);
    }
  }
}
