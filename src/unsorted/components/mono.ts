import type { TSchema, Static } from "@sinclair/typebox";

import type { PromptOptions, PromptType } from "~/unsorted/types/general";

import { confirmPrompt } from "~/unsorted/components/confirm-two";
import { datePrompt } from "~/unsorted/components/date";
import { endPrompt } from "~/unsorted/components/end";
import { multiselectPrompt } from "~/unsorted/components/multi-select-two";
import { nextStepsPrompt } from "~/unsorted/components/next-steps";
import { numMultiSelectPrompt } from "~/unsorted/components/num-multi-select";
import { numberPrompt } from "~/unsorted/components/number";
import { passwordPrompt } from "~/unsorted/components/password-two";
import { selectPrompt } from "~/unsorted/components/select-two";
import { startPrompt } from "~/unsorted/components/start";
import { textPrompt } from "~/unsorted/components/text-two";

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
    // case "select":
    //   value = await selectPrompt(options);
    //   break;
    // case "multiSelect":
    //   value = await multiSelectPrompt(options);
    //   break;
    // case "numMultiSelect":
    //   value = await numMultiSelectPrompt(options);
    //   break;
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
