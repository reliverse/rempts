import type { Static, TSchema } from "@sinclair/typebox";
import type { PromptOptions } from "../types";
export declare function datePrompt<T extends TSchema>(options: PromptOptions<T>): Promise<Static<T>>;
