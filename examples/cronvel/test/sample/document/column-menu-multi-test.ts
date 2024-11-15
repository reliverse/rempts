#!/usr/bin/env node

const termkit = require("../..");
const term = termkit.terminal;

term.clear();

var document = term.createDocument();

var columnMenuMulti = new termkit.ColumnMenuMulti({
  parent: document,
  x: 0,
  y: 5,
  width: 20,
  pageMaxHeight: 5,
  blurLeftPadding: "  ",
  focusLeftPadding: "^R> ",
  disabledLeftPadding: "  ",
  paddingHasMarkup: true,
  multiLineItems: true,

  value: {
    view: true,
    file: true,
  },
  items: [
    {
      content: "File",
      key: "file",
    },
    {
      //content: 'Edit' ,
      content: "^REdit",
      markup: true,
      key: "edit",
    },
    {
      content: "View",
      key: "view",
    },
    {
      content: "History",
      key: "history",
    },
    {
      content: "Bookmarks",
      key: "bookmarks",
    },
    {
      content: "Tools",
      key: "tools",
    },
    {
      content: "Help",
      key: "help",
    },
    {
      content: "Disabled button",
      disabled: true,
      key: "disabled",
    },
    {
      //content: 'Very long, very long, very long, very long, very long, very long, very long, very long, very long, very long' ,
      content:
        "Very long, very long, very ^rlong, very long, very long, very long, very ^blong, very long, very long, very long",
      markup: true,
      key: "very long",
    },
    {
      content: "Not long",
      key: "not long",
    },
  ],
});

var submitCount = 0,
  toggleCount = 0;

function onSubmit(buttonValue) {
  term.saveCursor();
  term.moveTo.styleReset.eraseLine(
    1,
    22,
    "Submitted #%i: %J\n",
    submitCount++,
    buttonValue,
  );
  term.restoreCursor();
}

function onItemToggle(key, toggle) {
  //console.error( 'Submitted: ' , value ) ;
  term.saveCursor();
  term.moveTo.styleReset.eraseLine(
    1,
    24,
    "Toggled #%i: %s %s\n",
    toggleCount++,
    key,
    toggle,
  );
  term.restoreCursor();
}

columnMenuMulti.on("submit", onSubmit);
columnMenuMulti.on("itemToggle", onItemToggle);

document.giveFocusTo(columnMenuMulti);

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
