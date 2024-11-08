import color from "picocolors";

import type { ColorName } from "~/types";

export function colorize(text: string, colorName?: ColorName): string {
  switch (colorName) {
    case "black":
      return color.black(text);
    case "red":
      return color.red(text);
    case "green":
      return color.green(text);
    case "yellow":
      return color.yellow(text);
    case "blue":
      return color.blue(text);
    case "magenta":
      return color.magenta(text);
    case "cyan":
      return color.cyan(text);
    case "cyanBright":
      return color.cyanBright(text);
    case "white":
      return color.white(text);
    case "gray":
    case "grey":
      return color.gray(text);
    case "none":
      return text;
    default:
      return color.cyanBright(text);
  }
}
