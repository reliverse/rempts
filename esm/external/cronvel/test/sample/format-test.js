import termkit from "../../src/termkit.js";
// @ts-nocheck
/* jshint unused:false */
var term = termkit.terminal;
termkit.getDetectedTerminal(function (error, term_) {
    var i;
    term = term_;
    term("This ^+is^ a %s <--\n", "formatted string");
    term("This is ^bblue\n");
    term("This is normal\n");
    term("This is ^bblue^ ^wwhite^ ^_underline^ normal\n");
    term("This is ^m^+^_magenta-bold-underlined\n");
    term("\n");
    term.styleReset();
    term("Reset...\n");
});
