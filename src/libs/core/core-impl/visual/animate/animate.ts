import {
  ChalkAnimation,
  type Animation,
  type AnimationName,
} from "@figliolia/chalk-animation";

import type {
  BorderColorName,
  ColorName,
  MsgType,
  TypographyName,
} from "~/libs/core/core-types.js";

import { msg } from "~/libs/core/core-impl/msg-fmt/messages.js";
import {
  deleteLastLine,
  getTerminalWidth,
} from "~/libs/core/core-impl/msg-fmt/terminal.js";

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
  title = "",
  anim,
  delay,
  type = "M_INFO",
  titleColor = "cyan",
  titleTypography = "none",
  border = true,
  borderColor = "dim",
  horizontalLineLength = 0,
}: {
  title: string;
  anim: AnimationName;
  delay?: number;
  type?: MsgType;
  titleColor?: ColorName;
  titleTypography?: TypographyName;
  borderColor?: BorderColorName;
  border?: boolean;
  horizontalLineLength?: number;
}) {
  if (horizontalLineLength === 0) {
    horizontalLineLength = getTerminalWidth() - 5;
  }

  const finalDelay = delay ?? calculateDelay(title);
  const animation = animationMap[anim](title);

  try {
    await new Promise<void>((resolve) => {
      setTimeout(() => {
        animation.stop();
        deleteLastLine();

        if (title.includes("│  ")) {
          title = title.replace("│  ", "");
        } else if (title.includes("ℹ  ")) {
          title = title.replace("ℹ  ", "");
        }

        msg({
          type,
          title: title,
          titleColor,
          titleTypography,
          content: "",
          borderColor,
          border,
          horizontalLineLength,
        });
        resolve();
      }, finalDelay);
    });
  } catch (error) {
    console.error("Animation failed to complete.", error);
  }
}
