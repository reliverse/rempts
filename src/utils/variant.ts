export function applyVariant(text: string, variant?: string): string {
  if (variant === "box") {
    const lines = text.split("\n");
    const maxLength = Math.max(...lines.map((line) => line.length));
    const topBorder = `┌${"─".repeat(maxLength + 2)}┐`;
    const bottomBorder = `└${"─".repeat(maxLength + 2)}┘`;
    const middle = lines
      .map((line) => `│ ${line.padEnd(maxLength)} │`)
      .join("\n");
    return `${topBorder}\n${middle}\n${bottomBorder}`;
  }
  return text;
}
