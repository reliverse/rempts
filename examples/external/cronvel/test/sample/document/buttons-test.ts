import termkit from "../..";

// @ts-nocheck
const term = termkit.terminal;

term.clear();

var document = term.createDocument({
  palette: new termkit.Palette(),
  //	backgroundAttr: { bgColor: 'magenta' , dim: true } ,
});

var button1 = new termkit.Button({
  parent: document,
  //content: '> button#1' ,
  content: "> ^[fg:*royal-blue]button#1",
  //content: '> ^[fg:*coquelicot]button#1' ,
  focusAttr: { bgColor: "@light-gray" },
  contentHasMarkup: true,
  value: "b1",
  x: 10,
  y: 10,
});

var button2 = new termkit.Button({
  parent: document,
  content: "> button#2",
  blurContent: "> button#2",
  focusContent: "> BUTTON#2",
  value: "b2",
  x: 13,
  y: 12,
  keyBindings: {
    ENTER: "submit",
    CTRL_UP: "submit",
    CTRL_DOWN: "submit",
  },
  actionKeyBindings: {
    CTRL_UP: "up",
    CTRL_DOWN: "down",
    click: "left-click",
    middleClick: "middle-click",
    rightClick: "right-click",
  },
});

var toggleButton1 = new termkit.ToggleButton({
  parent: document,
  content: "toggle#1",
  turnedOnContent: "TOGGLE#1",
  //turnedOnLeftPadding: '☑ ' , turnedOffLeftPadding: '☐ ' ,
  turnedOnLeftPadding: "✓ ",
  turnedOffLeftPadding: "✗ ",
  //value: true ,
  x: 2,
  y: 2,
});

var toggleButton2 = new termkit.ToggleButton({
  parent: document,
  content: "toggle#2",
  key: "myKey",
  //turnedOnLeftPadding: '☑ ' , turnedOffLeftPadding: '☐ ' ,
  //turnedOnLeftPadding: '✓ ' , turnedOffLeftPadding: '✗ ' ,
  leftPadding: "> ",
  //value: true ,
  x: 5,
  y: 5,
});

//container1.draw() ;

button1.on("submit", onSubmit);
button1.on("blinked", onBlinked);
button2.on("submit", onSubmit);
button2.on("blinked", onBlinked);
toggleButton1.on("toggle", onToggle);
toggleButton1.on("submit", onSubmit);
toggleButton2.on("toggle", onToggle);
toggleButton2.on("submit", onSubmit);

var counter = 0;

function onSubmit(value, action) {
  term.saveCursor();
  term.moveTo.styleReset.eraseLine(
    1,
    22,
    "Submitted #%i: %J , action: %J\n",
    counter++,
    value,
    action,
  );
  term.restoreCursor();
}

function onBlinked(value, action) {
  term.saveCursor();
  term.moveTo.styleReset.eraseLine(
    1,
    22,
    "Blinked #%i: %J , action: %J\n",
    counter++,
    value,
    action,
  );
  term.restoreCursor();
}

function onToggle(value) {
  term.saveCursor();
  term.moveTo.styleReset.eraseLine(
    1,
    22,
    "Toggled #%i: %J\n",
    counter++,
    value,
  );
  //if ( value ) { button1.hide() ; } else { button1.show() ; }
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
