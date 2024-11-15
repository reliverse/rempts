const tree = require("tree-kit");
const xterm256 = require("./xterm-256color.js");
const eterm = require("./eterm.js");

const esc = tree.extend({ own: true }, Object.create(xterm256.esc), eterm.esc, {
  color24bits: { on: "%D%D%D", na: true }, // not capable
  bgColor24bits: { on: "%D%D%D", na: true }, // not capable
});

// So far, we derivate from xterm-256color and then just add specific things (owned properties)
// of Eterm, thus we achieve a clean inheritance model without duplicated code.

module.exports = {
  esc: esc,
  keymap: tree.extend(
    { own: true },
    Object.create(xterm256.keymap),
    eterm.keymap,
  ),
  handler: tree.extend(
    { own: true },
    Object.create(xterm256.handler),
    eterm.handler,
  ),
  support: {
    deltaEscapeSequence: true,
    "256colors": true,
    "24bitsColors": false, // DEPRECATED
    trueColor: false,
  },
  colorRegister: eterm.colorRegister,
};
