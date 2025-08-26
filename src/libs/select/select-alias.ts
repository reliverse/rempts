import type { SelectPromptParams } from "../../types";
import { selectPrompt } from "../select/select-prompt";

export const select = selectPrompt as <T extends string>(
  params: SelectPromptParams<T>,
) => Promise<T>;

// Convenient function for simple options
export const selectSimple = <T extends string>(
  params: Omit<SelectPromptParams<T>, "options"> & {
    options: { value: T; label?: string; hint?: string }[];
  },
): Promise<T> => {
  const { options, ...restParams } = params;
  return selectPrompt({
    ...restParams,
    optionsArray: options,
  });
};
