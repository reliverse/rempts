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

export async function animateText({
  title,
  anim,
  delay,
  type = "M_INFO",
  titleColor = "none",
  titleTypography,
  border = true,
  borderColor,
}: {
  title: string;
  anim: AnimationName;
  delay?: number;
  type?: MsgType;
  titleColor?: ColorName;
  titleTypography?: TypographyName;
  borderColor?: ColorName;
  border?: boolean;
}) {
  const finalDelay = delay ?? calculateDelay(title);
  const animation = animationMap[anim](title);

  await new Promise<void>((resolve) => {
    setTimeout(() => {
      animation.stop();
      deleteLastLine();

      if (title.includes("│  ")) {
        title = title.replace("│  ", "");
      } else if (title.includes("ℹ  ")) {
        title = title.replace("ℹ  ", "");
      }
      // if (title.includes(":")) {
      //   title = emojify(title);
      // }

      msg({
        type,
        title,
        titleColor,
        titleTypography,
        borderColor,
        border,
      });
      resolve();
    }, finalDelay);
  });
}
