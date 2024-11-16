// @ts-nocheck

//console.error( "\n\n\n\n\n\n\n\n" ) ;
var termkit = require("../../../src/termkit");
var term = termkit.terminal;

term.clear();

var document = term.createDocument({
  // backgroundAttr: { bgColor: 'magenta' , dim: true } ,
});

var text = new termkit.Text({
  parent: document,
  content: "Some text",
  x: 40,
  y: 2,
});

var button1 = new termkit.Button({
  parent: document,
  content: "> bob",
  value: "bob",
  x: 10,
  y: 10,
});

var button2 = new termkit.Button({
  parent: document,
  content: "> bill",
  value: "bill",
  x: 13,
  y: 12,
});

var textInput1 = new termkit.LabeledInput({
  parent: document,
  label: "First name: ",
  x: 5,
  y: 16,
  width: 30,
});

var textInput2 = new termkit.LabeledInput({
  parent: document,
  label: "Last name: ",
  x: 15,
  y: 18,
  width: 30,
});

var container1 = new termkit.Container({
  parent: document,
  x: 50,
  y: 8,
  width: 30,
  height: 10,
  backgroundAttr: { bgColor: "yellow" },
});

//container1.inputDst.fill( { char: ' ' , attr: { bgColor: 'yellow' } } ) ;

var button3 = new termkit.Button({
  parent: container1,
  content: "> jack",
  value: "jack",
  x: 2,
  y: 2,
});

//container1.draw() ;

textInput2.on("submit", onSubmit);
textInput1.on("submit", onSubmit);
button3.on("submit", onSubmit);
button2.on("submit", onSubmit);
button1.on("submit", onSubmit);

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
