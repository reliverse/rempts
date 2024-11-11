import { common, specialMainSymbols, specialFallbackSymbols } from "./charmap.js";
import { colorize } from "./colorize.js";
import { isUnicodeSupported } from "./platforms.js";
export const mainSymbols = { ...common, ...specialMainSymbols };
export const fallbackSymbols = {
  ...common,
  ...specialFallbackSymbols
};
const unicode = isUnicodeSupported();
export const figures = unicode ? mainSymbols : fallbackSymbols;
const s = (c, fallback) => unicode ? c : fallback;
export const styledSymbols = (symbol2, state) => {
  switch (state) {
    case "initial":
      return colorize(symbol2, "viceGradient");
    // "dim",
    case "active":
      return colorize(symbol2, "passionGradient");
    // "cyan",
    case "cancel":
      return colorize(symbol2, "mindGradient");
    // "yellow",
    case "error":
      return colorize(symbol2, "gradientGradient");
    // "red",
    case "submit":
      return colorize(symbol2, "cristalGradient");
    // "green",
    default:
      return colorize(symbol2, void 0);
  }
};
const SYMBOLS = {
  S_START: s(common.lineDownRightArc, "T"),
  S_MIDDLE: s(common.lineVertical, "|"),
  S_END: s(common.lineUpRightArc, "\u2014"),
  S_LINE: s(common.line, "\u2014"),
  S_STEP_ACTIVE: figures.lozenge,
  S_STEP_CANCEL: s(common.squareCenter, "x"),
  S_STEP_ERROR: s(common.triangleUp, "x"),
  S_STEP_SUBMIT: figures.lozengeOutline,
  // "o"),
  S_RADIO_ACTIVE: figures.radioOn,
  S_RADIO_INACTIVE: figures.radioOff,
  // " "),
  S_CHECKBOX_ACTIVE: figures.squareSmall,
  // "[•]"),
  S_CHECKBOX_SELECTED: figures.squareSmallFilled,
  // "[+]"),
  S_CHECKBOX_INACTIVE: figures.squareSmall,
  // "[ ]"),
  S_PASSWORD_MASK: s("\u25AA", "\u2022"),
  S_BAR_H: s(common.line, "-"),
  S_CORNER_TOP_RIGHT: s(common.lineDownLeftArc, "+"),
  S_CONNECT_LEFT: s(common.lineUpRight, "+"),
  S_CORNER_BOTTOM_RIGHT: s(common.lineUpLeftArc, "+"),
  S_INFO: figures.circle,
  // "•"),
  S_SUCCESS: figures.lozenge,
  // "*"),
  S_WARN: s(common.triangleUp, "!"),
  S_ERROR: s(common.squareCenter, "x")
};
export const symbol = (type, state) => {
  const baseSymbol = SYMBOLS[type];
  return styledSymbols(baseSymbol, state);
};
export function fmt(type, state = "initial", text = "", dashCount) {
  const ss = {
    start: symbol("S_START", state),
    dash: symbol("S_LINE", state),
    bar: symbol("S_MIDDLE", "initial"),
    icon: symbol("S_SUCCESS", state),
    end: symbol("S_END", state)
  };
  switch (type) {
    case "MT_START":
      const longLine = dashCount ? ss.dash.repeat(dashCount) : "";
      return `${ss.start}${ss.dash} ${text} ${longLine}`;
    case "MT_MIDDLE":
      return `${ss.bar}
${ss.icon}  ${text}`;
    case "MT_END":
      return `${ss.end}  ${text}`;
    default:
      throw new Error(`Unhandled MsgType type: ${type}`);
  }
}
export function msg(type, state, text, dashCount) {
  const logger = state === "error" ? console.warn : console.log;
  logger(fmt(type, state, text, dashCount));
}
