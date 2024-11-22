// @ts-nocheck

import tree from "tree-kit";
import xterm256 from "./xterm-256color.js";
import konsole from "./konsole.js";

// @ts-nocheck
// Remove colors
const defaultColor = "\x1b[39m"; // back to the default color, most of time it is the same than .white
const bgDefaultColor = "\x1b[49m"; // back to the default color, most of time it is the same than .bgBlack

const esc = tree.extend(
  { own: true },
  Object.create(xterm256.esc),
  konsole.esc,
  {
    color24bits: {
      on: "\x1b[38;2;%u;%u;%um",
      off: defaultColor,
      optimized: (r, g, b) => "\x1b[38;2;" + r + ";" + g + ";" + b + "m",
    },
    bgColor24bits: {
      on: "\x1b[48;2;%u;%u;%um",
      off: bgDefaultColor,
      optimized: (r, g, b) => "\x1b[48;2;" + r + ";" + g + ";" + b + "m",
    },
  },
);

// So far, we derivate from xterm-256color and then just add specific things (owned properties)
// of konsole, thus we achieve a clean inheritance model without duplicated code.
export default {
  esc: esc,
  keymap: tree.extend(
    { own: true },
    Object.create(xterm256.keymap),
    konsole.keymap,
  ),
  handler: tree.extend(
    { own: true },
    Object.create(xterm256.handler),
    konsole.handler,
  ),
  support: {
    deltaEscapeSequence: true,
    "256colors": true,
    "24bitsColors": true, // DEPRECATED
    trueColor: true,
  },
  colorRegister: konsole.colorRegister,
};
