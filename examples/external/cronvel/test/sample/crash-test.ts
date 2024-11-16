// @ts-nocheck

var term = require("../../src/termkit").terminal;

term.grabInput({ mouse: "motion", focus: true });

term.on("mouse", function () {});

setTimeout(function () {
  throw new Error("crash!");
}, 10);
