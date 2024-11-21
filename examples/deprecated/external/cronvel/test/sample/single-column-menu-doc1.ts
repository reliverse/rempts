// @ts-nocheck

var term = require("terminal-kit").terminal;

term.cyan("The hall is spacious. Someone lighted few chandeliers.\n");
term.cyan("There are doorways south and west.\n");

var items = ["a. Go south", "b. Go west", "c. Go back to the street"];

term.singleColumnMenu(items, function (error, response) {
  term("\n").eraseLineAfter.green(
    "#%s selected: %s (%s,%s)\n",
    response.selectedIndex,
    response.selectedText,
    response.x,
    response.y,
  );
  process.exit();
});
