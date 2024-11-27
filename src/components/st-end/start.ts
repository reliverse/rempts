import type { PromptOptions } from "~/types/general.js";

import { getCurrentTerminalName } from "~/main.js";
import { msg } from "~/utils/messages.js";
import { pkg, pm, pmv } from "~/utils/platforms.js";

export async function startPrompt({
  title = `@reliverse/prompts v${pkg.version} | ${pm} v${pmv} | ${getCurrentTerminalName()}`,
  titleColor = "blueBright",
  titleTypography = "bold",
  titleVariant,
  borderColor = "viceGradient",
  clearConsole = false,
  horizontalLine = true,
  horizontalLineLength = 30,
}: PromptOptions & {
  clearConsole?: boolean;
  horizontalLine?: boolean;
  horizontalLineLength?: number;
}): Promise<void> {
  if (clearConsole) {
    console.clear();
    console.log();
  } else {
    console.log();
  }

  msg({
    type: "M_START",
    title: ` ${title} `,
    titleColor,
    titleTypography,
    titleVariant,
    borderColor,
    horizontalLine,
    horizontalLineLength,
  });

  if (!process.stdout.isTTY) {
    console.error(
      "│  Your terminal does not support cursor manipulations.\n│  It's recommended to use a terminal which supports TTY.",
    );
    msg({
      type: "M_NEWLINE",
    });
  }
}
