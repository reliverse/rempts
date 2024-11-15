// @ts-nocheck

/* jshint unused:false */

require("../../src/termkit").getDetectedTerminal(function (error, term) {
  term.grabInput({ mouse: "motion" });

  var items = [
    "a menu entry",
    "another menu entry",
    "still a menu entry",
    "yet another menu entry",
    "know what? a menu entry!",
    "surprise! a menu entry!",
    "dang! a menu entry!",
    "^Ydouble dang! a menu entry!",
    "OMG! too much menu entries!",
    "seriously: this is a menu entry!",
  ];

  function menu() {
    var options = {
      selectedLeftPadding: "*",
      //keyBindings: { ENTER: 'submit' , UP: 'previous' , p: 'previous' , DOWN: 'next' , n: 'next' } ,
      //x: 4 ,
      //itemMaxWidth: 20 ,
      //y: 1 ,
      //style: term.inverse ,
      //selectedStyle: term.dim.blue.bgGreen
    };

    term.gridMenu(items, options, function (error, response) {
      if (error) {
        term.red.bold("\nAn error occurs: " + error + "\n");
        terminate();
        return;
      }

      term.green(
        "\n#%s selected: %s (%s,%s)\n",
        response.selectedIndex,
        response.selectedText,
        response.x,
        response.y,
      );
      terminate();
    });
  }

  async function asyncMenu() {
    var options = {
      selectedLeftPadding: "*",
      //keyBindings: { ENTER: 'submit' , UP: 'previous' , p: 'previous' , DOWN: 'next' , n: 'next' } ,
      //x: 4 ,
      //itemMaxWidth: 20 ,
      //y: 1 ,
      //style: term.inverse ,
      //selectedStyle: term.dim.blue.bgGreen
    };

    var response = await term.gridMenu(items, options).promise;
    term.green(
      "\n#%s selected: %s (%s,%s)\n",
      response.selectedIndex,
      response.selectedText,
      response.x,
      response.y,
    );
    terminate();
  }

  function terminate() {
    term.grabInput(false);
    // Add a 100ms delay, so the terminal will be ready when the process effectively exit, preventing bad escape sequences drop
    setTimeout(function () {
      process.exit();
    }, 100);
  }

  //term.clear() ;
  term.bold.cyan("\n\nSelect one item from the menu!");

  //menu() ;
  asyncMenu();
});
