import type { Static, TSchema } from "@sinclair/typebox";
import type { PromptOptions } from "../types";
export declare function selectPrompt<T extends TSchema>(options: PromptOptions<T>): Promise<Static<T>>;
