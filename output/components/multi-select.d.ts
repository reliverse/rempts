import type { Static, TSchema } from "@sinclair/typebox";
import type { PromptOptions } from "../types/prod";
export declare function multiselectPrompt<T extends TSchema>(options: PromptOptions<T>): Promise<Static<T>>;
