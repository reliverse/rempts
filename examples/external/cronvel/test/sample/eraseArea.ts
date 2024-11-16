// @ts-nocheck

var term = require("../").terminal;

term.saveCursor();
term.eraseArea(1, 1, 2, 2);
//term.eraseArea( 100 , 17 , 100 , 2 ) ;
term.restoreCursor();
