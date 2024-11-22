// @ts-nocheck

import strip from "./strip.js";

export default (function (msg, perLine) {
  let lines = String(strip(msg) || "").split(/\r?\n/);
  if (!perLine) return lines.length;
  return lines
    .map((l) => Math.ceil(l.length / perLine))
    .reduce((a, b) => a + b);
});
