import type { Static, TSchema } from "@sinclair/typebox";

import { Value } from "@sinclair/typebox/value";
import { stdin as input, stdout as output } from "node:process";
import readline from "node:readline/promises";
import color from "picocolors";

import type { PromptOptions } from "~/types";

import { colorize } from "~/utils/colorize";

export async function multiselectPrompt<T extends TSchema>(
  options: PromptOptions<T>,
): Promise<Static<T>> {
  const { title, choices, schema, titleColor } = options;
  if (!choices || choices.length === 0) {
    throw new Error("Choices are required for multiselect prompt.");
  }

  const coloredTitle = colorize(title, titleColor);
  console.log(color.cyanBright(color.bold(coloredTitle)));
  choices.forEach((choice, index) => {
    console.log(
      `${index + 1}) ${choice.title} ${
        choice.description ? `- ${choice.description}` : ""
      }`,
    );
  });

  const rl = readline.createInterface({ input, output });

  const question = `Enter your choices (comma-separated numbers between 1-${choices.length}): `;

  while (true) {
    const answer = await rl.question(question);
    const selections = answer.split(",").map((s) => s.trim());
    const invalidSelections = selections.filter((s) => {
      const num = Number(s);
      return isNaN(num) || num < 1 || num > choices.length;
    });
    if (invalidSelections.length > 0) {
      console.log(
        `Invalid selections: ${invalidSelections.join(
          ", ",
        )}. Please enter numbers between 1 and ${choices.length}.`,
      );
      continue;
    }
    const selectedValues = selections.map((s) => choices[Number(s) - 1]?.value);

    let isValid = true;
    let errorMessage = "Invalid input.";
    if (schema) {
      isValid = Value.Check(schema, selectedValues);
      if (!isValid) {
        const errors = [...Value.Errors(schema, selectedValues)];
        if (errors.length > 0) {
          errorMessage = errors[0]?.message ?? "Invalid input.";
        }
      }
    }
    if (isValid) {
      rl.close();
      return selectedValues as Static<T>;
    } else {
      console.log(errorMessage);
    }
  }
}
