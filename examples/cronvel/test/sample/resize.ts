#!/usr/bin/env node

//process.stdout.on( 'resize' , () => { console.log( "process.stdout 'resize'" ) ; } ) ;
//process.on( 'SIGWINCH' , () => { console.log( "process 'SIGWINCH'" ) ; } ) ;
//setTimeout( () => console.log( 'exit' ) , 10000 ) ;
//return ;

var term = require("..").terminal;
//require( '../lib/termkit.js' ).getDetectedTerminal( ( error , term ) => {

term.stdout.on("resize", () => {
  console.log("term.stdout 'resize'");
});

function terminate() {
  term.brightBlack("About to exit...\n");
  term.grabInput(false);
  term.fullscreen(false);

  // Add a 100ms delay, so the terminal will be ready when the process effectively exit, preventing bad escape sequences drop
  setTimeout(function () {
    process.exit();
  }, 100);
}

term.fullscreen(true);
term.bold.cyan("Resize test, try resizing your terminal...\n");

term.grabInput({ mouse: "button", focus: true });

term.on("key", (name, matches, data) => {
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

term.on("resize", (width, height) => {
  console.log("'resize' event, new width and height:", width, height);
});

//} ) ;
