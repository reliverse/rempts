import termkit from "../../src/termkit.js";
// @ts-nocheck
/* jshint unused:false */
termkit.getDetectedTerminal(function (error, term) {
    term.getPalette(function (error, palette) {
        console.log(palette);
        process.exit();
    });
});
