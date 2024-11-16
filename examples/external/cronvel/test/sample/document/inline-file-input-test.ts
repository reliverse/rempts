// @ts-nocheck

const termkit = require("../../../src/termkit");
const term = termkit.terminal;

term.clear();

var document = term.createDocument();

var inlineInput = new termkit.InlineFileInput({
  parent: document,
  textAttr: { bgColor: "blue" },
  voidAttr: { bgColor: "blue" },
  x: 0,
  y: 10,
  //*
  prompt: {
    textAttr: { bgColor: "blue" },
    content: "^+^BOpen file:^ ",
    contentHasMarkup: true,
  },
  //*/
  //firstLineRightShift: 8 ,
  //width: 36 ,

  noEmpty: true,

  //* Set what is accepted, default to all and unexistant
  accept: {
    unexistant: true,
    file: true,
    //directory: true
  },
  //*/

  width: 100,
  cancelable: true,
  baseDir: "./",
  value: "",
  history: ["some-file", "some-other-file"],
  autoCompleteMenu: true,
  autoCompleteHint: true,
});

inlineInput.on("submit", onSubmit);

function onSubmit(value) {
  //console.error( 'Submitted: ' , value ) ;
  term.saveCursor();
  term.moveTo.styleReset.eraseLine(1, 22, "Submitted: '%s'\n", value);
  term.restoreCursor();
}

inlineInput.on("cancel", onCancel);

function onCancel() {
  //console.error( 'Submitted: ' , value ) ;
  term.saveCursor();
  term.moveTo.styleReset.eraseLine(1, 22, "Canceled\n");
  term.restoreCursor();
}

document.focusNext();

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
