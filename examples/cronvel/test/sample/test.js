#!/usr/bin/env node

const term = require("..").terminal;
//const term = require( '..' ).realTerminal ;

//*
term.clear();
term.moveTo(1, 1);
term.bgGreen("abcde\nfghij\nklmno\npqrst\nuvwxy\n");
term.moveTo(3, 3);
//term.bgRed.deleteLine( 1 , '*' ) ;
//term( '\x08\x08\x08\x08\x08\x08\x08*' ) ;
//term( '\x7f\x7f' ) ;
term("\x1b[2X", "*");
//term.bgRed.delete() ;
//term.bgRed.insertLine( 2 ) ;
//term.inverse()( '!\r' ) ;
//term.bgRed.eraseDisplayAbove() ;
//term( '!' ) ;
term.moveTo(1, 8);
process.exit();
//*/

term("term.isTTY: %I\n", term.isTTY);
term("a\n")("true\n")("warrior\n");
term(term.esc.blue.on + "Blue" + term.esc.blue.off);
term("normal");
term.red("Red");
term(" normal");
term.red("Red");
term(" normal");
term.bold.underline.red("Bold-underline-red");
term.green.strike("Green-strike");
term.magenta.italic("Magenta-italic");
term.blink("Blink");
term(term.esc.blue.on + "Blue");
term.styleReset();
term("normal\n");
term("The terminal size is %dx%d", term.width, term.height);
term.saveCursor();

term.windowTitle("wonderful title");

term.up(4).red("up ").cyan(4);

term.moveTo(1, 1).blue("origin");
term.move(0, 0).bold.cyan("(0;0)");
term.move(5, 5).bold.brightYellow("(+5;+5)");
term.move(-2, -3);
term.bold.brightGreen("(-2;-3)");
term.moveTo.cyan(1, 2, "My name is %s, I'm %d.\n", "Jack", 32);
term.restoreCursor();

var toto = term.str.red("toto");
console.log("\nconsole.log(toto):", toto);

term.bgColor("red", "some red?");
term("\n");
