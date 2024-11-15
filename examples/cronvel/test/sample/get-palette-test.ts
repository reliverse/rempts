#!/usr/bin/env node

/* jshint unused:false */

require("../lib/termkit.js").getDetectedTerminal(function (error, term) {
  term.getPalette(function (error, palette) {
    console.log(palette);
    process.exit();
  });
});
