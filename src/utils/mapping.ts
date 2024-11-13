import chalk from "chalk";
import gradient, { cristal, mind, passion, retro, vice } from "gradient-string";
import { rainbow } from "gradient-string";
import colors from "picocolors";

import type { TypographyName } from "~/types/prod";
import type { ColorName } from "~/types/prod";

export const colorMap: Record<ColorName, (text: string) => string> = {
  dim: colors.dim,
  inverse: colors.inverse,
  black: colors.black,
  red: colors.red,
  green: colors.green,
  yellow: colors.yellow,
  blue: colors.blue,
  magenta: colors.magenta,
  cyan: colors.cyan,
  cyanBright: colors.cyanBright,
  bgCyan: colors.bgCyan,
  bgCyanBright: colors.bgCyanBright,
  white: colors.white,
  gray: colors.gray,
  grey: colors.gray,
  gradientGradient: gradient([
    "red",
    "yellow",
    "green",
    "cyan",
    "blue",
    "magenta",
  ]),
  rainbowGradient: rainbow,
  cristalGradient: cristal,
  mindGradient: mind,
  passionGradient: passion,
  viceGradient: vice,
  retroGradient: retro,
  none: colors.reset,
};

export const typographyMap: Record<TypographyName, (text: string) => string> = {
  bold: chalk.bold,
  italic: chalk.italic,
  underline: chalk.underline,
  strikethrough: chalk.strikethrough,
};
