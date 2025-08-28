import { re } from "@reliverse/relico";
import { relinka } from "@reliverse/relinka";
import type { BorderColorName, ColorName, TypographyName, VariantName } from "../../types";
import { msg, symbols } from "../msg-fmt/messages";
import { deleteLastLine, getExactTerminalWidth } from "../msg-fmt/terminal";

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
  _titleVariant: VariantName | undefined,
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
    // For select prompts, don't inject extra newline before the bar
    deleteLastLine();
    msg({
      type: "M_BAR",
      borderColor,
    });
    renderEndLineInput();
  }

  return value ?? false;
}

export function renderEndLine() {
  const lineLength = getExactTerminalWidth() - 6;
  relinka("null", re.dim(symbols.middle));
  relinka("null", re.dim(`${symbols.end}${symbols.line.repeat(lineLength)}⊱`));
  relinka("null", "");
}

export function renderEndLineInput() {
  const lineLength = getExactTerminalWidth() - 6;
  relinka("null", "");
  relinka("null", re.dim(`${symbols.end}${symbols.line.repeat(lineLength)}⊱`));
  relinka("null", "");
}
