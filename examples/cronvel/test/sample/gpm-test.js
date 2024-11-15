#!/usr/bin/env node

/* jshint unused:false */

var termkit = require("../lib/termkit.js");
var gpm = require("../lib/gpm.js");

var handler = gpm.createHandler({
  stdin: process.stdin,
  raw: false,
  mode: "motion" /* 'drag' or 'button' */,
});

handler.on("mouse", function (name, data) {
  console.log("Mouse event received:", name, data);
});

setTimeout(function () {
  process.exit();
}, 15000);
