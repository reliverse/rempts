import tree from "tree-kit";
import xterm256 from "./xterm-256color.js";

// @ts-nocheck
// Remove colors
const defaultColor = "\x1b[39m"; // back to the default color, most of time it is the same than .white
const bgDefaultColor = "\x1b[49m"; // back to the default color, most of time it is the same than .bgBlack

const esc = tree.extend(null, Object.create(xterm256.esc), {
  // 24 bits colors
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

  // Cursor styles not supported
  blockCursor: { on: "", na: true },
  blinkingBlockCursor: { on: "", na: true },
  underlineCursor: { on: "", na: true },
  blinkingUnderlineCursor: { on: "", na: true },
  beamCursor: { on: "", na: true },
  blinkingBeamCursor: { on: "", na: true },
});

const keymap = Object.create(xterm256.keymap);
const handler = Object.create(xterm256.handler);

export default {
      esc: esc,
      keymap: keymap,
      handler: handler,
      support: {
        deltaEscapeSequence: true,
        "256colors": true,
        "24bitsColors": true, // DEPRECATED
        trueColor: true,
      },
      colorRegister: require("../colorScheme/atomic-terminal.json"),
    };
