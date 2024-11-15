// @ts-nocheck

const termkit = require("..");
const term = termkit.terminal;
const terminfo = require("../../src/terminfo/terminfo");

var termName = process.argv[2] || process.env.TERM;
var key = process.argv[3] || null;

console.log(termName);
var info = terminfo.getTerminfo(termName);

if (key) {
  console.log(key + ":", JSON.stringify(info[key]));
} else {
  console.log(info);
}

try {
  var termconfig = require("../../src/termconfig/" + termName + "");
  var newTermconfig = terminfo.mergeWithTerminfo(termconfig, info);
  term("terminfo keyUp: %s\n", info.keyUp);
  term("termconfig UP: %s\n", termconfig.keymap.UP);
  term("new termconfig UP: %s\n", newTermconfig.keymap.UP);
} catch (error) {
  console.log("Config for", termName, "not found:", error);
}
