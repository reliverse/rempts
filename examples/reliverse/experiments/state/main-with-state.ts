import type { TSchema, Static } from "@sinclair/typebox";

import { symbol } from "@/reliverse/experiments/utils/symbols";

import type { PromptStateDeprecated } from "~/types/dev";

import { confirmPrompt } from "~/components/confirm";
import { datePrompt } from "~/components/date";
import { endPrompt } from "~/components/end";
import { multiselectPrompt } from "~/components/multi-select";
import { nextStepsPrompt } from "~/components/next-steps";
import { numberPrompt } from "~/components/number";
import { passwordPrompt } from "~/components/password";
import { selectPrompt } from "~/components/select";

import type { PromptOptionsWithState } from "./types-wth-state";

import { startPrompt } from "./ui/start-with-state";
import { textPrompt } from "./ui/text-with-state";

export { createSpinner } from "~/components/spinner";

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
