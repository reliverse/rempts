import { re } from "@reliverse/relico";

import type {
  BorderColorName,
  ColorName,
  TypographyName,
  VariantName,
} from "~/libs/core/core-types.js";

import { msg, symbols } from "~/libs/core/core-impl/msg-fmt/messages.js";
import { getExactTerminalWidth } from "~/libs/core/core-impl/msg-fmt/terminal.js";

/**
 * Ends the prompt by optionally displaying an end message and running the action if confirmed.
 * Preserves the last prompt state unless there's an endTitle.
 */
export async function completePrompt(
  prompt: "input" | "confirm" | "select" | "multiselect" | "toggle",
  isCtrlC: boolean,
  _endTitle = "",
  _endTitleColor: ColorName = "dim",
  _titleTypography: TypographyName = "none",
  _titleVariant: VariantName | undefined = undefined,
  _border = true,
  borderColor: BorderColorName = "dim",
  action?: () => Promise<void>,
  value?: boolean,
): Promise<boolean> {
  if (action && value) {
    await action();
  }

  if (prompt === "input") {
    renderEndLineInput();
    return value ?? false;
  }

  if (isCtrlC) {
    renderEndLine();
  } else {
    // For select prompts, don't add extra newline before the bar
    msg({
      type: "M_BAR",
      borderColor,
    });
  }

  return value ?? false;
}
/* export async function completePrompt(
  prompt: "input" | "confirm" | "select" | "multiselect" | "toggle",
  isCtrlC: boolean,
  _endTitle = "",
  _endTitleColor: ColorName = "dim",
  _titleTypography: TypographyName = "none",
  _titleVariant: VariantName | undefined = undefined,
  _border = true,
  borderColor: BorderColorName = "dim",
  action?: () => Promise<void>,
  value?: boolean,
): Promise<boolean> {
  if (action && value) {
    await action();
  }

  if (prompt === "input") {
    renderEndLineInput();
    return value ?? false;
  }

  if (isCtrlC) {
    renderEndLine();
    // if (endTitle !== "") {
    //   await endPrompt({
    //     title: endTitle,
    //     titleColor: endTitleColor,
    //     titleTypography,
    //     ...(titleVariant ? { titleVariant } : {}),
    //     border,
    //   });
    // } else {
    //   await endPrompt({
    //     title: " ",
    //     titleColor: endTitleColor,
    //     titleTypography,
    //     ...(titleVariant ? { titleVariant } : {}),
    //     border,
    //     borderColor,
    //   });
    // }
  } else {
    msg({
      type: "M_BAR",
      borderColor,
    });
  }

  return value ?? false;
} */

export function renderEndLine() {
  const lineLength = getExactTerminalWidth() - 2;
  console.log(re.dim(symbols.middle));
  console.log(re.dim(`${symbols.end}${symbols.line.repeat(lineLength)}⊱`));
  console.log();
}

export function renderEndLineInput() {
  const lineLength = getExactTerminalWidth() - 2;
  console.log();
  console.log(re.dim(`${symbols.end}${symbols.line.repeat(lineLength)}⊱`));
  console.log();
}
