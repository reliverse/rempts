#!/usr/bin/env node

const termkit = require("../..");
const term = termkit.terminal;
const Promise = require("seventh");

term.clear();

var document = term.createDocument({
  palette: new termkit.Palette(),
  //	backgroundAttr: { bgColor: 'magenta' , dim: true } ,
});

var textBox = new termkit.TextBox({
  parent: document,
  //content: text ,
  //contentHasMarkup: true ,
  scrollable: true,
  vScrollBar: true,
  lineWrap: true,
  //wordWrap: true ,
  x: 0,
  y: 2,
  width: 40,
  height: 8,
});

async function randomLogs() {
  var index = 0,
    randomStr = [
      "[INFO] Initilizing...",
      "[INFO] Exiting...",
      "[INFO] Reloading...",
      "[WARN] No config found",
      "[VERB] Client disconnected",
      "[INFO] Loading data",
      "[VERB] Awesome computing in progress",
      "[VERB] Lorem ipsum",
    ];

  while (true) {
    await Promise.resolveTimeout(50 + Math.random() * 1000);
    textBox.appendLog(
      "Log #" +
        index++ +
        " " +
        randomStr[Math.floor(Math.random() * randomStr.length)],
    );
  }
}

randomLogs();

term.on("key", function (key) {
  switch (key) {
    case "CTRL_C":
      term.grabInput(false);
      term.hideCursor(false);
      term.styleReset();
      term.clear();
      process.exit();
      break;
  }
});
