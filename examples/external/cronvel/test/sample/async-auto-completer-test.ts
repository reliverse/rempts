// @ts-nocheck

/* jshint unused:false */

var fs = require("fs");
var termkit = require("../../src/termkit");

termkit.getDetectedTerminal(function (error, term) {
  var autoCompleter = function autoCompleter(inputString, callback) {
    fs.readdir(__dirname, function (error, files) {
      //console.log( files ) ;
      callback(undefined, termkit.autoComplete(files, inputString, true));
    });
  };

  function question() {
    term("Choose a file: ");

    term.inputField(
      { autoComplete: autoCompleter, autoCompleteMenu: true },
      function (error, input) {
        if (error) {
          term.red.bold("\nAn error occurs: " + error + "\n");
          question();
        } else {
          term.green("\nYour file is '%s'\n", input);
          terminate();
        }
      },
    );
  }

  function terminate() {
    term.grabInput(false);
    // Add a 100ms delay, so the terminal will be ready when the process effectively exit, preventing bad escape sequences drop
    setTimeout(function () {
      process.exit();
    }, 100);
  }

  term.bold.cyan(
    "Async auto-completer, type something and hit the ENTER key...\n",
  );
  question();
});
