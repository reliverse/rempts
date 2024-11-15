#!/usr/bin/env node

const termkit = require("..");
const term = termkit.terminal;
const Promise = require("seventh");

async function test() {
  term.clear();

  var delta = true,
    scroll = -1,
    scrollingYmin = 0,
    scrollingYmax = 3;

  var buffer = termkit.ScreenBuffer.create({ dst: term, width: 4, height: 4 }); //.clear() ;

  buffer.put({ x: 0, y: 0 }, "abcd");
  buffer.put({ x: 0, y: 1 }, "efgh");
  buffer.put({ x: 0, y: 2 }, "ijkl");
  buffer.put({ x: 0, y: 3 }, "mnop");
  buffer.draw({ delta });

  await Promise.resolveTimeout(500);
  buffer.vScroll(scroll, undefined, scrollingYmin, scrollingYmax, true);
  buffer.put({ x: 0, y: scrollingYmax }, "qrst");
  buffer.draw({ delta });
  await Promise.resolveTimeout(500);
  buffer.vScroll(scroll, undefined, scrollingYmin, scrollingYmax, true);
  buffer.put({ x: 0, y: scrollingYmax }, "uvwx");
  buffer.draw({ delta });
  await Promise.resolveTimeout(500);
  buffer.draw({ delta });

  term.moveTo(1, 8, "\n");
}

test();
