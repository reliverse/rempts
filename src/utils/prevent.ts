import pc from "picocolors";
import terminalSize from "terminal-size";

import { msg } from "./messages.js";

export type PreventWrongTerminalSizeOptions = {
  shouldExit?: boolean;
  minWidth?: number;
  minHeight?: number;
  widthErrorMessage?: string;
  heightErrorMessage?: string;
  sizeErrorDescription?: string;
};

export async function preventWrongTerminalSize({
  shouldExit = true,
  minWidth = 120,
  minHeight = 15,
  widthErrorMessage = "Terminal width is too small. Expected >",
  heightErrorMessage = "Terminal height is too small. Expected >",
  sizeErrorDescription = "Please increase the terminal size to run the application",
}: PreventWrongTerminalSizeOptions) {
  const size = terminalSize();

  const errors = [];
  if (size.columns < minWidth) {
    errors.push(`${widthErrorMessage}${minWidth} | Current: ${size.columns}`);
  }

  if (size.rows < minHeight) {
    errors.push(`${heightErrorMessage}${minHeight} | Current: ${size.rows}`);
  }

  if (errors.length > 0) {
    msg({
      type: "M_ERROR",
      title: pc.redBright(errors.join("\n││    ")),
      content: size.rows >= 7 && size.columns >= 70 ? sizeErrorDescription : "",
      contentColor: "redBright",
    });

    if (shouldExit) {
      process.exit(1);
    }
  }
}
