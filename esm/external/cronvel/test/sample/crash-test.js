import termkit from "../../src/termkit.js";
// @ts-nocheck
var term = termkit.terminal;
term.grabInput({ mouse: "motion", focus: true });
term.on("mouse", function () { });
setTimeout(function () {
    throw new Error("crash!");
}, 10);
