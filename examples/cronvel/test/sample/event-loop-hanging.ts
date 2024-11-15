#!/usr/bin/env node

/* jshint unused:false */
/* global describe, it, before, after */

var term = require("../lib/termkit.js").terminal;

// Looks like it's not possible to ref() again stdin, so it's a no-go:
// program will keep hanging if they have used stdin even once

/*
term.grabInput() ;

term.on( 'key' , function( key ) {
	if ( key === 'CTRL_C' ) { process.exit() ; }
} ) ;

term.grabInput( false ) ;

process.stdin.removeAllListeners( 'data' ) ;
term.stdin.removeAllListeners( 'data' ) ;
//*/

//*
function noop() {}
process.stdin.on("data", noop);

process.stdin.removeListener("data", noop);

console.log(process._getActiveHandles());
console.log(process._getActiveRequests());

//process.stdin.unref() ;
//process.stdin.ref() ;
//process.stdin.removeAllListeners( 'data' ) ;

//*/
