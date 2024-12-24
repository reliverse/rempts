import stringWidth from "string-width";

import { getTerminalWidth } from "../../core/utils.js";

export const getLongestLineWidth = (text: string) => {
  const rawWidth = Math.max(
    ...text.split("\n").map((line) => stringWidth(line)),
  );
  return getTerminalWidth(rawWidth);
};
