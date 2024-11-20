// @ts-nocheck

import termkit from "../../../src/termkit";

// @ts-nocheck
const term = termkit.terminal;

term.clear();

var document = term.createDocument();

var selectListMulti = new termkit.SelectListMulti({
  parent: document,
  x: 10,
  y: 10,
  //buttonSpacing: 3 ,
  //justify: true ,
  //width: 50 ,
  content: "list",
  value: ["done", "todo"],
  //value: { done: true , todo: true } ,
  //master: { content: 'Select' } ,
  items: [
    {
      content: "Todo",
      key: "todo",
    },
    {
      content: "In Progress",
      key: "in-progress",
    },
    {
      content: "Done",
      key: "done",
    },
  ],
});

var submitCount = 0,
  toggleCount = 0;

function onSubmit(value) {
  //console.error( 'Submitted: ' , value ) ;
  term.saveCursor();
  term.moveTo.styleReset.eraseLine(
    1,
    22,
    "Submitted #%i: %J\n",
    submitCount++,
    value,
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

selectListMulti.on("submit", onSubmit);
selectListMulti.on("itemToggle", onItemToggle);

document.giveFocusTo(selectListMulti);

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
