import type { TSchema, Static } from "@sinclair/typebox";

import { Value } from "@sinclair/typebox/value";
import { stdin as input, stdout as output } from "node:process";
import readline from "node:readline/promises";

import type { PromptOptions } from "~/types/prod";

import { bar, fmt, msg } from "~/utils/messages";
import { deleteLastLines } from "~/utils/terminal";

export async function numberPrompt<T extends TSchema>(
  options: PromptOptions<T>,
): Promise<Static<T>> {
  const {
    title,
    hint,
    validate,
    defaultValue,
    schema,
    titleColor,
    titleTypography,
    titleVariant,
    content,
    contentColor,
    contentTypography,
    contentVariant,
    borderColor,
  } = options;

  const rl = readline.createInterface({ input, output });

  const question = fmt({
    type: "M_GENERAL",
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
  });

  while (true) {
    const answer = (await rl.question(question)) || defaultValue;

    if (answer === defaultValue) {
      deleteLastLines(3);
      msg({
        type: "M_MIDDLE",
        title: fmt({
          type: "M_NULL",
          title: `  ${defaultValue}`,
          borderColor,
        }),
      });
    }

    const num = Number(answer);
    if (isNaN(num)) {
      msg({ type: "M_ERROR", title: "Please enter a valid number." });
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
      msg({ type: "M_ERROR", title: errorMessage });
    }
  }
}
