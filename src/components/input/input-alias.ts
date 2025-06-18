import type { InputPromptOptions } from "~/types.js";

import { inputPrompt } from "~/components/input/input-mod.js";

export const input = inputPrompt;
export const text = inputPrompt;

export const password = (options: Omit<InputPromptOptions, "mode">) =>
  inputPrompt({ ...options, mode: "password" });
