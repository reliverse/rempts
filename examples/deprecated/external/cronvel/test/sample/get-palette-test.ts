// @ts-nocheck

/* jshint unused:false */

require("../../src/termkit").getDetectedTerminal(function (error, term) {
  term.getPalette(function (error, palette) {
    console.log(palette);
    process.exit();
  });
});
