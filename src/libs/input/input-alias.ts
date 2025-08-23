import type { InputPromptOptions } from "../../types";

import { inputPrompt } from "./input-mod";

export const input = inputPrompt;
export const text = inputPrompt;

export const password = (options: Omit<InputPromptOptions, "mode">) =>
  inputPrompt({ ...options, mode: "password" });
