#!/usr/bin/env node

var termkit = require("../../lib/termkit.js");
var term = termkit.terminal;

term.clear();

var document = term.createDocument();

var rowMenu = new termkit.RowMenu({
  parent: document,
  x: 0,
  y: 0,
  separator: "|",
  justify: true,
  width: 20,
  items: [
    {
      content: "File",
      value: "file",
    },
    {
      content: "Edit",
      value: "edit",
    },
    {
      content: "View",
      value: "view",
    },
    {
      //content: 'History' ,
      content: "^rHistory",
      markup: true,
      value: "history",
    },
    {
      //blurAttr: { color: 204 , bgColor: 77 } ,
      content: "Bookmarks",
      value: "bookmarks",
    },
    {
      content: "Tools",
      value: "tools",
    },
    {
      content: "Help",
      value: "help",
    },
  ],
});

function onSubmit(buttonValue) {
  //console.error( 'Submitted: ' , value ) ;
  term.saveCursor();
  term.moveTo.styleReset.eraseLine(1, 22, "Submitted: %s\n", buttonValue);
  term.restoreCursor();
}

function onItemFocus(buttonValue, focus) {
  //console.error( 'Submitted: ' , value ) ;
  term.saveCursor();
  term.moveTo.styleReset.eraseLine(
    1,
    24,
    "Item focus: %s %s\n",
    buttonValue,
    focus,
  );
  term.restoreCursor();
}

rowMenu.on("submit", onSubmit);
rowMenu.on("itemFocus", onItemFocus);

document.giveFocusTo(rowMenu);

term.on("key", (key) => {
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
