import { retro } from "gradient-string";
import { greenBright, redBright } from "picocolors";

import { isUnicodeSupported } from "./platforms";

const unicode = isUnicodeSupported();
const u = (c: string, fallback: string) => (unicode ? c : fallback);
const S = {
  START: u("╭", "T"),
  MIDDLE: u("│", "|"),
  END: u("╰", "—"),
  LINE: u("─", "—"),
  CORNER_TOP_RIGHT: u("»", "T"),
  STEP_ACTIVE: u("◆", "♦"),
  STEP_ERROR: u("▲", "x"),
};

const MESSAGES = ["M_START", "M_MIDDLE", "M_END", "M_ERROR"] as const;
type MsgType = (typeof MESSAGES)[number];
type MsgConfig = {
  symbol: string;
  prefix?: string;
  color?: (text: string) => string;
  newLine?: boolean;
  suffix?: string;
};

const MESSAGE_CONFIGS: Record<MsgType, MsgConfig> = {
  M_START: {
    symbol: `${S.START}${S.LINE} `,
    suffix: ` ${retro(S.LINE.repeat(22) + "⊱")}`,
  },
  M_MIDDLE: {
    symbol: S.MIDDLE,
    prefix: greenBright(S.STEP_ACTIVE),
    newLine: true,
  },
  M_END: {
    symbol: S.END,
  },
  M_ERROR: {
    symbol: S.MIDDLE,
    prefix: redBright(S.STEP_ERROR),
    newLine: true,
  },
};

export function fmt(type: MsgType, text = ""): string {
  const config = MESSAGE_CONFIGS[type];

  if (!config) {
    throw new Error(`Invalid message type: ${type}`);
  }

  const { symbol, prefix = "", suffix = "", color, newLine = false } = config;

  const formattedPrefix = prefix ? `${prefix}  ` : "";
  const formattedText = color ? color(text) : text;

  return [
    retro(symbol),
    newLine ? "\n" : "",
    formattedPrefix,
    formattedText,
    suffix,
  ]
    .filter(Boolean)
    .join("");
}

export function msg(type: MsgType, text: string): void {
  if (type !== "M_ERROR") console.log(fmt(type, text));
  else console.error(fmt(type, text));
}
