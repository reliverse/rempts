import type { Static, TSchema } from "@sinclair/typebox";

import { Value } from "@sinclair/typebox/value";
import { stdin as input, stdout as output } from "node:process";
import readline from "node:readline/promises";

import type { PromptOptions } from "~/types";

export async function datePrompt<T extends TSchema>(
  options: PromptOptions<T>,
): Promise<Static<T>> {
  const { title, hint, validate, default: defaultValue, schema } = options;
  const rl = readline.createInterface({ input, output });

  const question = `${title}${
    hint ? ` (${hint})` : ""
  }${defaultValue ? ` [${defaultValue}]` : ""}: `;

  while (true) {
    const answer = (await rl.question(question)) || defaultValue || "";
    const date = new Date(answer);
    if (isNaN(date.getTime())) {
      console.log("Please enter a valid date.");
      continue;
    }
    let isValid = true;
    let errorMessage = "Invalid input.";
    if (schema) {
      isValid = Value.Check(schema, date);
      if (!isValid) {
        const errors = [...Value.Errors(schema, date)];
        if (errors.length > 0) {
          errorMessage = errors[0]?.message ?? "Invalid input.";
        }
      }
    }
    if (validate && isValid) {
      const validation = await validate(date);
      if (validation !== true) {
        isValid = false;
        errorMessage =
          typeof validation === "string" ? validation : "Invalid input.";
      }
    }
    if (isValid) {
      rl.close();
      return date as Static<T>;
    } else {
      console.log(errorMessage);
    }
  }
}
