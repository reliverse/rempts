import relinka from "@reliverse/relinka";

import type { PromptOptions } from "~/types/general.js";

import { getCurrentTerminalName } from "~/main.js";
import { msg } from "~/utils/messages.js";
import { pkg, pm, pmv } from "~/utils/platforms.js";

export async function startPrompt({
  title = "",
  titleColor = "blueBright",
  titleTypography = "bold",
  titleVariant,
  borderColor = "viceGradient",
  clearConsole = false,
  horizontalLine = true,
  horizontalLineLength = 30,
  packageName = pkg.name,
  packageVersion = pkg.version,
}: PromptOptions & {
  clearConsole?: boolean;
  horizontalLine?: boolean;
  horizontalLineLength?: number;
  packageName?: string;
  packageVersion?: string;
}): Promise<void> {
  if (clearConsole) {
    console.clear();
    console.log("");
  } else {
    console.log("");
  }

  const formattedTitle =
    title !== ""
      ? ` ${title} `
      : ` ${packageName} v${packageVersion} | ${pm} v${pmv} | ${getCurrentTerminalName()} `;

  msg({
    type: "M_START",
    title: formattedTitle,
    titleColor,
    titleTypography,
    titleVariant,
    borderColor,
    horizontalLine,
    horizontalLineLength,
  });

  if (!process.stdout.isTTY) {
    relinka.error(
      "│  Your terminal does not support cursor manipulations.\n│  It's recommended to use a terminal which supports TTY.",
    );
    msg({
      type: "M_NEWLINE",
    });
  }
}
