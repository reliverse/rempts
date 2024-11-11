import type { TSchema, Static } from "@sinclair/typebox";

import type { PromptState } from "~/types";

import { confirmPrompt } from "~/ui/confirm";
import { datePrompt } from "~/ui/date";
import { endPrompt } from "~/ui/end";
import { multiselectPrompt } from "~/ui/multiselect";
import { nextStepsPrompt } from "~/ui/nextSteps";
import { numberPrompt } from "~/ui/number";
import { passwordPrompt } from "~/ui/password";
import { selectPrompt } from "~/ui/select";
import { symbol } from "~/utils/messages";

import type { PromptOptionsWithState } from "./types-wth-state";

import { startPrompt } from "./ui/start-with-state.js";
import { textPrompt } from "./ui/text-with-state";

export { createSpinner } from "~/ui/spinner";

export async function prompts<T extends TSchema>(
  options: PromptOptionsWithState<T>,
  currentState: PromptState = {
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
      value = await datePrompt(options);
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
