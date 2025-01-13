import { getTerminalWidth } from "@reliverse/relinka";
import stringWidth from "string-width";

export const getLongestLineWidth = (text: string) => {
  const rawWidth = Math.max(
    ...text.split("\n").map((line) => stringWidth(line)),
  );
  return getTerminalWidth(rawWidth);
};
