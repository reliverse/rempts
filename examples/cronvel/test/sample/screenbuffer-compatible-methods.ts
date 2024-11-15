#!/usr/bin/env node

/* jshint unused:false */

var terminal = require("../lib/termkit.js");

terminal.getDetectedTerminal(function (error, term) {
  var i;

  term.put({ x: 10, y: 10, attr: { color: "cyan", bold: true } }, "Cyan!");
  term.put({ x: 20, y: 15, attr: { color: "red", italic: true } }, "Red!");
  term.put({ x: 30, y: 20 }, "No attr!");
  term("\n\n");
});
