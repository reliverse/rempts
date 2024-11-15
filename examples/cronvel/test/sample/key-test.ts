// @ts-nocheck

const term = require("..").terminal;

function terminate() {
  term.brightBlack("About to exit...\n");
  term.grabInput(false);
  term.applicationKeypad(false);

  // Add a 100ms delay, so the terminal will be ready when the process effectively exit, preventing bad escape sequences drop
  setTimeout(() => {
    process.exit();
  }, 100);
}

term.bold.cyan(
  "Key test, hit anything on the keyboard to see how it is detected...\n",
);
term.green("Hit CTRL-C to quit.\n\n");

// Set Application Keypad mode, but it does not works on every box (sometime numlock should be off for this to work)
var applicationKeypad = true;
term.applicationKeypad(applicationKeypad);

//term.keyboardModifier() ;

term.grabInput();
//term.grabInput( { mouse: 'motion' , focus: true } ) ;

term.on("key", (name, matches, data) => {
  console.log(
    "Key:",
    name,
    ", length:",
    name.length,
    ", all matches:",
    matches,
    ", is character:",
    data.isCharacter,
    ", codepoint:",
    data.codepoint ? data.codepoint.toString(16) : "",
    ", meta:",
    data.meta,
    ", buffer:",
    Buffer.isBuffer(data.code) ? data.code : data.code.toString(16),
  );

  switch (name) {
    case "CTRL_C":
      term.green("CTRL-C received...\n");
      terminate();
      break;

    case "CTRL_ALT_K":
      applicationKeypad = !applicationKeypad;
      term.applicationKeypad(applicationKeypad);
      term.green(
        "CTRL-ALT-K received, switching application keypad mode %s...\n",
        applicationKeypad ? "on" : "off",
      );
      break;

    case "CTRL_K":
      //term.setMetaKeyPrefix( 'META' ) ;
      term.setMetaKeyPrefix("META", "CTRL");
      term.green("CTRL-K received, set meta prefix...\n");
      break;
  }
});
