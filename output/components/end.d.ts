import type { PromptOptions } from "../types/prod";
type EndPromptOptions = PromptOptions & {
    titleAnimation?: string;
    titleAnimated?: string;
};
export declare function endPrompt({ title, titleAnimated, titleColor, titleTypography, titleVariant, titleAnimation, titleAnimationDelay, borderColor, }: EndPromptOptions): Promise<void>;
export {};
