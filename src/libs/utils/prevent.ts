import { homedir } from "node:os";
import { re } from "@reliverse/relico";
import { relinka } from "@reliverse/relinka";
import terminalSize from "terminal-size";
import type { PreventWrongTerminalSizeOptions } from "../../types";
import { msg } from "../msg-fmt/messages";
import { getExactTerminalWidth, getTerminalWidth } from "../msg-fmt/terminal";

export function preventUnsupportedTTY() {
  if (!process.stdout.isTTY) {
    relinka(
      "warn",
      "│  Your terminal does not support terminal's cursor manipulations.\n│  It's recommended to use a terminal which supports TTY.",
    );
  }
}

/**
 * Prevents EISDIR errors when trying to read Windows home directory as a file
 * @param filePath The file path to check
 */
export function preventWindowsHomeDirRoot(filePath: string): never | undefined {
  // Only apply this prevention on Windows
  if (process.platform !== "win32") {
    return;
  }

  const home = homedir();

  // Check if the path is exactly the home directory or root
  if (filePath === home || filePath === `${home}\\`) {
    msg({
      type: "M_ERROR",
      title: re.redBright("Cannot operate in Windows home directory root"),
      content: `Please use a command like ${re.cyan(`cd ${home}\\Desktop`)} to move to a safe working directory first.`,
      contentColor: "redBright",
    });
    process.exit(1);
  }
}

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
      content: size.rows >= 7 && terminalWidth >= 70 ? sizeErrorDescription : "",
      contentColor: "redBright",
    });

    if (shouldExit) {
      process.exit(1);
    }
  }
}
