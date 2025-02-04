import { re } from "@reliverse/relico";
import { stdout } from "node:process";
import ora from "ora";
import { cursor } from "sisteransi";
import terminalSize from "terminal-size";
import wrapAnsi from "wrap-ansi";

import { msg, type BorderColorName, type ColorName } from "~/main.js";
import { toBaseColor } from "~/msg-fmt/colors.js";

function getTerminalWidth(): number {
  return terminalSize().columns;
}

export type StreamTextOptions = {
  /**
   * Text to stream
   */
  text: string;
  /**
   * Delay between each character in milliseconds
   * @default 50
   */
  delay?: number;
  /**
   * Whether to show cursor while streaming
   * @default false
   */
  showCursor?: boolean;
  /**
   * Color to use for the text
   * @default undefined (no color)
   */
  color?: ColorName;
  /**
   * Whether to add a newline at the end
   * @default true
   */
  newline?: boolean;
  /**
   * Whether to clear the line before streaming
   * @default false
   */
  clearLine?: boolean;
  /**
   * Callback function to update the spinner text
   */
  onProgress?: (currentText: string) => void;
};

let isStartOfLine = true;
let isFirstLine = true;

/**
 * Strips ANSI escape sequences from a string
 */
function stripAnsi(text: string): string {
  return text.replace(/\x1b\[[0-9;]*[a-zA-Z]/g, "");
}

/**
 * Extracts ANSI escape sequences from a string
 */
function extractAnsi(text: string): string[] {
  return text.match(/\x1b\[[0-9;]*[a-zA-Z]/g) || [];
}

function wrapWithBar(
  text: string,
  isFirst: boolean,
  color?: ColorName,
): string {
  const prefix = isFirst ? re.green("◆") : re.dim("│"); // TODO: true here is not working looks like

  // Extract and reapply ANSI sequences
  const ansiCodes = extractAnsi(text);
  const cleanText = stripAnsi(text);
  const coloredText = color
    ? re[color as keyof typeof re](cleanText)
    : re.dim(cleanText);

  // Reapply original ANSI codes if they exist
  const finalText =
    ansiCodes.length > 0 ? ansiCodes.join("") + coloredText : coloredText;
  return `${prefix}  ${finalText}`;
}

/**
 * Wraps text according to terminal width
 */
function wrapText(text: string): string {
  const width = getTerminalWidth();
  // Subtract 4 for the bar and padding (│  )
  return wrapAnsi(text, width - 4, { hard: false, trim: true });
}

/**
 * Simulates streaming text output in the console, character by character
 */
export async function streamText({
  text,
  delay = 50,
  showCursor = false,
  color,
  newline = true,
  clearLine = false,
  onProgress,
}: StreamTextOptions): Promise<void> {
  if (!showCursor) {
    stdout.write(cursor.hide);
  }

  if (clearLine) {
    stdout.write("\r\x1b[K"); // Clear current line
  }

  // Wrap text before streaming
  const wrappedText = wrapText(text);
  isFirstLine = true;
  let buffer = "";

  for (const char of wrappedText) {
    if (char === "\n") {
      if (buffer) {
        const output = isStartOfLine
          ? wrapWithBar(buffer, isFirstLine, color)
          : color
            ? re[color as keyof typeof re](buffer)
            : re.dim(buffer);
        stdout.write(output);
        buffer = "";
      }
      stdout.write(char);
      isStartOfLine = true;
      isFirstLine = false;
      continue;
    }

    // Collect ANSI sequences and actual characters
    buffer += char;
    if (!char.includes("\x1b[") && buffer) {
      const output = isStartOfLine
        ? wrapWithBar(buffer, isFirstLine, color)
        : color
          ? re[color as keyof typeof re](buffer)
          : re.dim(buffer);
      stdout.write(output);
      await new Promise((resolve) => setTimeout(resolve, delay));
      isStartOfLine = false;
      buffer = "";
      if (onProgress) {
        onProgress(output);
      }
    }
  }

  // Write any remaining buffered content
  if (buffer) {
    const output = isStartOfLine
      ? wrapWithBar(buffer, isFirstLine, color)
      : color
        ? re[color as keyof typeof re](buffer)
        : re.dim(buffer);
    stdout.write(output);
    if (onProgress) {
      onProgress(output);
    }
  }

  if (newline) {
    stdout.write("\n");
  }

  if (!showCursor) {
    stdout.write(cursor.show);
  }
}

/**
 * Simulates streaming text output in a message box
 */
export async function streamTextBox({
  text,
  delay = 50,
  color,
  borderColor = "dim",
}: Omit<StreamTextOptions, "showCursor" | "newline" | "clearLine"> & {
  borderColor?: BorderColorName;
}): Promise<void> {
  stdout.write(cursor.hide);

  msg({
    type: "M_START",
    title: "",
    borderColor,
  });

  await streamText({
    text,
    delay,
    showCursor: false,
    color,
    newline: false,
    clearLine: false,
  });

  msg({
    type: "M_END",
    borderColor,
  });

  stdout.write(cursor.show);
}

/**
 * Simulates streaming text output with a loading spinner using ora
 */
export async function streamTextWithSpinner({
  text,
  delay = 50,
  color = "cyan",
  spinnerFrames,
  spinnerDelay,
}: StreamTextOptions & {
  spinnerFrames?: string[];
  spinnerDelay?: number;
}): Promise<void> {
  let currentText = "";
  const spinner = ora({
    text: currentText,
    color: toBaseColor(color),
    spinner: spinnerFrames
      ? {
          frames: spinnerFrames,
          interval: spinnerDelay,
        }
      : "dots",
  }).start();

  // Stream text after spinner
  for (const char of text) {
    currentText += char;
    spinner.text = color
      ? re[color as keyof typeof re](currentText)
      : currentText;
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  // Clean up spinner
  spinner.stop();
}
