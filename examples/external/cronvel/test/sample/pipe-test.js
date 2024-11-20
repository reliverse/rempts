import termkit from "../../src/termkit.js";
// @ts-nocheck
var term = termkit.terminal;
process.stdin.on("data", function (data) {
    term.red(data.toString());
});
