import terminal from "..";

// @ts-nocheck
terminal.getDetectedTerminal((error, term) => {
  var i;

  //term = terminal.terminal ;

  // First set black as the background color?
  //term.bgBlack() ;
  term(
    "This is the style test, each word should be styled accordingly with what it says it is.\n\n",
  );

  // Test foreground colors

  term.bold("=== Foreground colors ===\n\n");

  term.white("white ").brightWhite("brightWhite")("\n");
  term.black("black ").brightBlack("brightBlack")("\n");
  term.red("red ").brightRed("brightRed")("\n");
  term.yellow("yellow ").brightYellow("brightYellow")("\n");
  term.green("green ").brightGreen("brightGreen")("\n");
  term.cyan("cyan ").brightCyan("brightCyan")("\n");
  term.blue("blue ").brightBlue("brightBlue")("\n");
  term.magenta("magenta ").brightMagenta("brightMagenta")("\n");

  // Check the color() function
  for (i = 0; i < 16; i++) {
    term.color(i, "*");
  }
  term("\n");

  // Test background colors

  term.bold("\n=== Background colors ===\n\n");

  term.bgWhite("bgWhite ").bgBrightWhite("bgBrightWhite")("\n");
  term.bgBlack("bgBlack ").bgBrightBlack("bgBrightBlack")("\n");
  term.bgRed("bgRed ").bgBrightRed("bgBrightRed")("\n");
  term.bgYellow("bgYellow ").bgBrightYellow("bgBrightYellow")("\n");
  term.bgGreen("bgGreen ").bgBrightGreen("bgBrightGreen")("\n");
  term.bgCyan("bgCyan ").bgBrightCyan("bgBrightCyan")("\n");
  term.bgBlue("bgBlue ").bgBrightBlue("bgBrightBlue")("\n");
  term.bgMagenta("bgMagenta ").bgBrightMagenta("bgBrightMagenta")("\n");

  // Check the bgColor() function
  for (i = 0; i < 16; i++) {
    term.bgColor(i, " ");
  }
  term("\n");

  // Test styles

  term.bold("\n=== Styles ===\n\n");

  term.bold("bold")("\n");
  term.dim("dim")("\n");
  term.italic("italic")("\n");
  term.underline("underline")("\n");
  term.blink("blink")("\n");
  term.inverse("inverse")("\n");
  term.hidden("hidden")(" <-- hidden\n");
  term.strike("strike")("\n");

  // Test mixed styles

  term.bold("\n=== Mixed styles ===\n\n");

  term.bold.red("bold-red")("\n");
  term.dim.red("dim-red")("\n");
  term.bold.dim.red("bold-dim-red")("\n");
  term.cyan.bgRed("cyan-on-red")("\n");
  term.bold.cyan.bgRed("bold-cyan-on-red")("\n");
  term.bold.italic.underline("bold-italic-underline")("\n");

  // Test object2attr

  var attr;
  attr = term.object2attr({
    color: "blue",
    bgColor: "red",
    underline: true,
    italic: true,
  });
  term(attr);
  term("\nAttr test");
  attr = term.object2attr({ color: "blue" });
  term(attr);
  term("\nAttr test2");

  // Reset before exiting...

  term.styleReset();
  term("\n");
  term("Reset...\n");
});
