import type { ColorName } from "./types.js";

/**
 * Standard terminal colors supported by most terminals
 */
export type StandardColor =
  | "black"
  | "red"
  | "green"
  | "yellow"
  | "blue"
  | "magenta"
  | "cyan"
  | "white"
  | "gray";

/**
 * All possible output colors including special colors
 */
export type OutputColor = StandardColor | "dim";

/**
 * Mapping of gradient colors to their solid color equivalents
 */
const GRADIENT_COLOR_MAP: Record<string, StandardColor> = {
  retroGradient: "cyan",
  viceGradient: "green",
  gradientGradient: "blue",
  rainbowGradient: "blue",
  cristalGradient: "blue",
  mindGradient: "blue",
  passionGradient: "blue",
} as const;

/**
 * Special colors that should be converted to a default color
 */
const SPECIAL_COLORS = ["reset", "inverse", "none"] as const;

/**
 * Maps bright colors to their base colors
 * @param color The bright color to convert
 * @returns The base color without 'Bright' suffix
 */
function stripBrightModifier(color: string): string {
  return color.replace("Bright", "");
}

/**
 * Maps background colors to their foreground equivalents
 * @param color The background color to convert
 * @returns The foreground color without 'bg' prefix
 */
function stripBgModifier(color: string): string {
  return color.replace("bg", "").toLowerCase();
}

/**
 * Maps a color to its base form by stripping modifiers
 * @param color The color to convert
 * @returns The base color without modifiers
 */
function stripColorModifiers(color: string): string {
  if (color.includes("Bright")) {
    return stripBrightModifier(color);
  }
  if (color.startsWith("bg")) {
    return stripBgModifier(color);
  }
  return color;
}

/**
 * Maps complex colors (gradients, bright, background) to standard terminal colors.
 * Used by ora spinners and other terminal utilities that only support basic colors.
 *
 * Handles:
 * - Gradient colors -> solid colors (e.g., retroGradient -> cyan)
 * - Bright colors -> base colors (e.g., redBright -> red)
 * - Background colors -> foreground colors (e.g., bgRed -> red)
 * - Special colors -> undefined (reset, inverse, dim, none)
 *
 * @param color The complex color to convert
 * @returns A standard terminal color or undefined for special colors
 */
export function toBaseColor(color?: ColorName): StandardColor | undefined {
  if (!color || color === "dim" || SPECIAL_COLORS.includes(color as any)) {
    return undefined;
  }

  // Handle gradient colors
  if (color in GRADIENT_COLOR_MAP) {
    return GRADIENT_COLOR_MAP[color];
  }

  // Handle bright and background colors
  if (color.includes("Bright") || color.startsWith("bg")) {
    const baseColor = stripColorModifiers(color);
    return baseColor as StandardColor;
  }

  return color as StandardColor;
}

/**
 * Maps any color type to a standard solid color for consistent display.
 * Similar to toBaseColor but always returns a color (never undefined).
 *
 * Handles:
 * - Gradient colors -> solid colors (e.g., retroGradient -> cyan)
 * - Bright colors -> base colors (e.g., redBright -> red)
 * - Background colors -> foreground colors (e.g., bgRed -> red)
 * - Special colors (reset, inverse, none) -> dim
 * - Undefined -> dim
 *
 * @param color The color to convert
 * @returns A standard terminal color, defaulting to "dim" for special cases
 */
export function toSolidColor(color?: ColorName): OutputColor {
  const baseColor = toBaseColor(color);
  return baseColor ?? "dim";
}
