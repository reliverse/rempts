// @ts-nocheck

var term = require("../../src/termkit").terminal;

process.stdin.on("data", function (data) {
  term.red(data.toString());
});
