// @ts-nocheck

/* jshint unused:false */

require("../../src/termkit").getDetectedTerminal(function (error, term) {
  /*
	var term = require( '../lib/termkit' ).terminal ;
	term( 'Terminal name: %s\n' , term.appName ) ;
	term( 'Terminal app ID: %s\n' , term.appId ) ;
	term( 'Generic terminal: %s\n' , term.generic ) ;
	term( 'Config file: %s\n' , term.termconfigFile ) ;
	//*/

  var i, r, g, b;

  term.bold("\n=== 24 bits colors 256 shades of gray test ===\n\n");

  for (i = 0; i <= 255; i++) {
    if (!(i % 70)) {
      term("\n");
    }
    term.colorGrayscale(i, "*");
  } // jshint ignore:line
  term.styleReset("\n");
  for (i = 0; i <= 255; i++) {
    if (!(i % 70)) {
      term("\n");
    }
    term.bgColorGrayscale(i, " ");
  } // jshint ignore:line
  term.styleReset("\n");

  term.bold("\n=== 24 bits colors 256 shades of green test ===\n\n");

  for (i = 0; i <= 255; i++) {
    if (!(i % 70)) {
      term("\n");
    }
    term.colorRgb(0, i, 0, "*");
  } // jshint ignore:line
  term.styleReset("\n");
  for (i = 0; i <= 255; i++) {
    if (!(i % 70)) {
      term("\n");
    }
    term.bgColorRgb(0, i, 0, " ");
  } // jshint ignore:line
  term.styleReset("\n");

  term.bold(
    "\n=== 24 bits colors 256 shades of desatured magenta test ===\n\n",
  );

  for (i = 0; i <= 255; i++) {
    if (!(i % 70)) {
      term("\n");
    }
    term.colorRgb(i, Math.floor(i / 2), i, "*");
  } // jshint ignore:line
  term.styleReset("\n");
  for (i = 0; i <= 255; i++) {
    if (!(i % 70)) {
      term("\n");
    }
    term.bgColorRgb(i, Math.floor(i / 2), i, " ");
  } // jshint ignore:line
  term.styleReset("\n");

  // Reset before exiting...

  term.styleReset("\n");
  term("Reset...\n");
});
