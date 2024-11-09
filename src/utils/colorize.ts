import chalk from "chalk";
import chalkAnimation from "chalk-animation";
import figlet from "figlet";
import gradient from "gradient-string";
import color from "picocolors";

import type { ColorName, Typography } from "~/types";

export function colorize(
  text: string,
  colorName?: ColorName,
  typography?: Typography,
): string {
  let result = text;

  switch (colorName) {
    case "inverse":
      result = color.inverse(` ${result} `);
      break;
    case "dim":
      result = color.dim(result);
      break;
    case "black":
      result = color.black(result);
      break;
    case "red":
      result = color.red(result);
      break;
    case "green":
      result = color.green(result);
      break;
    case "yellow":
      result = color.yellow(result);
      break;
    case "blue":
      result = color.blue(result);
      break;
    case "magenta":
      result = color.magenta(result);
      break;
    case "cyan":
      result = color.cyan(result);
      break;
    case "cyanBright":
      result = color.cyanBright(result);
      break;
    case "bgCyan":
      result = color.bgCyan(` ${result} `);
      break;
    case "bgCyanBright":
      result = color.bgCyanBright(` ${result} `);
      break;
    case "white":
      result = color.white(result);
      break;
    case "gray":
    case "grey":
      result = color.gray(result);
      break;
    case "none":
      break;
    default:
      break;
  }

  if (typography) {
    switch (typography) {
      case "bold":
        result = chalk.bold(result);
        break;
      case "strikethrough":
        result = chalk.strikethrough(result);
        break;
      case "underline":
        result = chalk.underline(result);
        break;
      case "italic":
        result = chalk.italic(result);
        break;
      case "gradient":
        result = gradient(
          "red",
          "yellow",
          "green",
          "cyan",
          "blue",
          "magenta",
        )(result);
        break;
      case "rainbow":
        result = gradient.rainbow(result);
        break;
      case "pulse":
        result = gradient.passion(result);
        break;
      case "glitch":
        result = gradient.cristal(result);
        break;
      case "radar":
        result = gradient.mind(result);
        break;
      case "neon":
        result = gradient.vice(result);
        break;
      case "figlet":
        result = figlet.textSync(result);
        break;
      default:
        break;
    }
  }

  return result;
}
