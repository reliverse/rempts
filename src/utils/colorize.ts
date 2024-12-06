import gradient, {
  cristal,
  mind,
  passion,
  rainbow,
  vice,
} from "gradient-string";
import pc from "picocolors";

import type { ColorName, TypographyName } from "~/types/general.js";

export function colorize(
  text: string,
  colorName?: ColorName,
  typography?: TypographyName,
): string {
  let result = text;

  switch (colorName) {
    case "inverse":
      result = pc.inverse(` ${result} `);
      break;
    case "dim":
      result = pc.dim(result);
      break;
    case "black":
      result = pc.black(result);
      break;
    case "red":
      result = pc.red(result);
      break;
    case "green":
      result = pc.green(result);
      break;
    case "yellow":
      result = pc.yellow(result);
      break;
    case "blue":
      result = pc.blue(result);
      break;
    case "magenta":
      result = pc.magenta(result);
      break;
    case "cyan":
      result = pc.cyan(result);
      break;
    case "cyanBright":
      result = pc.cyanBright(result);
      break;
    case "bgCyan":
      result = pc.bgCyan(` ${result} `);
      break;
    case "bgCyanBright":
      result = pc.bgCyanBright(` ${result} `);
      break;
    case "white":
      result = pc.white(result);
      break;
    case "gray":
      result = pc.gray(result);
      break;
    case "gradientGradient":
      result = gradient(["red", "yellow", "green", "cyan", "blue", "magenta"])(
        result,
      );
      break;
    case "rainbowGradient":
      result = rainbow(result);
      break;
    case "cristalGradient":
      result = cristal(result);
      break;
    case "mindGradient":
      result = mind(result);
      break;
    case "passionGradient":
      result = passion(result);
      break;
    case "viceGradient":
      result = vice(result);
      break;
    case "none":
      break;
    default:
      break;
  }

  const gradientColors = [
    "gradientGradient",
    "cristalGradient",
    "mindGradient",
    "passionGradient",
    "rainbowGradient",
    "viceGradient",
  ];

  if (gradientColors.includes(colorName ?? "") && typography) {
    throw new Error(
      "[colorize] Cannot apply typography to gradient color.\n│  Use regular colorize()'s color or remove typography.",
    );
  }

  if (!gradientColors.includes(colorName ?? "") && typography) {
    switch (typography) {
      case "bold":
        result = pc.bold(result);
        break;
      case "strikethrough":
        result = pc.strikethrough(result);
        break;
      case "underline":
        result = pc.underline(result);
        break;
      case "italic":
        result = pc.italic(result);
        break;
      default:
        break;
    }
  }

  return result;
}
