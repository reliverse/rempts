import type { TSchema, Static } from "@sinclair/typebox";

import { Value } from "@sinclair/typebox/value";
import { stdin as input, stdout as output } from "node:process";
import readline from "node:readline/promises";

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
  const coloredMessage = message
    ? colorize(message, msgColor, msgTypography)
    : "";

  const titleText = applyVariant([coloredTitle], titleVariant);
  const messageText = coloredMessage
    ? applyVariant([coloredMessage], msgVariant)
    : "";

  const promptLines = [titleText, messageText].filter(Boolean);
  const promptText = promptLines.map((line) => line).join("\n");

  const question = `${promptText}${hint ? ` (${hint})` : ""}${
    defaultValue ? ` [${defaultValue}]` : ""
  }: `;

  function displayPrompt(answer?: string) {
    console.log(`${currentState.figure} ${titleText}`);
    if (messageText) {
      console.log(`- ${messageText}`);
    }
    console.log(answer ?? "-");
  }

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

      displayPrompt(answer); // Display completed prompt with answer

      rl.close();
      return answer as Static<T>;
    } else {
      displayPrompt();
      console.log(`${currentState.figure} ${errorMessage}`);
    }
  }
}
