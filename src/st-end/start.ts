import {
  getExactTerminalWidth,
  getTerminalHeight,
  getTerminalWidth,
  msg,
} from "@reliverse/relinka";
import { getCurrentTerminalName } from "@reliverse/runtime";

import type { PromptOptions } from "~/types/general.js";

import {
  preventWrongTerminalSize,
  type PreventWrongTerminalSizeOptions,
} from "~/utils/prevent.js";
import { pkg, pm, pmv } from "~/utils/system.js";

type StartPromptOptions = PromptOptions & {
  clearConsole?: boolean;
  horizontalLine?: boolean;
  horizontalLineLength?: number;
  packageName?: string;
  packageVersion?: string;
  shouldPreventWrongTerminalSize?: boolean;
  terminalSizeOptions?: PreventWrongTerminalSizeOptions;
  isDev?: boolean;
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
  packageName = pkg.name,
  packageVersion = pkg.version,
  terminalSizeOptions = {},
  shouldPreventWrongTerminalSize = true,
  isDev = false,
}: StartPromptOptions): Promise<void> {
  if (clearConsole) {
    console.clear();
    console.log("");
  } else {
    console.log("");
  }

  const terminalWidth = getTerminalWidth();
  const exactTerminalWidth = getExactTerminalWidth();
  const terminalHeight = getTerminalHeight();

  const formattedTitle =
    title !== ""
      ? title
      : `${packageName} v${packageVersion} | ${pm} v${pmv} | ${getCurrentTerminalName()}` +
        (isDev && terminalWidth > 80
          ? ` | isDev | w${terminalWidth} h${terminalHeight}`
          : "");

  if (horizontalLineLength === 0) {
    const titleFullLength =
      titleColor === "inverse"
        ? `⠀${formattedTitle}⠀`.length + 5
        : formattedTitle.length + 5;

    horizontalLineLength = Math.max(1, exactTerminalWidth - titleFullLength);
  }

  if (shouldPreventWrongTerminalSize) {
    await preventWrongTerminalSize({ ...terminalSizeOptions, isDev });
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

  if (!process.stdout.isTTY) {
    console.error(
      "│  Your terminal does not support cursor manipulations.\n│  It's recommended to use a terminal which supports TTY.",
    );
    msg({
      type: "M_BAR",
      borderColor,
    });
  }
}
