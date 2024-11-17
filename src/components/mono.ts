import type { TSchema, Static } from "@sinclair/typebox";

import type { PromptOptions, PromptType } from "~/types/prod";

import { confirmPrompt } from "~/components/confirm";
import { datePrompt } from "~/components/date";
import { endPrompt } from "~/components/end";
import { multiselectPrompt } from "~/components/multi-select";
import { nextStepsPrompt } from "~/components/next-steps";
import { numberPrompt } from "~/components/number";
import { passwordPrompt } from "~/components/password";
import { selectPrompt } from "~/components/select";
import { startPrompt } from "~/components/start";
import { textPrompt } from "~/components/text";

import { numSelectPrompt } from "./num-select";

export async function prompt<T extends TSchema>(
  options: PromptOptions<T> & {
    type: PromptType;
  },
): Promise<Record<(typeof options)["id"], Static<T>>> {
  const { type, id, action } = options;
  let value: any;

  switch (type) {
    case "start":
      await startPrompt(options);
      value = null;
      break;
    case "text":
      value = await textPrompt(options);
      break;
    case "number":
      value = await numberPrompt(options);
      break;
    case "confirm":
      value = await confirmPrompt(options);
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
      await nextStepsPrompt(options);
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
