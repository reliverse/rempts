import vga from "../colorScheme/vga.json" with { type: "json" };
import tree from "tree-kit";
import xterm256 from "./xterm-256color.js";
import xtermGeneric from "./xterm.generic.js";
// @ts-nocheck
// Fail-safe xterm-compatible.
// So far, we derivate from xterm-256color and then just add specific things (owned properties)
// of xterm.generic, thus we achieve a clean inheritance model without duplicated code.
export default {
    esc: tree.extend({ own: true }, Object.create(xterm256.esc), xtermGeneric.esc),
    keymap: Object.create(xtermGeneric.keymap),
    handler: Object.create(xtermGeneric.handler),
    support: {
        deltaEscapeSequence: true,
        "256colors": true,
        "24bitsColors": undefined, // DEPRECATED
        trueColor: undefined, // maybe, maybe not
    },
    colorRegister: vga,
};
