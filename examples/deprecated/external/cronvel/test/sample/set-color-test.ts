// @ts-nocheck

/* jshint unused:false */

var palette = process.argv[2] || "xterm";

require("../../src/termkit").getDetectedTerminal(function (error, term) {
  term.setPalette(palette);
  process.exit();
});
