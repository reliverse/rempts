import type { TSchema, Static } from "@sinclair/typebox";
import type { PromptOptions } from "../types";
export declare function numberPrompt<T extends TSchema>(options: PromptOptions<T>): Promise<Static<T>>;
