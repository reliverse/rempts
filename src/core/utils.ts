import terminalSize from "terminal-size";
import wrapAnsi from "wrap-ansi";

export function getTerminalHeight(): number {
  return terminalSize().rows ?? 24;
}

export function getExactTerminalWidth(): number {
  return terminalSize().columns ?? 80;
}

export function getTerminalWidth(terminalWidth = 0): number {
  if (terminalWidth === 0) {
    terminalWidth = getExactTerminalWidth();
  }

  if (terminalWidth > 150) {
    return terminalWidth - 40;
  } else if (terminalWidth > 120) {
    return terminalWidth - 30;
  } else if (terminalWidth > 100) {
    return terminalWidth - 20;
  }
  return terminalWidth;
}

/**
 * Force line returns at specific width. This function is ANSI code friendly and it'll
 * ignore invisible codes during width calculation.
 * @param {string} content
 * @return {string}
 */
export function breakLines(content: string, terminalWidth = 0): string {
  if (terminalWidth === 0) {
    terminalWidth = getTerminalWidth();
  }

  return content
    .split("\n")
    .flatMap((line) =>
      wrapAnsi(line, terminalWidth, { trim: false, hard: true })
        .split("\n")
        .map((str) => str.trimEnd()),
    )
    .join("\n");
}
