import type { TSchema, Static } from "@sinclair/typebox";
import type { PromptOptions, PromptState } from "../types";
export declare function textPrompt<T extends TSchema>(options: PromptOptions<T>, currentState?: PromptState): Promise<Static<T>>;
