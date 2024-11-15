import type { TSchema, Static } from "@sinclair/typebox";

import { Value } from "@sinclair/typebox/value";
import { stdin as input, stdout as output } from "node:process";
import readline from "node:readline/promises";
import { cursor } from "sisteransi";

import type { PromptOptions } from "~/types/prod";

import { msg, fmt } from "~/utils/messages";

export async function textPrompt<T extends TSchema>(
  options: PromptOptions<T>,
): Promise<Static<T>> {
  const {
    title,
    titleColor,
    titleTypography,
    titleVariant,
    content,
    contentColor,
    contentTypography,
    contentVariant,
    hint,
    schema,
    validate,
    defaultValue = "",
    borderColor = "none",
    variantOptions,
  } = options;

  const rl = readline.createInterface({ input, output });

  let userTitle = title;

  if (titleVariant) {
    userTitle = ` ${title}`;
  }

  const question = fmt({
    type: "M_GENERAL",
    title: userTitle,
    titleColor,
    titleTypography,
    titleVariant,
    content,
    contentColor,
    contentTypography,
    contentVariant,
    hint,
    borderColor,
    variantOptions,
  });

  const validateAnswer = async (answer: string): Promise<string | true> => {
    if (schema && !Value.Check(schema, answer)) {
      return [...Value.Errors(schema, answer)][0]?.message || "Invalid input.";
    }
    if (validate) {
      const validation = await validate(answer);
      return validation === true ? true : validation || "Invalid input.";
    }
    return true;
  };

  while (true) {
    rl.write(defaultValue as string);

    const answer = (await rl.question(question)).trim() || defaultValue;
    const validation = await validateAnswer(answer as string);

    if (validation === true) {
      msg({ type: "M_NEWLINE", title: "", borderColor });
      rl.close();
      return answer as Static<T>;
    } else {
      msg({ type: "M_ERROR", title: validation });
    }
  }
}
