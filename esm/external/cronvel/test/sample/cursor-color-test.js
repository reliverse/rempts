import termkit from "../../src/termkit.js";
// @ts-nocheck
/* jshint unused:false */
termkit.getDetectedTerminal(function (error, term) {
    //*
    var r = Math.floor(Math.random() * 256);
    var g = Math.floor(Math.random() * 256);
    var b = Math.floor(Math.random() * 256);
    term.bold.cyan("Setting the cursor color to RGB (%d,%d,%d)\n", r, g, b);
    term.setCursorColorRgb(r, g, b);
    //*/
    /*
      var c = Math.floor( Math.random() * 8 ) ;
      term.bold.cyan( 'Setting the cursor color to register %d\n' , c ) ;
      term.setCursorColor( c , 0 ) ;
      //*/
    var t = Math.floor(Math.random() * 6);
    switch (t) {
        case 0:
            term.blockCursor("Block cursor\n");
            break;
        case 1:
            term.blinkingBlockCursor("Blinking block cursor\n");
            break;
        case 2:
            term.underlineCursor("Underline cursor\n");
            break;
        case 3:
            term.blinkingUnderlineCursor("Blinking underline cursor\n");
            break;
        case 4:
            term.beamCursor("Beam cursor\n");
            break;
        case 5:
            term.blinkingBeamCursor("Blinking Beam cursor\n");
            break;
    }
});
