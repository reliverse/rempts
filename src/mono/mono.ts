import type { TSchema, Static } from "@sinclair/typebox";

import type { PromptOptions, PromptType } from "~/types/general.js";

import { confirmPrompt } from "~/confirm/confirm-main.js";
import { datePrompt } from "~/date/date.js";
import { multiselectPrompt } from "~/multiselect/multi-select-two.js";
import { nextStepsPrompt } from "~/next-steps/next-steps.js";
import { numberPrompt } from "~/number/number-main.js";
import { passwordPrompt } from "~/password/password-main.js";
import { numSelectPrompt } from "~/select/num-select.js";
import { selectPrompt } from "~/select/select-two.js";
import { endPrompt } from "~/st-end/end.js";
import { startPrompt } from "~/st-end/start.js";

export async function prompt<T extends TSchema>(
  options: PromptOptions<T> & {
    type: PromptType;
    id: string;
  },
): Promise<Record<(typeof options)["id"], Static<T>>> {
  const { type, id, action } = options;
  let value: any;

  switch (type) {
    case "start":
      await startPrompt(options);
      value = null;
      break;
    case "number":
      value = await numberPrompt(options);
      break;
    case "confirm":
      value = await confirmPrompt({
        ...options,
        title: options.title,
      });
      break;
    case "numSelect":
      value = await numSelectPrompt(options);
      break;
    case "select":
      value = await selectPrompt(options);
      break;
    case "multiselect":
      value = await multiselectPrompt(options);
      break;
    case "password":
      value = await passwordPrompt(options);
      break;
    case "date":
      value = await datePrompt({
        ...options,
        dateFormat: "DD/MM/YYYY",
        dateKind: "other",
      });
      break;
    case "nextSteps":
      await nextStepsPrompt({
        ...options,
        content: Array.isArray(options.content)
          ? options.content
          : options.content.split("\n"),
      });
      value = null;
      break;
    case "end":
      await endPrompt(options);
      value = null;
      break;
    default:
      throw new Error(`Unknown prompt type: ${type}`);
  }

  if (action) {
    await action();
  }

  return { [id]: value } as any;
}
