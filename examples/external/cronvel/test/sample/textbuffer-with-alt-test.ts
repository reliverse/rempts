import termkit from "..";
import Promise from "seventh";

// @ts-nocheck
const term = termkit.terminal;

async function test() {
  term.clear();

  var sbuf = new termkit.ScreenBuffer({ dst: term });

  var tbufHint = new termkit.TextBuffer();
  tbufHint.setText("Barack Obama\nNewLine", false, {
    color: "gray",
    italic: true,
  });

  var tbuf = new termkit.TextBuffer({ dst: sbuf, y: 10 });
  //tbuf.setVoidAttr( { transparency: true } ) ;
  tbuf.setVoidTextBuffer(tbufHint);
  tbuf.setText("Barack");

  tbuf.draw();
  sbuf.draw();

  await Promise.resolveTimeout(1000);

  term.moveTo(1, 30);
}

test();
