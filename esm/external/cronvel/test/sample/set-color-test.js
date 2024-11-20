import termkit from "../../src/termkit.js";
// @ts-nocheck
/* jshint unused:false */
var palette = process.argv[2] || "xterm";
termkit.getDetectedTerminal(function (error, term) {
    term.setPalette(palette);
    process.exit();
});
