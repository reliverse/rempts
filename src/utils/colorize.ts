import { re } from "@reliverse/relico";
import gradient, {
  cristal,
  mind,
  passion,
  rainbow,
  vice,
} from "gradient-string";

import type { ColorName, TypographyName } from "~/main.js";

// Strip ANSI color codes using @reliverse/relico
function stripAnsi(text: string): string {
  return re.reset(text);
}

export function colorize(
  text: string,
  colorName?: ColorName,
  typography?: TypographyName,
): string {
  if (!colorName) return text;

  // Strip any existing ANSI codes before applying new colors
  text = stripAnsi(text);
  let result = text;

  // Handle gradient colors first
  if (colorName.endsWith("Gradient")) {
    switch (colorName) {
      case "gradientGradient":
        result = gradient([
          "red",
          "yellow",
          "green",
          "cyan",
          "blue",
          "magenta",
        ])(result);
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
      case "retroGradient":
        result = gradient(["#ff8a00", "#e52e71"])(result);
        break;
      default:
        break;
    }
    return result;
  }

  // Handle regular colors
  switch (colorName) {
    case "inverse":
      result = re.inverse(` ${result} `);
      break;
    case "dim":
      result = re.dim(result);
      break;
    case "black":
      result = re.black(result);
      break;
    case "red":
      result = re.red(result);
      break;
    case "redBright":
      result = re.redBright(result);
      break;
    case "green":
      result = re.green(result);
      break;
    case "greenBright":
      result = re.greenBright(result);
      break;
    case "yellow":
      result = re.yellow(result);
      break;
    case "yellowBright":
      result = re.yellowBright(result);
      break;
    case "blue":
      result = re.blue(result);
      break;
    case "blueBright":
      result = re.blueBright(result);
      break;
    case "magenta":
      result = re.magenta(result);
      break;
    case "magentaBright":
      result = re.magentaBright(result);
      break;
    case "cyan":
      result = re.cyan(result);
      break;
    case "cyanBright":
      result = re.cyanBright(result);
      break;
    case "bgCyan":
      result = re.bgCyan(` ${result} `);
      break;
    case "bgCyanBright":
      result = re.bgCyanBright(` ${result} `);
      break;
    case "white":
      result = re.white(result);
      break;
    case "gray":
      result = re.gray(result);
      break;
    case "none":
      break;
    default:
      console.warn(`Warning: Unknown color "${colorName}"`);
      break;
  }

  // Apply typography if specified and not using gradient
  if (typography) {
    switch (typography) {
      case "bold":
        result = re.bold(result);
        break;
      case "strikethrough":
        result = re.strikethrough(result);
        break;
      case "underline":
        result = re.underline(result);
        break;
      case "italic":
        result = re.italic(result);
        break;
      default:
        break;
    }
  }

  return result;
}
