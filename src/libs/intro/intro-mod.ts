import { relinka } from "@reliverse/relinka";
import { getCurrentTerminalName } from "@reliverse/reltime";
import type { Fonts } from "figlet";
import type { PreventWrongTerminalSizeOptions, PromptOptions } from "../../types";
import { msg } from "../msg-fmt/messages";
import { getExactTerminalWidth, getTerminalHeight, getTerminalWidth } from "../msg-fmt/terminal";
import {
  preventUnsupportedTTY,
  preventWindowsHomeDirRoot,
  preventWrongTerminalSize,
} from "../utils/prevent";
import { pm, reliversePrompts } from "../utils/system";
import { createAsciiArt } from "../visual/visual-mod";

type StartPromptOptions = PromptOptions & {
  clearConsole?: boolean;
  horizontalLine?: boolean;
  horizontalLineLength?: number;
  packageName?: string;
  packageVersion?: string;
  terminalSizeOptions?: PreventWrongTerminalSizeOptions;
  isDev?: boolean;
  prevent?: {
    unsupportedTTY?: boolean;
    wrongTerminalSize?: boolean;
    windowsHomeDirRoot?: boolean;
  };
  variant?: "header" | "ascii-art";
  asciiArtFont?: Fonts;
};

export async function introPrompt(optionsOrTitle: StartPromptOptions | string): Promise<void> {
  const options = typeof optionsOrTitle === "string" ? { title: optionsOrTitle } : optionsOrTitle;

  const {
    title = "",
    titleColor = "inverse",
    titleTypography = "none",
    titleVariant,
    borderColor = "dim",
    clearConsole = false,
    horizontalLine = true,
    horizontalLineLength: initialHorizontalLineLength = 0,
    packageName = reliversePrompts.name,
    packageVersion = reliversePrompts.version,
    terminalSizeOptions = {},
    isDev = false,
    prevent = {
      unsupportedTTY: true,
      wrongTerminalSize: true,
      windowsHomeDirRoot: true,
    },
    variant = "header",
    asciiArtFont,
  } = options;

  let horizontalLineLength = initialHorizontalLineLength;

  if (prevent.windowsHomeDirRoot) {
    preventWindowsHomeDirRoot(process.cwd());
  }
  if (prevent.unsupportedTTY) {
    preventUnsupportedTTY();
  }
  if (prevent.wrongTerminalSize) {
    await preventWrongTerminalSize({ ...terminalSizeOptions, isDev });
  }

  const terminalWidth = getTerminalWidth();
  const exactTerminalWidth = getExactTerminalWidth();
  const terminalHeight = getTerminalHeight();

  const formattedTitle =
    title !== ""
      ? title
      : `${packageName} v${packageVersion} | ${pm.packageManager} v${pm.version} | ${getCurrentTerminalName()}${
          isDev && terminalWidth > 80 ? ` | isDev | w${terminalWidth} h${terminalHeight}` : ""
        }`;

  if (variant === "ascii-art") {
    await createAsciiArt({
      message: formattedTitle,
      ...(asciiArtFont !== undefined && { font: asciiArtFont }),
      clearConsole,
    });
    return;
  }

  if (horizontalLineLength === 0) {
    const titleFullLength =
      titleColor === "inverse" ? `⠀${formattedTitle}⠀`.length + 5 : formattedTitle.length + 5;

    horizontalLineLength = Math.max(1, exactTerminalWidth - titleFullLength);
  }

  if (clearConsole) {
    relinka("clear", "");
    relinka("log", "");
  } else {
    relinka("log", "");
  }

  msg({
    type: "M_START",
    title: titleColor === "inverse" ? `⠀${formattedTitle}⠀` : formattedTitle,
    titleColor,
    titleTypography,
    ...(titleVariant ? { titleVariant } : {}),
    borderColor,
    horizontalLine,
    horizontalLineLength,
  });
}
