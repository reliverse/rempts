// @ts-nocheck

import termkit from "../../src/termkit";
import gpm from "../../src/gpm";

// @ts-nocheck

/* jshint unused:false */
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
