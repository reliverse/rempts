import type { TSchema, Static } from "@sinclair/typebox";
import type { PromptOptions } from "../types";
export declare function confirmPrompt<T extends TSchema>(options: PromptOptions<T>): Promise<Static<T>>;
