const tree = require("tree-kit");
const xterm256 = require("./xterm-256color.js");
const xtermGeneric = require("./xterm.generic.js");

// Fail-safe xterm-compatible.

// So far, we derivate from xterm-256color and then just add specific things (owned properties)
// of xterm.generic.js, thus we achieve a clean inheritance model without duplicated code.

module.exports = {
  esc: tree.extend(
    { own: true },
    Object.create(xterm256.esc),
    xtermGeneric.esc,
  ),
  keymap: Object.create(xtermGeneric.keymap),
  handler: Object.create(xtermGeneric.handler),
  support: {
    deltaEscapeSequence: true,
    "256colors": true,
    "24bitsColors": undefined, // DEPRECATED
    trueColor: undefined, // maybe, maybe not
  },
  colorRegister: require("../colorScheme/vga.json"),
};
