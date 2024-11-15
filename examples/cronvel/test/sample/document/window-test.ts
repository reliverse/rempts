#!/usr/bin/env node

const termkit = require("../..");
const term = termkit.terminal;

term.clear();
//term.hideCursor( true ) ;

var document = term.createDocument();

var window = new termkit.Window({
  parent: document,
  //frameChars: 'dotted' ,
  x: 10,
  y: 10,
  width: 50,
  height: 10,
  inputHeight: 30,
  title: "^c^+Cool^:, a ^/window^:!",
  titleHasMarkup: true,
  movable: true,
  scrollable: true,
  vScrollBar: true,
  //hScrollBar: true ,

  // Features that are planned, but not yet supported:
  minimizable: true,
  dockable: true,
  closable: true,
  resizable: true,
});

var content = [
  "This is the window content...",
  "Second line of content...",
  "Third line of content...",
];

for (let i = 4; i <= 30; i++) {
  content.push("" + i + "th line of content...");
}

new termkit.Text({
  parent: window,
  content,
  attr: { color: "green", italic: true },
});

term.moveTo(1, 1);

term.on("key", function (key) {
  if (key === "CTRL_C") {
    term.grabInput(false);
    //term.hideCursor( false ) ;
    term.clear();
    process.exit();
  }
});
