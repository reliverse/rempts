import strip from "./strip";

/**
 * @param {string} msg
 * @param {number} perLine
 */
export default (msg: string, perLine: number) => {
  const lines = String(strip(msg) || "").split(/\r?\n/);

  if (!perLine) return lines.length;
  return lines
    .map((l) => Math.ceil(l.length / perLine))
    .reduce((a, b) => a + b);
};
  