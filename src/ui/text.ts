import type { TSchema, Static } from "@sinclair/typebox";

import { Value } from "@sinclair/typebox/value";
import { stdin as input, stdout as output } from "node:process";
import readline from "node:readline/promises";

import type { PromptOptions } from "~/types";

import { colorize } from "~/utils/colorize";
import { symbol } from "~/utils/states";
import { applyVariant } from "~/utils/variant";

export async function textPrompt<T extends TSchema>(
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
    message,
    msgColor,
    msgTypography,
    titleVariant,
    msgVariant,
    defaultColor,
    defaultTypography,
    state = "initial",
  } = options;

  const rl = readline.createInterface({ input, output });

  const figure = symbol(state);

  const coloredTitle = colorize(title, titleColor, titleTypography);
  const coloredMessage = message
    ? colorize(message, msgColor, msgTypography)
    : "";

  const titleText = applyVariant([coloredTitle], titleVariant);
  const messageText = coloredMessage
    ? applyVariant([coloredMessage], msgVariant)
    : "";

  const promptLines = [titleText, messageText].filter(Boolean);
  const promptText = promptLines
    .map((line, index) => `${index === 0 ? figure : " "} ${line}`)
    .join("\n");

  const coloredDefaultValue = defaultValue
    ? colorize(
        defaultValue.toString(),
        defaultColor || "dim",
        defaultTypography || "bold",
      )
    : "";

  const question = `${promptText}${
    hint ? ` (${hint})` : ""
  }${coloredDefaultValue ? ` [${coloredDefaultValue}]` : ""}: `;

  while (true) {
    const answer = (await rl.question(question)) || defaultValue || "";
    let isValid = true;
    let errorMessage = "Invalid input.";

    if (schema) {
      isValid = Value.Check(schema, answer);
      if (!isValid) {
        const errors = [...Value.Errors(schema, answer)];
        if (errors.length > 0) {
          errorMessage = errors[0]?.message ?? "Invalid input.";
        }
      }
    }

    if (validate && isValid) {
      const validation = await validate(answer);
      if (validation !== true) {
        isValid = false;
        errorMessage =
          typeof validation === "string" ? validation : "Invalid input.";
      }
    }

    if (isValid) {
      rl.close();
      return answer as Static<T>;
    } else {
      // state = "error";
      // const errorFigure = symbol(state);
      // console.log(`${errorFigure} ${errorMessage}`);

      const errorFigure = symbol("error");
      console.log(`${errorFigure} ${errorMessage}`);
    }
  }
}
