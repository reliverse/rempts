import termkit from "..";
import terminfo from "../../src/terminfo/terminfo.js";

// @ts-nocheck
const term = termkit.terminal;
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
