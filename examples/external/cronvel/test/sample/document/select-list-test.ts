import termkit from "../../../src/termkit.js";

// @ts-nocheck
const term = termkit.terminal;

term.clear();

var document = term.createDocument();

var selectList = new termkit.SelectList({
  parent: document,
  x: 10,
  y: 10,
  //buttonSpacing: 3 ,
  //justify: true ,
  //width: 50 ,
  //content: 'list' ,
  value: "list value",
  //value: 'done' ,
  master: { content: "Select" },
  items: [
    {
      content: "Todo",
      value: "todo",
    },
    {
      content: "In Progress",
      value: "in-progress",
    },
    {
      content: "Done",
      value: "done",
    },
  ],
});

function onSubmit(buttonValue) {
  //console.error( 'Submitted: ' , value ) ;
  term.saveCursor();
  term.moveTo.styleReset.eraseLine(1, 22, "Submitted: %s\n", buttonValue);
  term.moveTo.styleReset.eraseLine(
    1,
    23,
    "Select value: %s\n",
    selectList.value,
  );
  term.moveTo.styleReset.eraseLine(
    1,
    24,
    "Select .getValue(): %s\n",
    selectList.getValue(),
  );
  term.restoreCursor();
}

selectList.on("submit", onSubmit);

document.giveFocusTo(selectList);

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
