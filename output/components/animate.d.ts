import { type Animation, type AnimationName } from "@figliolia/chalk-animation";
import type { ColorName, MsgType, TypographyName } from "../types/prod";
export declare const animationMap: Record<AnimationName, (text: string) => Animation>;
export declare function promptsAnimateText({ title, anim, delay, type, titleColor, titleTypography, border, borderColor, titleAnimated, }: {
    title: string;
    anim: AnimationName;
    delay?: number;
    type?: MsgType;
    titleColor?: ColorName;
    titleTypography?: TypographyName;
    borderColor?: ColorName;
    border?: boolean;
    titleAnimated: string;
}): Promise<void>;
