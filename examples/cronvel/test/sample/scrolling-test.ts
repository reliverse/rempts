// @ts-nocheck

const term = require("..").terminal;

//term.clear() ;

term.scrollingRegion(1, 10);
//term.scrollingRegion( 1 , term.height ) ;

/*
term.moveTo( 1 , term.height ).inverse( 'bottom line' ) ;
term.saveCursor() ;
term.scrollingRegion( 10 , term.height - 1 ) ;
term.restoreCursor() ;
//*/

var count = 0;

function print() {
  term.eraseLineAfter();
  term("#%i\n", count);
  //if ( count > 52 && count < 70 ) { term( '\n' ) ; } else { term( '#%i\n' , count ) ; }

  if (count === 30) {
    term.moveTo(1, 15);
  }
  if (count === 60) {
    term.moveTo(1, 1);
  }

  if (count++ < 100) {
    setTimeout(print, 100);
  } else {
    term.resetScrollingRegion();
  }
}

print();
