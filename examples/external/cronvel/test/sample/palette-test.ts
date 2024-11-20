// @ts-nocheck

import termkit from "..";
import Palette from "../../src/Palette";

// @ts-nocheck

// https://fr.wikipedia.org/wiki/Cercle_chromatique#Hering

// Cool lib to manipulate colors: https://github.com/gka/chroma
const term = termkit.terminal;

var i, j, z, scale, h, c, l, r, g, b;

term.bold("\n\n=== Palette Class tests  ===\n\n");
var palette = new Palette();
palette.generate();

for (i = 0; i < 16; i++) {
  if (i % 8 === 0) {
    term.styleReset("\n");
  }
  term.raw(palette.bgEscape[i] + "  ");
}

term.styleReset("\n");
for (i = 16; i < 232; i++) {
  if ((i - 16) % 12 === 0) {
    term.styleReset("\n");
  }
  if ((i - 16) % 72 === 0) {
    term.styleReset("\n");
  }
  term.raw(palette.bgEscape[i] + "  ");
}

term.styleReset("\n\n");
for (i = 232; i < 245; i++) {
  term.raw(palette.bgEscape[i] + "  ");
}

term.styleReset("\n\n");
for (i = 245; i < 256; i++) {
  term.raw(palette.bgEscape[i] + "  ");
}

term.styleReset("\n");

//term.raw( palette.bgEscape[ register ] + '  ' ) ;

var buffer = termkit.ScreenBuffer.create({
  dst: term,
  width: 8,
  height: 8,
  x: term.width - 10,
  y: 10,
  palette: palette,
});
//var buffer = termkit.ScreenBufferHD.create( { dst: term , width: 8 , height: 8 , x: term.width - 10 , y: 10 , palette: palette } ) ;

buffer.fill({ attr: { bgColor: "@yellow~--" } });
buffer.put({ x: 1, y: 1, markup: true }, "^[fg:*crimson]^[bg:*pink]BOB");
buffer.put(
  { x: 3, y: 3, attr: { bgColor: 241 }, markup: true },
  "^[fg:red]BOB",
);
buffer.put(
  { x: 1, y: 4, attr: { bgColor: "default" }, markup: "ansi" },
  "w\x1b[31mred\x1b[92m\x1b[1mG\x1b[41m\x1b[34mB",
);
//buffer.put( { x:3 , y:3 , markup: true } , '^[fg:#a50]BOB' ) ;	// Only works with ScreenBufferHD ATM
term.saveCursor();
buffer.draw();
term.restoreCursor();

//console.log( palette.colorIndex ) ;

// Reset before exiting...

term.styleReset("\n");
term("Reset...\n");
