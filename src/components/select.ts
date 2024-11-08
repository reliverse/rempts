import type { Static, TSchema } from "@sinclair/typebox";

import { Value } from "@sinclair/typebox/value";
import { stdin as input, stdout as output } from "node:process";
import readline from "node:readline/promises";
import color from "picocolors";

import type { PromptOptions } from "~/types";

import { colorize } from "~/utils/colorize"; 

export async function selectPrompt<T extends TSchema>(
  options: PromptOptions<T>,
): Promise<Static<T>> {
  const {
    title,
    choices,
    default: defaultValue,
    schema,
    color: titleColor,
  } = options;
  if (!choices || choices.length === 0) {
    throw new Error("Choices are required for select prompt.");
  }

  const coloredTitle = colorize(title, titleColor); 
  console.log(color.cyanBright(color.bold(coloredTitle)));
  choices.forEach((choice, index) => {
    const isDefault =
      defaultValue === index + 1 || defaultValue === choice.value;
    console.log(
      `${index + 1}) ${choice.title} ${
        choice.description ? `- ${choice.description}` : ""
      }${isDefault ? " (default)" : ""}`,
    );
  });

  const rl = readline.createInterface({ input, output });

  const question = `Enter your choice (1-${choices.length})${
    defaultValue ? ` [${defaultValue}]` : ""
  }: `;

  while (true) {
    const answer = (await rl.question(question)) || defaultValue;
    const num = Number(answer);
    if (isNaN(num) || num < 1 || num > choices.length) {
      console.log(`Please enter a number between 1 and ${choices.length}.`);
      continue;
    }
    const selectedValue = choices[num - 1]?.value;

    let isValid = true;
    let errorMessage = "Invalid input.";
    if (schema) {
      isValid = Value.Check(schema, selectedValue);
      if (!isValid) {
        const errors = [...Value.Errors(schema, selectedValue)];
        if (errors.length > 0) {
          errorMessage = errors[0]?.message ?? "Invalid input.";
        }
      }
    }
    if (isValid) {
      rl.close();
      return selectedValue as Static<T>;
    } else {
      console.log(errorMessage);
    }
  }
}
