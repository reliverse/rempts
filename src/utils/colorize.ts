import color from "picocolors";

import type { ColorName } from "~/types";

export function colorize(
  text: string,
  colorName?: ColorName,
  typography?: "bold" | "strikethrough" | "underline" | "italic",
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
      result = color.cyanBright(result);
  }

  if (typography) {
    switch (typography) {
      case "bold":
        result = color.bold(result);
        break;
      case "strikethrough":
        result = color.strikethrough(result);
        break;
      case "underline":
        result = color.underline(result);
        break;
      case "italic":
        result = color.italic(result);
        break;
    }
  }

  return result;
}
