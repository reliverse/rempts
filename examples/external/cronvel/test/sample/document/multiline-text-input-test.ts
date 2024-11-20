import termkit from "../..";

// @ts-nocheck
var term = termkit.terminal;

term.clear();

var document = term.createDocument();

var labeledInput = new termkit.LabeledInput({
  parent: document,
  label: "comment: ",
  x: 5,
  y: 10,
  width: 50,
  height: 5,
  allowNewLine: true,
});

labeledInput.on("submit", onSubmit);

function onSubmit(value) {
  //console.error( 'Submitted: ' , value ) ;
  term.saveCursor();
  term.moveTo.styleReset.eraseLine(1, 22, "Submitted: %s\n", value);
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
