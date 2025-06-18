import type { InputPromptOptions } from "~/types.js";

import { confirmPrompt } from "~/components/confirm/confirm-prompt.js";
import { inputPrompt } from "~/components/input/input-prompt.js";
import { introPrompt } from "~/components/intro/intro-start.js";
import { outroPrompt } from "~/components/outro/outro-end.js";
import { multiselectPrompt } from "~/components/select/multiselect-prompt.js";
import { selectPrompt } from "~/components/select/select-prompt.js";
import { useSpinner } from "~/components/spinner/spinner-mod.js";

export const password = (options: Omit<InputPromptOptions, "mode">) =>
  inputPrompt({ ...options, mode: "password" });

export const multiselect = multiselectPrompt;

export const select = selectPrompt;

export const confirm = confirmPrompt;

export const input = inputPrompt;
export const text = inputPrompt;

export const startPrompt = introPrompt;
export const intro = introPrompt;

export const endPrompt = outroPrompt;
export const outro = outroPrompt;

export const spinner = useSpinner;
