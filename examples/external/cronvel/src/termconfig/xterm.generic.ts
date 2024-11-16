// @ts-nocheck

const tree = require("tree-kit");
const xterm = require("./xterm");

// Fail-safe xterm-compatible

const esc = tree.extend(null, Object.create(xterm.esc), {
  // KDE Konsole does not support that. This workaround use up()/down() & column(1)
  nextLine: { on: "\x1b[%UB\x1b[1G" },
  previousLine: { on: "\x1b[%UA\x1b[1G" },

  // Not supported outside of xterm
  setClipboardLL: { na: true },
  requestClipboard: { na: true },

  // Cursor styles

  // Try that sequences for instance, if it fails gracefully, it will be kept
  // Xterm sequences fail and write garbage
  blockCursor: { on: "\x1b]50;CursorShape=0\x07" },
  blinkingBlockCursor: { on: "\x1b]50;CursorShape=0\x07" },
  underlineCursor: { on: "\x1b]50;CursorShape=2\x07" },
  blinkingUnderlineCursor: { on: "\x1b]50;CursorShape=2\x07" },
  beamCursor: { on: "\x1b]50;CursorShape=1\x07" },
  blinkingBeamCursor: { on: "\x1b]50;CursorShape=1\x07" },

  // Disabled version
  /*
	blockCursor: { on: '' } ,
	blinkingBlockCursor: { on: '' } ,
	underlineCursor: { on: '' } ,
	blinkingUnderlineCursor: { on: '' } ,
	beamCursor: { on: '' } ,
	blinkingBeamCursor: { on: '' }
	*/
});

/* Key Mapping */

const keymap = Object.create(xterm.keymap);

/* Handlers */

const handler = Object.create(xterm.handler);

module.exports = {
  esc: esc,
  keymap: keymap,
  handler: handler,
  support: {
    deltaEscapeSequence: true,
    "256colors": false,
    "24bitsColors": false, // DEPRECATED
    trueColor: false,
  },
  colorRegister: require("../colorScheme/vga.json"),
};
