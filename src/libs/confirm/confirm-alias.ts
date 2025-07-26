import type { ConfirmPromptOptions } from "~/types.js";

import { confirmPrompt } from "./confirm-mod.js";

export const confirm = confirmPrompt as (
  options: ConfirmPromptOptions,
) => Promise<boolean>;
