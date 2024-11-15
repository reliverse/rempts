#!/usr/bin/env node

var term = require("../lib/termkit.js").terminal;

process.stdin.on("data", function (data) {
  term.red(data.toString());
});
