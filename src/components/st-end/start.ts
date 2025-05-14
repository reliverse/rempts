import { relinka } from "@reliverse/relinka";
import { getCurrentTerminalName } from "@reliverse/runtime";

import type {
  PreventWrongTerminalSizeOptions,
  PromptOptions,
} from "~/types.js";

import { msg } from "~/components/msg-fmt/messages.js";
import {
  getExactTerminalWidth,
  getTerminalHeight,
  getTerminalWidth,
} from "~/components/msg-fmt/terminal.js";
import {
  preventWrongTerminalSize,
  preventWindowsHomeDirRoot,
  preventUnsupportedTTY,
} from "~/utils/prevent.js";
import { pm, reliversePrompts } from "~/utils/system.js";

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
};

export async function startPrompt({
  title = "",
  titleColor = "inverse",
  titleTypography = "none",
  titleVariant,
  borderColor = "dim",
  clearConsole = false,
  horizontalLine = true,
  horizontalLineLength = 0,
  packageName = reliversePrompts.name,
  packageVersion = reliversePrompts.version,
  terminalSizeOptions = {},
  isDev = false,
  prevent = {
    unsupportedTTY: true,
    wrongTerminalSize: true,
    windowsHomeDirRoot: true,
  },
}: StartPromptOptions): Promise<void> {
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

  if (horizontalLineLength === 0) {
    const titleFullLength =
      titleColor === "inverse"
        ? `⠀${formattedTitle}⠀`.length + 5
        : formattedTitle.length + 5;

    horizontalLineLength = Math.max(1, exactTerminalWidth - titleFullLength);
  }

  if (clearConsole) {
    relinka("clear", "");
    relinka("info", "");
  } else {
    relinka("info", "");
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
