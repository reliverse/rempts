#!/usr/bin/env node

/* jshint unused:false */

var term = require("../lib/termkit.js").terminal;
var i;

term("Check the .color() method:\n");
for (i = 0; i < 16; i++) {
  term.color(i, "*");
}
term("\n");

term("Check the .color256() method:\n");
for (i = 0; i < 16; i++) {
  term.color256(i, "*");
}
term("\n");

term("Check the .bgColor() method:\n");
for (i = 0; i < 16; i++) {
  term.bgColor(i, " ");
}
term("\n");

term("Check the .bgColor256() method:\n");
for (i = 0; i < 16; i++) {
  term.bgColor256(i, " ");
}
term("\n");

term("Styles:\n");
term
  .bold("bold ")
  .dim("dim ")
  .italic("italic ")
  .underline("underline ")
  .blink("blink ")
  .inverse("inverse ")
  .hidden("hidden ")
  .strike("strike ");
term("\n");

term("Background & foreground:\n");
term.blue.bgRed("blue on red");
term("\n");

term(".object2attr():\n");
var attr;
attr = term.object2attr({
  color: "blue",
  bgColor: "red",
  underline: true,
  italic: true,
});
term(attr);
term("Attr test ");
attr = term.object2attr({ color: "blue" });
term(attr);
term("Attr test2 ");

// Reset before exiting...

term.styleReset();
term("\nReset...\n");
