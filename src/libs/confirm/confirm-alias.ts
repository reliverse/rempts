import type { ConfirmPromptOptions } from "../../types";

import { confirmPrompt } from "./confirm-mod";

export const confirm = confirmPrompt as (options: ConfirmPromptOptions) => Promise<boolean>;
