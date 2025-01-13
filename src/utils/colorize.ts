import type { ColorName, TypographyName } from "@reliverse/relinka";

import gradient, {
  cristal,
  mind,
  passion,
  rainbow,
  vice,
} from "gradient-string";
import pc from "picocolors";

// Strip ANSI color codes using picocolors
function stripAnsi(text: string): string {
  return pc.reset(text);
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
    case "redBright":
      result = pc.redBright(result);
      break;
    case "green":
      result = pc.green(result);
      break;
    case "greenBright":
      result = pc.greenBright(result);
      break;
    case "yellow":
      result = pc.yellow(result);
      break;
    case "yellowBright":
      result = pc.yellowBright(result);
      break;
    case "blue":
      result = pc.blue(result);
      break;
    case "blueBright":
      result = pc.blueBright(result);
      break;
    case "magenta":
      result = pc.magenta(result);
      break;
    case "magentaBright":
      result = pc.magentaBright(result);
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
