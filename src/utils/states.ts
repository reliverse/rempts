import { cyan, green, red, yellow } from "picocolors";

import type { ColorName, State } from "~/types";

import { colorize } from "./colorize";
import figures, { isUnicodeSupported } from "./figures";

export const BAR_START = figures.lineDownRightArc;
export const BAR_END = `${figures.lineUpRightArc} `;
export const BAR = `${figures.lineVertical} `;

const unicode = isUnicodeSupported();
const s = (c: string, fallback: string) => (unicode ? c : fallback);

const S_STEP_ACTIVE = s("◆", "*");
const S_STEP_CANCEL = s("■", "x");
const S_STEP_ERROR = s("▲", "x");
const S_STEP_SUBMIT = s("◇", "o");

const S_BAR_START = s("┌", "T");
const S_BAR = s("│", "|");
const S_BAR_END = s("└", "—");

const S_RADIO_ACTIVE = s("●", ">");
const S_RADIO_INACTIVE = s("○", " ");
const S_CHECKBOX_ACTIVE = s("◻", "[•]");
const S_CHECKBOX_SELECTED = s("◼", "[+]");
const S_CHECKBOX_INACTIVE = s("◻", "[ ]");
const S_PASSWORD_MASK = s("▪", "•");

const S_BAR_H = s("─", "-");
const S_CORNER_TOP_RIGHT = s("╮", "+");
const S_CONNECT_LEFT = s("├", "+");
const S_CORNER_BOTTOM_RIGHT = s("╯", "+");

const S_INFO = s("●", "•");
const S_SUCCESS = s("◆", "*");
const S_WARN = s("▲", "!");
const S_ERROR = s("■", "x");

export const symbol = (state: State) => {
  switch (state) {
    case "initial":
    case "active":
      return cyan(S_STEP_ACTIVE);
    case "cancel":
      return red(S_STEP_CANCEL);
    case "error":
      return yellow(S_STEP_ERROR);
    case "submit":
      return green(S_STEP_SUBMIT);
    default:
      return S_STEP_ACTIVE; // Default symbol if state is unrecognized
  }
};

export const bar = (symbol: string, state: State) => {
  switch (state) {
    case "initial":
      return colorize(symbol, "dim");
    case "active":
      return colorize(symbol, "cyan");
    case "cancel":
      return colorize(symbol, "yellow");
    case "error":
      return colorize(symbol, "red");
    case "submit":
      return colorize(symbol, "green");
    default:
      return colorize(symbol, undefined);
  }
};

export const styledBars = (type: "start" | "middle", state: State) => ({
  start: bar(BAR_START, state),
  middle: bar(BAR, state),
});

export function getFigure(state: string): string {
  const figures = {
    initial: "🔹",
    active: "🔸",
    error: "❌",
  } as const;
  return figures[state as keyof typeof figures] || figures.initial;
}
