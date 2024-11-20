import fs from "fs";
import tty from "tty";

// @ts-nocheck

//var exec = require( 'child_process' ).exec ;
//var spawn = require( 'child_process' ).spawn ;
var execSync = require("child_process").execSync;
var tty_ = {};
var cachedGetPath;

/*
	getPath( [stdin] )
		* stdin: a stream that is the current STDIN of the terminal

	Returns an object, where:
		* ttyPath: the path of the tty
		* ttyIndex: the index number of the tty, only if it is a /dev/tty*, /dev/pts/* return null
*/
tty_.getPath = function getPath(stdin) {
  var cacheIt, result, ttyPath, ttyIndex, matches;

  // Manage arguments
  if (!stdin) {
    // getPath() does not work as soon as process.stdin getter is triggered (since node v4)
    // So 0 should be used instead of process.stdin
    stdin = 0;
    //stdin = process.stdin ;
  }

  if (stdin === 0 || stdin === process.stdin) {
    if (cachedGetPath) {
      return cachedGetPath;
    }
    cacheIt = true;
  }

  try {
    // if no stdio are passed, the command will report 'not a TTY'
    ttyPath = execSync("tty", { stdio: [stdin, null, null] }).toString();
  } catch (error) {
    ttyPath = error.stdout.toString();
  }

  ttyPath = ttyPath.trim();

  //console.log( 'TTY path:' , ttyPath ) ;

  matches = ttyPath.match(/\/dev\/tty([0-9]*)/);

  ttyIndex = matches ? matches[1] || null : null;

  result = {
    path: ttyPath,
    index: ttyIndex,
  };

  if (cacheIt) {
    cachedGetPath = result;
  }

  return result;
};

/*
	getInput()

	Open a TTY input file descriptor and transform it into a regular node TTY input stream.
	It returns the TTY input `Stream` use instead of process.stdin

	This code was borrowed from the 'ttys' module by Nathan Rajlich.
*/
tty_.getInput = function getInput() {
  var inputFd, input;

  inputFd = fs.openSync("/dev/tty", "r");
  if (!tty.isatty(inputFd)) {
    throw new Error("Input file descriptor is not a TTY.");
  }
  input = new tty.ReadStream(inputFd);
  input._type = "tty";

  return input;
};

/*
	getOutput()

	Open a TTY output file descriptor and transform it into a regular node TTY output stream.
	It returns the TTY output `Stream` use instead of process.stdin

	This code was borrowed from the 'ttys' module by Nathan Rajlich.
*/
tty_.getOutput = function getOutput() {
  var outputFd, output;

  outputFd = fs.openSync("/dev/tty", "w");
  if (!tty.isatty(outputFd)) {
    throw new Error("Output file descriptor is not a TTY.");
  }
  output = new tty.WriteStream(outputFd);
  output._type = "tty";

  // Hack to have the stdout stream not keep the event loop alive.
  // See: https://github.com/joyent/node/issues/1726
  // XXX: remove/fix this once src/node does something different as well.
  // @cronvel: that doesn't work much either...
  if (output._handle && output._handle.unref) {
    output._handle.unref();
  }

  // Update the "columns" and "rows" properties on the stdout stream
  // whenever the console window gets resized.
  if (output._refreshSize) {
    process.on("SIGWINCH", () => {
      output._refreshSize();
    });
  }

  return output;
};

export default tty_;
