import type { MultiselectPromptParams } from "../../types";
import { multiselectPrompt } from "../multiselect/multiselect-prompt";

export const multiselect = multiselectPrompt as <T extends string>(
  params: MultiselectPromptParams<T>,
) => Promise<T[]>;
