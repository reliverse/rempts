// @ts-nocheck

import tree from "tree-kit";
import xterm from "./xterm.js";
import string from "string-kit";

// @ts-nocheck
// Remove colors
const defaultColor = "\x1b[39m"; // back to the default color, most of time it is the same than .white
const bgDefaultColor = "\x1b[49m"; // back to the default color, most of time it is the same than .bgBlack

const esc = tree.extend(null, Object.create(xterm.esc), {
  color256: { on: "\x1b[38;5;%um", off: defaultColor },
  bgColor256: { on: "\x1b[48;5;%um", off: bgDefaultColor },

  setCursorColorRgb: { on: "\x1b]12;#%x%x%x\x07" }, // it want rgb as parameter, like rgb:127/0/32
  setDefaultColorRgb: { on: "\x1b]10;#%x%x%x\x07" }, // ->|TODOC|<- not widely supported
  setDefaultBgColorRgb: { on: "\x1b]11;#%x%x%x\x07" }, // ->|TODOC|<- not widely supported
  color24bits: { on: "\x1b[38;2;%u;%u;%um", off: defaultColor, fb: true },
  bgColor24bits: { on: "\x1b[48;2;%u;%u;%um", off: bgDefaultColor, fb: true },

  // Cannot find a way to set the cursor to a register, so try to guess
  setCursorColor: {
    on: "%[setCursorColor:%a%a]F",
    handler: function setCursorColor(bg, fg) {
      if (typeof fg !== "number" || typeof bg !== "number") {
        return "";
      }

      fg = Math.floor(fg);
      bg = Math.floor(bg);

      if (fg < 0 || fg > 255 || bg < 0 || bg > 255) {
        return "";
      }

      var rgb = this.root.rgbForRegister(bg);

      return string.format(
        this.root.esc.setCursorColorRgb.on,
        rgb.r,
        rgb.g,
        rgb.b,
      );
    },
  },
});

const keymap = Object.create(xterm.keymap);
const handler = Object.create(xterm.handler);

export default {
  esc: esc,
  keymap: keymap,
  handler: handler,
  support: {
    deltaEscapeSequence: true,
    "256colors": true,
    "24bitsColors": false, // DEPRECATED
    trueColor: false,
  },
  colorRegister: xterm.colorRegister,
};
