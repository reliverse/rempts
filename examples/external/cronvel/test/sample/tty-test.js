import termkit from "../../src/termkit.js";
// @ts-nocheck
/* jshint unused:false */
/* global describe, it, before, after */
var term = termkit.terminal;
var realTerm;
console.log("tty.getPath():", termkit.tty.getPath());
realTerm = termkit.realTerminal;
term.red("STDOUT! size: %ix%i\n", term.width, term.height);
realTerm.red("TTY OUT! size: %ix%i\n", term.width, term.height);
/*
term.blue( "Enter your name: " ) ;
term.inputField( function( error , name ) {
    term.green( "\nHello %s!\n" , name ) ;
    process.exit() ;
} ) ;
//*/
//*
realTerm.blue("Enter your name: ");
realTerm.inputField(function (error, name) {
    realTerm.green("\nHello %s!\n", name);
    process.exit();
});
//*/
