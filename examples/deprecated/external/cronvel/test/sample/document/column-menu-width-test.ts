// @ts-nocheck

import termkit from "../..";

// @ts-nocheck
var term = termkit.terminal;

term.clear();

var document = term.createDocument();

var columnMenu = new termkit.ColumnMenu({
  parent: document,
  x: 0,
  y: 5,
  //width: 20 ,
  //pageMaxHeight: 5 ,
  blurLeftPadding: "  ",
  focusLeftPadding: "^R> ",
  disabledLeftPadding: "  ",
  paddingHasMarkup: true,
  multiLineItems: true,
  items: [
    {
      content: "File",
      value: "file",
    },
    {
      //content: 'Edit' ,
      content: "^REdit",
      markup: true,
      value: "edit",
    },
    {
      content: "View",
      value: "view",
    },
    {
      content: "History",
      value: "history",
    },
    {
      //content: 'Bookmarks' ,
      content: "^CBook^Ymark^Rs",
      markup: true,
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
    {
      content: "Not long",
      value: "not long",
    },
  ],
});

columnMenu.on("submit", onSubmit);

function onSubmit(buttonValue) {
  //console.error( 'Submitted: ' , value ) ;
  term.saveCursor();
  term.moveTo.styleReset.eraseLine(1, 22, "Submitted: %s\n", buttonValue);
  term.restoreCursor();
}

document.giveFocusTo(columnMenu);

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
