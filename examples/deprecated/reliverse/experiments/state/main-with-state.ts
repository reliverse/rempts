import type { TSchema, Static } from "@sinclair/typebox";

import { symbol } from "../utils/symbols.js";

import type { PromptStateDeprecated } from "~/types/internal.js";

import { confirmPrompt } from "~/components/confirm/confirm-two.js";
import { datePrompt } from "~/components/date/date.js";
import { endPrompt } from "~/components/st-end/end.js";
import { nextStepsPrompt } from "~/components/next-steps/next-steps.js";
// import { multiSelectPrompt } from "~/unsorted/components/num-multi-select";
import { numberPrompt } from "~/components/number/number-two.js";
import { passwordPrompt } from "~/components/password/password-two.js";

import type { PromptOptionsWithState } from "./types-wth-state.js";

import { startPrompt } from "./ui/start-with-state.js";
import { textPrompt } from "./ui/text-with-state.js";

// export { createSpinner } from "~/unsorted/components/spinner";

export async function prompts<T extends TSchema>(
  options: PromptOptionsWithState<T>,
  currentState: PromptStateDeprecated = {
    id: "",
    state: "initial",
    symbol: symbol("S_MIDDLE", "initial"),
    value: undefined,
  },
): Promise<Record<(typeof options)["id"], Static<T>>> {
  const { type, id, action } = options;
  let value: any;

  switch (type) {
    case "start":
      await startPrompt(options, currentState);
      value = null;
      break;
    case "text":
      value = await textPrompt(options, currentState);
      break;
    case "number":
      value = await numberPrompt(options);
      break;
    case "confirm":
      value = await confirmPrompt(options);
      break;
    // case "select":
    //   value = await selectPrompt(options);
    //   break;
    // case "multiselect":
    //   value = await multiSelectPrompt(options);
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
