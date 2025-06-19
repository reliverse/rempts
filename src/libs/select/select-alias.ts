import type { SelectPromptParams } from "~/types.js";

import { selectPrompt } from "~/libs/select/select-prompt.js";

export const select = selectPrompt as <T extends string>(
  params: SelectPromptParams<T>,
) => Promise<T>;

// Convenient function for simple options
export const selectSimple = <T extends string>(
  params: Omit<SelectPromptParams<T>, "options"> & {
    options: { value: T; label?: string; hint?: string }[];
  },
): Promise<T> => {
  return selectPrompt({
    ...params,
    optionsArray: params.options,
    options: undefined,
  });
};
