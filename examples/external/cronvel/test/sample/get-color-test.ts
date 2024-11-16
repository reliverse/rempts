// @ts-nocheck

require("../../src/termkit").getDetectedTerminal(function (error, term) {
  var terminating = false;

  function terminate() {
    terminating = true;
    term.brightBlack("About to exit...\n");
    term.grabInput(false);

    // Add a 100ms delay, so the terminal will be ready when the process effectively exit, preventing bad escape sequences drop
    setTimeout(function () {
      process.exit();
    }, 250);
  }

  var i = 0;

  function getColors() {
    if (terminating) {
      return;
    }

    term.getColor(i, (error, reg) => {
      if (error) {
        term.red(error.toString() + "\n");
      } else {
        term("#%u -- R:%u G:%u B:%u\n", reg.register, reg.r, reg.g, reg.b);
      }

      if (terminating) {
        return;
      }

      if (i < 15) {
        i++;
        getColors();
      } else {
        terminate();
      }
    });
  }

  term.on("key", function (name, matches, data) {
    console.log(
      "'key' event:",
      name,
      matches,
      Buffer.isBuffer(data.code) ? data.code : data.code.toString(16),
      data.codepoint ? data.codepoint.toString(16) : "",
    );

    if (matches.indexOf("CTRL_C") >= 0) {
      term.green("CTRL-C received...\n");
      terminate();
    }

    if (matches.indexOf("CTRL_R") >= 0) {
      term.green("CTRL-R received... asking terminal some information...\n");
      term.requestCursorLocation();
      term.requestScreenSize();
    }
  });

  //*
  term.on("terminal", function (name, data) {
    console.log("'terminal' event:", name, data);
  });

  term.on("mouse", function (name, data) {
    console.log("'mouse' event:", name, data);
  });

  term.on("unknown", function (buffer) {
    console.log("'unknown' event, buffer:", buffer);
  });
  //*/

  getColors();
  setTimeout(terminate, 2000);
});
