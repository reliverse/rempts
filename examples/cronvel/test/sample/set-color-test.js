#!/usr/bin/env node

/* jshint unused:false */

var palette = process.argv[2] || "xterm";

require("../lib/termkit.js").getDetectedTerminal(function (error, term) {
  term.setPalette(palette);
  process.exit();
});
