import stringWidth from "string-width";

import { getTerminalWidth } from "~/main.js";

export const getLongestLineWidth = (text: string) => {
  const rawWidth = Math.max(
    ...text.split("\n").map((line) => stringWidth(line)),
  );
  return getTerminalWidth(rawWidth);
};
