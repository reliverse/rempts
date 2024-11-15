#!/usr/bin/env node

const termkit = require("..");
const term = termkit.terminal;
const Promise = require("seventh");

async function test() {
  term.clear();

  var delta = true;
  var buffer = termkit.ScreenBuffer.create({ dst: term, width: 6, height: 6 });

  buffer.put({ x: 0, y: 0 }, "*abcd*");
  buffer.put({ x: 0, y: 1 }, "*efgh*");
  buffer.put({ x: 0, y: 2 }, "*ijkl*");
  buffer.put({ x: 0, y: 3 }, "*mnop*");
  buffer.put({ x: 0, y: 4 }, "*qrst*");
  buffer.put({ x: 0, y: 5 }, "*uvwx*");
  buffer.draw({ delta });

  await Promise.resolveTimeout(500);
  //buffer.copyRegion( { xmin: 0 , xmax: 2 , ymin: 0 , ymax: 2 } , { xmin: 3 , xmax: 5 , ymin: 2 , ymax: 4 } ) ;
  //buffer.copyRegion( { xmin: 0 , xmax: 2 , ymin: 0 , ymax: 2 } , { xmin: 0 , xmax: 2 , ymin: 2 , ymax: 4 } ) ;
  buffer.copyRegion({ x: 1, y: 0, width: 3, height: 3 }, { x: 1, y: 2 });
  buffer.draw({ delta });
  await Promise.resolveTimeout(500);
  buffer.draw({ delta });

  term.moveTo(1, 8, "\n");
}

test();
