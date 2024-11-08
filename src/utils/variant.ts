export function applyVariant(
  lines: string[],
  variant?: string,
  options?: { limit?: number },
): string {
  switch (variant) {
    case "box":
      return createBox(lines, options?.limit);
    case "doubleBox":
      return createDoubleBox(lines, options?.limit);
    case "banner":
      return createBanner(lines);
    case "underline":
      return createUnderline(lines);
    default:
      return lines.join("\n");
  }
}

function createBox(lines: string[], limit?: number): string {
  const processedLines = processLines(lines, limit);
  const maxLength = Math.max(...processedLines.map((line) => line.length));
  const topBorder = `┌${"─".repeat(maxLength + 2)}┐`;
  const bottomBorder = `└${"─".repeat(maxLength + 2)}┘`;
  const middle = processedLines
    .map((line) => `│ ${line.padEnd(maxLength)} │`)
    .join("\n");
  return `${topBorder}\n${middle}\n${bottomBorder}`;
}

function createDoubleBox(lines: string[], limit?: number): string {
  const processedLines = processLines(lines, limit);
  const maxLength = Math.max(...processedLines.map((line) => line.length));
  const topBorder = `╔${"═".repeat(maxLength + 2)}╗`;
  const bottomBorder = `╚${"═".repeat(maxLength + 2)}╝`;
  const middle = processedLines
    .map((line) => `║ ${line.padEnd(maxLength + 10)} ║`)
    .join("\n");
  return `${topBorder}\n${middle}\n${bottomBorder}`;
}

function createBanner(lines: string[]): string {
  const text = lines.join(" ");
  const bannerLine = "*".repeat(text.length + 4);
  return `${bannerLine}\n* ${text} *\n${bannerLine}`;
}

function createUnderline(lines: string[]): string {
  return lines.map((line) => `${line}\n${"=".repeat(line.length)}`).join("\n");
}

function processLines(lines: string[], limit?: number): string[] {
  return lines.map((line) => {
    let truncatedLine = line;
    if (limit && line.length > limit) {
      truncatedLine = `${line.slice(0, limit - 3)}...`;
    }
    return truncatedLine.padEnd(limit || truncatedLine.length);
  });
}
