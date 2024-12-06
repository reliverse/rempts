import chalk from "chalk";
import gradient, { cristal, mind, passion, retro, vice } from "gradient-string";
import { rainbow } from "gradient-string";
import pc from "picocolors";

import type { TypographyName } from "~/types/general.js";
import type { ColorName } from "~/types/general.js";

export const colorMap: Record<ColorName, (text: string) => string> = {
  none: pc.reset,
  inverse: pc.inverse,
  black: pc.black,
  blue: pc.blue,
  blueBright: pc.blueBright,
  cyan: pc.cyan,
  cyanBright: pc.cyanBright,
  bgCyan: pc.bgCyan,
  bgCyanBright: pc.bgCyanBright,
  dim: pc.dim,
  gray: pc.gray,
  green: pc.green,
  greenBright: pc.greenBright,
  bgGreen: pc.bgGreen,
  bgGreenBright: pc.bgGreenBright,
  magenta: pc.magenta,
  red: pc.red,
  redBright: pc.redBright,
  bgRed: pc.bgRed,
  bgRedBright: pc.bgRedBright,
  white: pc.white,
  yellow: pc.yellow,
  yellowBright: pc.yellowBright,
  cristalGradient: cristal,
  mindGradient: mind,
  passionGradient: passion,
  rainbowGradient: rainbow,
  retroGradient: retro,
  viceGradient: vice,
  gradientGradient: gradient([
    "red",
    "yellow",
    "green",
    "cyan",
    "blue",
    "magenta",
  ]),
};

export const typographyMap: Record<TypographyName, (text: string) => string> = {
  bold: chalk.bold,
  italic: chalk.italic,
  underline: chalk.underline,
  strikethrough: chalk.strikethrough,
};
