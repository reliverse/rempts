// @ts-nocheck

var term = require("terminal-kit").terminal;

term.clear();
term.cyan("Where will you go?\n");

var items = ["a. Go north", "b. Go south", "c. Go east", "d. Go west"];

var menu = term.singleColumnMenu(items, { continueOnSubmit: true });

menu.on("submit", (data) => {
  term.saveCursor();
  term.moveTo(1, term.height - 1, "Submit: %s", data.selectedText);
  term.restoreCursor();
});

term.on("key", (key) => {
  if (key === "CTRL_C") {
    term.grabInput(false);
    process.exit();
  }
});
