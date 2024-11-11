import type { State, SymbolCharacter } from "~/types";

import { colorize } from "./colorize";
import { isUnicodeSupported } from "./platforms";

const unicode = isUnicodeSupported();
const s = (c: string, fallback: string) => (unicode ? c : fallback);

export const styledSymbols = (symbol: string, state: State) => {
  switch (state) {
    case "initial":
      return colorize(symbol, "viceGradient");
    case "active":
      return colorize(symbol, "passionGradient");
    case "cancel":
      return colorize(symbol, "mindGradient");
    case "error":
      return colorize(symbol, "red");
    case "submit":
      return colorize(symbol, "cristalGradient");
    default:
      return colorize(symbol, undefined);
  }
};

const SYMBOLS: Record<SymbolCharacter, string> = {
  S_START: s("╭", "T"),
  S_MIDDLE: s("│", "|"),
  S_END: s("╰", "—"),
  S_LINE: s("─", "—"),

  S_STEP_ACTIVE: s("◆", "♦"),
  S_STEP_CANCEL: s("■", "x"),
  S_STEP_ERROR: s("▲", "x"),
  S_STEP_SUBMIT: s("◇", "o"),

  S_RADIO_ACTIVE: s("◉", "(*)"),
  S_RADIO_INACTIVE: s("◯", "( )"),

  S_CHECKBOX_ACTIVE: s("□", "[•]"),
  S_CHECKBOX_SELECTED: s("■", "[+]"),
  S_CHECKBOX_INACTIVE: s("□", "[ ]"),

  S_PASSWORD_MASK: s("▪", "•"),
  S_BAR_H: s("─", "-"),

  S_CORNER_TOP_RIGHT: s("╮", "+"),
  S_CONNECT_LEFT: s("╰", "+"),
  S_CORNER_BOTTOM_RIGHT: s("╯", "+"),
};

export const symbol = (type: SymbolCharacter, state: State) => {
  const baseSymbol = SYMBOLS[type];
  return styledSymbols(baseSymbol, state);
};
