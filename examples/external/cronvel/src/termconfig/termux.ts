import tree from "tree-kit";
import xterm256 from "./xterm-256color.js";

// @ts-nocheck
// Remove colors
const defaultColor = "\x1b[39m"; // back to the default color, most of time it is the same than .white
const bgDefaultColor = "\x1b[49m"; // back to the default color, most of time it is the same than .bgBlack

const esc = tree.extend({ own: true }, Object.create(xterm256.esc), {
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

  // Termux does not send drag event, so we use the ESC sequence for mouseButton
  mouseDrag: { on: "\x1b[?1000h", off: "\x1b[?1000l", fb: true },
  // Termux does not support mouseMotion mode (it turns off the mouse events completely), so we fallback to the ESC sequence for mouseButton
  mouseMotion: { on: "\x1b[?1000h", off: "\x1b[?1000l", fb: true },
});

// So far, we derivate from xterm-256color.
export default {
      esc: esc,
      keymap: Object.create(xterm256.keymap),
      handler: Object.create(xterm256.handler),
      support: {
        deltaEscapeSequence: true,
        "256colors": true,
        "24bitsColors": true, // DEPRECATED
        trueColor: true,
      },
      colorRegister: require("../colorScheme/xterm.json"),
    };
