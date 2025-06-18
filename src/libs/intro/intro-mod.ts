import type { Fonts } from "figlet";

import { relinka } from "@reliverse/relinka";
import { getCurrentTerminalName } from "@reliverse/runtime";

import type {
  PreventWrongTerminalSizeOptions,
  PromptOptions,
} from "~/types.js";

import { msg } from "~/libs/msg-fmt/messages.js";
import {
  getExactTerminalWidth,
  getTerminalHeight,
  getTerminalWidth,
} from "~/libs/msg-fmt/terminal.js";
import {
  preventWrongTerminalSize,
  preventWindowsHomeDirRoot,
  preventUnsupportedTTY,
} from "~/libs/utils/prevent.js";
import { pm, reliversePrompts } from "~/libs/utils/system.js";
import { createAsciiArt } from "~/libs/visual/visual-mod.js";

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

export async function introPrompt(
  optionsOrTitle: StartPromptOptions | string,
): Promise<void> {
  const options =
    typeof optionsOrTitle === "string"
      ? { title: optionsOrTitle }
      : optionsOrTitle;

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
          isDev && terminalWidth > 80
            ? ` | isDev | w${terminalWidth} h${terminalHeight}`
            : ""
        }`;

  if (variant === "ascii-art") {
    await createAsciiArt({
      message: formattedTitle,
      font: asciiArtFont,
      clearConsole,
    });
    return;
  }

  if (horizontalLineLength === 0) {
    const titleFullLength =
      titleColor === "inverse"
        ? `⠀${formattedTitle}⠀`.length + 5
        : formattedTitle.length + 5;

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
