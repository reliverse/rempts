// ✨ @reliverse/prompts: Prototype Edition
// 📚 @see docs: https://docs.reliverse.org
// 👉 Production Edition code at GitHub:
// 🧩 https://github.com/reliverse/prompts
// 📦 https://npmjs.com/package/@reliverse/prompts

import type { TSchema, Static } from "@sinclair/typebox";

import type { PromptOptions } from "~/types";

import { confirmPrompt } from "~/components/confirm";
import { datePrompt } from "~/components/date";
import { multiselectPrompt } from "~/components/multiselect";
import { numberPrompt } from "~/components/number";
import { passwordPrompt } from "~/components/password";
import { selectPrompt } from "~/components/select";
import { textPrompt } from "~/components/text";

export { createSpinner } from "~/components/spinner";

export async function prompts<T extends TSchema>(
  options: PromptOptions<T>,
): Promise<Record<(typeof options)["id"], Static<T>>> {
  const { type, id } = options;
  let value: any;
  switch (type) {
    case "text":
      value = await textPrompt(options);
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
    default:
      throw new Error(`Unknown prompt type: ${type}`);
  }
  return { [id]: value } as any;
}
