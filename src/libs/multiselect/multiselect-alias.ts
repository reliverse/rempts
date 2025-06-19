import type { MultiselectPromptParams } from "~/types.js";

import { multiselectPrompt } from "~/libs/multiselect/multiselect-prompt.js";

export const multiselect = multiselectPrompt as <T extends string>(
  params: MultiselectPromptParams<T>,
) => Promise<T[]>;
