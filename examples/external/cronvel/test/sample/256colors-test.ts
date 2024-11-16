// @ts-nocheck

require("..").getDetectedTerminal(function (error, term) {
  //term.getPalette( function( error , palette ) {

  var i, r, g, b;

  term.bold("\n=== 256 colors register test ===\n\n");

  for (i = 0; i <= 255; i++) {
    if (!(i % 70)) {
      term("\n");
    }
    term.color256(i, "*");
  } // jshint ignore:line
  term.styleReset("\n");
  for (i = 0; i <= 255; i++) {
    if (!(i % 70)) {
      term("\n");
    }
    term.bgColor256(i, " ");
  } // jshint ignore:line
  term.styleReset("\n");

  term.bold("\n=== 256 colors 26 shades of gray test ===\n\n");

  for (i = 0; i <= 25; i++) {
    term.colorGrayscale((i * 255) / 25, "*");
  }
  term.styleReset("\n");
  for (i = 0; i <= 25; i++) {
    term.bgColorGrayscale((i * 255) / 25, " ");
  }
  term.styleReset("\n");

  term.bold("\n=== 256 colors RGB 6x6x6 color cube test ===\n\n");

  for (g = 0; g <= 5; g++) {
    for (r = 0; r <= 5; r++) {
      for (b = 0; b <= 5; b++) {
        term.colorRgb((r * 255) / 5, (g * 255) / 5, (b * 255) / 5, "*");
      }

      term(" ");
    }

    term.styleReset("\n");
  }

  term.styleReset("\n");

  for (g = 0; g <= 5; g++) {
    for (r = 0; r <= 5; r++) {
      for (b = 0; b <= 5; b++) {
        term.bgColorRgb((r * 255) / 5, (g * 255) / 5, (b * 255) / 5, "  ");
      }

      term(" ");
    }

    term.styleReset("\n");
  }

  term.styleReset("\n");

  // Reset before exiting...

  term.styleReset("\n");
  term("Reset...\n");
  //} ) ;
});
