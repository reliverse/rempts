import type {
  StateDeprecated,
  SymbolCharacterDeprecated,
} from "~/types/internal.js";

import { colorize } from "~/utils/colorize.js";
import { isUnicodeSupported } from "~/utils/platforms.js";

const unicode = isUnicodeSupported();
const s = (c: string, fallback: string) => (unicode ? c : fallback);

// export const SYMBOLS: Record<SymbolCharacterDeprecated, string> = {
export const S_START = s("╭", "T");
export const S_MIDDLE = s("│", "|");
export const S_END = s("╰", "—");
export const S_LINE = s("─", "—");

export const S_STEP_ACTIVE = s("◆", "♦");
export const S_STEP_CANCEL = s("■", "x");
export const S_STEP_ERROR = s("▲", "x");
export const S_STEP_SUBMIT = s("◇", "o");

export const S_RADIO_ACTIVE = s("◉", "(*)");
export const S_RADIO_INACTIVE = s("◯", "( )");

export const S_CHECKBOX_ACTIVE = s("□", "[•]");
export const S_CHECKBOX_SELECTED = s("■", "[+]");
export const S_CHECKBOX_INACTIVE = s("□", "[ ]");

export const S_PASSWORD_MASK = s("▪", "•");
export const S_BAR_H = s("─", "-");

export const S_CORNER_TOP_RIGHT = s("╮", "+");
export const S_CONNECT_LEFT = s("╰", "+");
export const S_CORNER_BOTTOM_RIGHT = s("╯", "+");
// };

export const styledSymbols = (symbol: string, state: StateDeprecated) => {
  switch (state) {
    case "initial":
      return colorize(symbol, "rainbowGradient");
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

export const symbol = (
  symbol: SymbolCharacterDeprecated,
  state: StateDeprecated,
) => {
  const baseSymbol = S_START;
  return styledSymbols(baseSymbol, state);
};
