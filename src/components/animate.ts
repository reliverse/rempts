import {
  ChalkAnimation,
  type Animation,
  type AnimationName,
} from "@figliolia/chalk-animation";

import type { ColorName, MsgType, TypographyName } from "~/types/prod";

import { deleteLastLine } from "~/utils/console";

import { msg } from "../utils/messages";

export const animationMap: Record<AnimationName, (text: string) => Animation> =
  {
    rainbow: ChalkAnimation.rainbow,
    pulse: ChalkAnimation.pulse,
    glitch: ChalkAnimation.glitch,
    radar: ChalkAnimation.radar,
    neon: ChalkAnimation.neon,
    karaoke: ChalkAnimation.karaoke,
  };

function calculateDelay(text: string): number {
  const baseDelay = 1000;
  const delayPerCharacter = 50;
  return baseDelay + text.length * delayPerCharacter;
}

export async function promptsAnimateText({
  title,
  anim,
  delay,
  type = "M_INFO",
  titleColor = "none",
  titleTypography,
  border = true,
  borderColor,
  titleAnimated,
}: {
  title: string;
  anim: AnimationName;
  delay?: number;
  type?: MsgType;
  titleColor?: ColorName;
  titleTypography?: TypographyName;
  borderColor?: ColorName;
  border?: boolean;
  titleAnimated: string;
}) {
  const finalDelay = delay ?? calculateDelay(titleAnimated);
  const animation = animationMap[anim](titleAnimated);

  await new Promise<void>((resolve) => {
    setTimeout(() => {
      animation.stop();
      deleteLastLine();
      msg({
        type,
        title: title,
        titleColor,
        titleTypography,
        borderColor,
        border,
      });
      resolve();
    }, finalDelay);
  });
}
