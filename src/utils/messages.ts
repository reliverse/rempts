import type { State, SymbolCharacter, MsgType } from "~/types";

import { common, specialMainSymbols, specialFallbackSymbols } from "./charmap";
import { colorize } from "./colorize";
import { isUnicodeSupported } from "./platforms";

export const mainSymbols = { ...common, ...specialMainSymbols };
export const fallbackSymbols: Record<string, string> = {
  ...common,
  ...specialFallbackSymbols,
};

const unicode = isUnicodeSupported();
export const figures = unicode ? mainSymbols : fallbackSymbols;
const s = (c: string, fallback: string) => (unicode ? c : fallback);

export const styledSymbols = (symbol: string, state: State) => {
  switch (state) {
    case "initial":
      return colorize(symbol, "viceGradient"); // "dim",
    case "active":
      return colorize(symbol, "passionGradient"); // "cyan",
    case "cancel":
      return colorize(symbol, "mindGradient"); // "yellow",
    case "error":
      return colorize(symbol, "gradientGradient"); // "red",
    case "submit":
      return colorize(symbol, "cristalGradient"); // "green",
    default:
      return colorize(symbol, undefined);
  }
};

const SYMBOLS: Record<SymbolCharacter, string> = {
  S_START: s(common.lineDownRightArc, "T"),
  S_MIDDLE: s(common.lineVertical, "|"),
  S_END: s(common.lineUpRightArc, "—"),
  S_LINE: s(common.line, "—"),

  S_STEP_ACTIVE: figures.lozenge,
  S_STEP_CANCEL: s(common.squareCenter, "x"),
  S_STEP_ERROR: s(common.triangleUp, "x"),
  S_STEP_SUBMIT: figures.lozengeOutline, // "o"),

  S_RADIO_ACTIVE: figures.radioOn,
  S_RADIO_INACTIVE: figures.radioOff, // " "),

  S_CHECKBOX_ACTIVE: figures.squareSmall, // "[•]"),
  S_CHECKBOX_SELECTED: figures.squareSmallFilled, // "[+]"),
  S_CHECKBOX_INACTIVE: figures.squareSmall, // "[ ]"),

  S_PASSWORD_MASK: s("▪", "•"),
  S_BAR_H: s(common.line, "-"),

  S_CORNER_TOP_RIGHT: s(common.lineDownLeftArc, "+"),
  S_CONNECT_LEFT: s(common.lineUpRight, "+"),
  S_CORNER_BOTTOM_RIGHT: s(common.lineUpLeftArc, "+"),

  S_INFO: figures.circle, // "•"),
  S_SUCCESS: figures.lozenge, // "*"),
  S_WARN: s(common.triangleUp, "!"),
  S_ERROR: s(common.squareCenter, "x"),
};

export const symbol = (type: SymbolCharacter, state: State) => {
  const baseSymbol = SYMBOLS[type];
  return styledSymbols(baseSymbol, state);
};

export function fmt(
  type: MsgType,
  state: State = "initial",
  text = "",
  dashCount?: number,
): string {
  const ss = {
    start: symbol("S_START", state),
    dash: symbol("S_LINE", state),
    bar: symbol("S_MIDDLE", "initial"),
    icon: symbol("S_SUCCESS", state),
    end: symbol("S_END", state),
  };

  switch (type) {
    case "MT_START":
      const longLine = dashCount ? ss.dash.repeat(dashCount) : "";
      return `${ss.start}${ss.dash} ${text} ${longLine}`;
    case "MT_MIDDLE":
      return `${ss.bar}\n${ss.icon}  ${text}`;
    case "MT_END":
      return `${ss.end}  ${text}`;
    default:
      throw new Error(`Unhandled MsgType type: ${type}`);
  }
}

export function msg(
  type: MsgType,
  state: State,
  text: string,
  dashCount: number,
): void {
  const logger = state === "error" ? console.warn : console.log;
  logger(fmt(type, state, text, dashCount));
}
