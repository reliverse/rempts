import { re } from "@reliverse/relico";
import {
  getExactTerminalWidth,
  getTerminalWidth,
  msg,
} from "@reliverse/relinka";
import terminalSize from "terminal-size";

export type PreventWrongTerminalSizeOptions = {
  isDev?: boolean;
  shouldExit?: boolean;
  minWidth?: number;
  minHeight?: number;
  sizeErrorDescription?: string;
};

export async function preventWrongTerminalSize({
  isDev = false,
  shouldExit = true,
  minWidth = 80,
  minHeight = 12,
  sizeErrorDescription = "Please increase the terminal size to run the application",
}: PreventWrongTerminalSizeOptions) {
  const size = terminalSize();
  const exactTerminalWidth = getExactTerminalWidth();
  const terminalWidth = getTerminalWidth();

  const errors = [];
  if (terminalWidth < minWidth) {
    errors.push(
      isDev
        ? `Oops! Terminal width is too small. Expected >${minWidth} | Current: ${terminalWidth} (Exact: ${exactTerminalWidth})`
        : `Oops! Terminal width is too small. Expected >${minWidth} | Current: ${terminalWidth}`,
    );
  }

  if (size.rows < minHeight) {
    errors.push(
      `Oops! Terminal height is too small. Expected >${minHeight} | Current: ${size.rows}`,
    );
  }

  if (errors.length > 0) {
    msg({
      type: "M_ERROR",
      title: re.redBright(errors.join("\n││    ")),
      content:
        size.rows >= 7 && terminalWidth >= 70 ? sizeErrorDescription : "",
      contentColor: "redBright",
    });

    if (shouldExit) {
      process.exit(1);
    }
  }
}
