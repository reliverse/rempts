// @ts-nocheck

import tree from "tree-kit";
import xterm from "./xterm";

// @ts-nocheck
const esc = tree.extend(null, Object.create(xterm.esc), {
  // Not supported...
  setClipboardLL: { na: true },
  requestClipboard: { na: true },

  // Cursor styles

  // Looks like a no go, gnome-terminal is too stubborn to let the application decide about that
  blockCursor: { on: "", na: true },
  blinkingBlockCursor: { on: "", na: true },
  underlineCursor: { on: "", na: true },
  blinkingUnderlineCursor: { on: "", na: true },
  beamCursor: { on: "", na: true },
  blinkingBeamCursor: { on: "", na: true },

  /*
	blockCursor: { on: '\x1b]50;CursorShape=0\x07' } ,
	blinkingBlockCursor: { on: '\x1b]50;CursorShape=0\x07' } ,
	underlineCursor: { on: '\x1b]50;CursorShape=2\x07' } ,
	blinkingUnderlineCursor: { on: '\x1b]50;CursorShape=2\x07' } ,
	beamCursor: { on: '\x1b]50;CursorShape=1\x07' } ,
	blinkingBeamCursor: { on: '\x1b]50;CursorShape=1\x07' }
	*/
});

const keymap = Object.create(xterm.keymap);
const handler = Object.create(xterm.handler);

export default {
  esc: esc,
  keymap: keymap,
  handler: handler,
  support: {
    deltaEscapeSequence: true,
    "256colors": false,
    "24bitsColors": false, // DEPRECATED
    trueColor: false,
  },
  colorRegister: require("../colorScheme/gnome.json"),
};
