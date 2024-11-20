// @ts-nocheck

import termkit from "..";

// @ts-nocheck
const term = termkit.terminal;
//const termios = require( 'termios' ) ;

async function test() {
  term.clear();
  term.green("Your virtual terminal is below:");

  term.grabInput({ mouse: "motion", focus: true });

  var vte = new termkit.Vte({
    width: 80,
    height: 24,
    dst: term,
    x: 5,
    y: 3,
    eventInput: term,
  });
  vte.run(process.argv[2] || "ls", process.argv.slice(3));

  term.on("key", (key) => {
    if (key === "CTRL_C") {
      term.clear();
      process.exit();
    } else if (key === "CTRL_R") {
      // Force a redraw now!
      vte.redraw();
    }
  });

  /*
	setInterval( () => {
		console.error( 'TERMIOS stdin attr:' , termios.getattr( vte.childProcess.stdin.fd ) ) ;
		//console.error( 'TERMIOS stdout attr:' , termios.getattr( vte.childProcess.stdout.fd ) ) ;
	} , 2000 ) ;
	*/
}

test();
