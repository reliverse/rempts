import chalkAnimation from "chalk-animation";
export function applyVariant(lines, variant, options) {
  switch (variant) {
    case "animated":
      return createAnimated(lines.join("\n"));
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
function createAnimated(text) {
  const animation = chalkAnimation.rainbow(text);
  setTimeout(() => {
    animation.stop();
  }, 2e3);
  return text;
}
function createBox(lines, limit) {
  const processedLines = processLines(lines, limit);
  const maxLength = Math.max(...processedLines.map((line) => line.length));
  const topBorder = `\u250C${"\u2500".repeat(maxLength + 2)}\u2510`;
  const bottomBorder = `\u2514${"\u2500".repeat(maxLength + 2)}\u2518`;
  const middle = processedLines.map((line) => `\u2502 ${line.padEnd(maxLength)} \u2502`).join("\n");
  return `${topBorder}
${middle}
${bottomBorder}`;
}
function createDoubleBox(lines, limit) {
  const processedLines = processLines(lines, limit);
  const maxLength = Math.max(...processedLines.map((line) => line.length));
  const topBorder = `\u2554${"\u2550".repeat(maxLength + 2)}\u2557`;
  const bottomBorder = `\u255A${"\u2550".repeat(maxLength + 2)}\u255D`;
  const middle = processedLines.map((line) => `\u2551 ${line.padEnd(maxLength + 10)} \u2551`).join("\n");
  return `${topBorder}
${middle}
${bottomBorder}`;
}
function createBanner(lines) {
  const text = lines.join(" ");
  const bannerLine = "*".repeat(text.length + 4);
  return `${bannerLine}
* ${text} *
${bannerLine}`;
}
function createUnderline(lines) {
  return lines.map((line) => `${line}
${"=".repeat(line.length)}`).join("\n");
}
function processLines(lines, limit) {
  return lines.map((line) => {
    let truncatedLine = line;
    if (limit && line.length > limit) {
      truncatedLine = `${line.slice(0, limit - 3)}...`;
    }
    return truncatedLine.padEnd(limit || truncatedLine.length);
  });
}
