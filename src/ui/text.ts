import type { TSchema, Static } from "@sinclair/typebox";

import { Value } from "@sinclair/typebox/value";
import { stdin as input, stdout as output } from "node:process";
import readline from "node:readline/promises";

import type { PromptOptions, PromptState, State } from "~/types";

import { colorize } from "~/utils/colorize";
import { msg, fmt } from "~/utils/messages";
import { applyVariant } from "~/utils/variants";

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
    state = "initial",
    default: defaultValue = "",
  } = options;

  const rl = readline.createInterface({ input, output });

  const styledTitle = applyVariant(
    [colorize(title, titleColor, titleTypography)],
    titleVariant,
  );
  // msg("M_MIDDLE", state, styledTitle, 1);

  // const promptText = [
  //   applyVariant([colorize(title, titleColor, titleTypography)], titleVariant),
  //   message
  //     ? applyVariant([colorize(message, msgColor, msgTypography)], msgVariant)
  //     : "",
  // ]
  //   .filter(Boolean)
  //   .join("\n");

  // const question = `${currentState.symbol} ${promptText}${hint ? ` (${hint})` : ""}${
  //   defaultValue ? ` [${defaultValue}]` : ""
  // }: `;

  const text = [styledTitle, content].filter(Boolean).join("\n");
  const question = fmt("M_MIDDLE", text);

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
    const answer = (await rl.question(question)) || defaultValue;
    // if (!answer) continue;
    const validation = await validateAnswer(answer);
    if (validation === true) {
      rl.close();
      return answer as Static<T>;
    } else {
      msg("M_ERROR", validation);
    }
  }
}
