// @ts-nocheck

import termkit from "..";
import Promise from "seventh";

// @ts-nocheck
const term = termkit.terminal;

async function test() {
  term.clear();

  var sbuf = new termkit.ScreenBuffer({
    dst: term,
    y: 5,
    height: 5,
    width: 15,
  });
  var tbuf = new termkit.TextBuffer({ dst: sbuf, firstLineRightShift: 8 });
  tbuf.setDefaultAttr({ bgColor: "blue" });
  tbuf.setVoidAttr({ bgColor: "blue" });
  //tbuf.setText( "First line.\nSecond line.\nThird line." ) ;
  tbuf.setText("First line.\n^[red]^[bg:white]Second line.\nThird line.", true);
  //tbuf.setText( "First line.\n\x1b[31;46;1mSecond line.\nThird line." , 'ansi' ) ;
  //tbuf.setText( "First line.\n\x1b[31;46;1mSecond line.\nThird line." , 'ansi' ) ;
  //tbuf.setText( "First line.\n\x1b[31;46;1mSecond line.\nThird line." , 'legacyAnsi' ) ;

  tbuf.draw();
  sbuf.draw();

  //await Promise.resolveTimeout( 1000 ) ;

  term.moveTo(1, 30);
}

test();
