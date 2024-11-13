import { greenBright } from "picocolors";

import type { FmtMsgOptions, MsgConfig, MsgType } from "~/types/prod";

import { colorMap, typographyMap } from "~/utils/mapping";
import { isUnicodeSupported } from "~/utils/platforms";
import { variantMap } from "~/utils/variants";

const unicode = isUnicodeSupported();
const u = (c: string, fallback: string) => (unicode ? c : fallback);
const s = {
  start: u("╭", "T"),
  middle: u("│", "|"),
  end: u("╰", "—"),
  line: u("─", "—"),
  corner_top_right: u("»", "T"),
  step_active: u("◆", "♦"),
  step_error: u("▲", "x"),
  info: u("ℹ", "i"),
};

function applyStyles(
  text: string,
  colorName = "",
  typographyName = "",
  variantName = "",
  borderColor = "",
) {
  let styledText = text;

  if (!variantName) {
    if (colorName && colorMap[colorName]) {
      styledText = colorMap[colorName](styledText);
    } else if (colorName) {
      console.warn(
        `Warning: Invalid color "${colorName}" provided to applyStyles.`,
      );
    }

    if (typographyName && typographyMap[typographyName]) {
      styledText = typographyMap[typographyName](styledText);
    } else if (typographyName) {
      console.warn(
        `Warning: Invalid typography "${typographyName}" provided to applyStyles.`,
      );
    }
  }

  if (variantName && variantMap[variantName]) {
    styledText = variantMap[variantName](styledText, borderColor);
  } else if (variantName) {
    console.warn(
      `Warning: Invalid variant "${variantName}" provided to applyStyles.`,
    );
  }

  return styledText;
}

export function fmt(opt: FmtMsgOptions) {
  if (opt.title.includes("│  ")) {
    opt.title = opt.title.replace("│  ", "");
  }

  const bar = opt.borderColor ? colorMap[opt.borderColor](s.middle) : s.middle;

  const prefixStartLine = opt.borderColor
    ? colorMap[opt.borderColor](s.start + s.line)
    : s.start + s.line;

  const prefixEndLine = opt.borderColor
    ? colorMap[opt.borderColor](s.end + s.line)
    : s.end + s.line;

  const suffixStartLine = opt.borderColor
    ? colorMap[opt.borderColor](`${s.line.repeat(22)}⊱`)
    : `${s.line.repeat(22)}⊱`;

  const suffixEndLine = opt.borderColor
    ? colorMap[opt.borderColor](`${s.line.repeat(52)}⊱`)
    : `${s.line.repeat(52)}⊱`;

  const MSG_CONFIGS: Record<MsgType, MsgConfig> = {
    M_START: {
      symbol: "",
      prefix: prefixStartLine,
      suffix: ` ${suffixStartLine}\n${bar}`,
      newLineBefore: false,
      newLineAfter: false,
    },
    M_GENERAL: {
      symbol: "",
      prefix: greenBright(s.step_active),
      suffix: "",
      newLineBefore: false,
      newLineAfter: true,
    },
    M_INFO: {
      symbol: "",
      prefix: greenBright(s.info),
      suffix: "",
      newLineBefore: false,
      newLineAfter: true,
    },
    M_ERROR: {
      symbol: "",
      prefix: `${bar}\n${s.step_error}`,
      newLineBefore: false,
      newLineAfter: true,
    },
    M_END: {
      symbol: "",
      prefix: "",
      suffix: opt.border === true ? ` ${suffixEndLine}\n${bar}` : "",
      newLineBefore: false,
      newLineAfter: true,
    },
    M_END_ANIMATED: {
      symbol: "",
      prefix: greenBright(s.step_active),
      suffix:
        opt.border === true
          ? `\n${bar}\n${prefixEndLine}${suffixEndLine}\n`
          : "",
      newLineBefore: false,
      newLineAfter: false,
    },
    M_NEWLINE: {
      symbol: "",
      prefix: bar,
      newLineBefore: false,
      newLineAfter: false,
    },
  };

  const config = MSG_CONFIGS[opt.type];
  if (!config) {
    throw new Error(`Invalid message type: ${opt.type}`);
  }

  const {
    symbol = "",
    prefix = "",
    suffix = "",
    newLineBefore = false,
    newLineAfter = false,
  } = config;
  const formattedPrefix = prefix
    ? `${prefix}${opt.type === "M_START" ? " " : "  "}`
    : "";

  const border = applyStyles(s.middle, opt.borderColor);

  let formattedTitle = "";
  if (opt.title) {
    formattedTitle = applyStyles(
      opt.title,
      opt.titleColor,
      opt.titleTypography,
      opt.titleVariant,
      opt.borderColor,
    );
    if (opt.hint) {
      formattedTitle += `\n${border}  ${colorMap.cristalGradient(opt.hint)}`;
    }
  }

  let formattedContent = "";
  if (opt.content) {
    const contentLines = opt.content.split("\n");
    formattedContent = contentLines
      .map((line) => {
        const styledLine = applyStyles(
          line,
          opt.contentColor,
          opt.contentTypography,
          opt.contentVariant,
          opt.borderColor,
        );
        if (opt.type !== "M_START") {
          return `${border}  ${styledLine}`;
        } else {
          return styledLine;
        }
      })
      .join("\n");
  }

  const text = [formattedTitle, formattedContent].filter(Boolean).join(`\n`);

  return [
    symbol,
    newLineBefore ? "\n" : "",
    formattedPrefix,
    text,
    newLineAfter ? `\n${bar}  ` : "",
    suffix,
  ]
    .filter(Boolean)
    .join("");
}

export function msg(opt: FmtMsgOptions): void {
  console[opt.type === "M_ERROR" ? "error" : "log"](fmt(opt));
}
