// @ts-nocheck

/* jshint unused:false */

//console.error( "\n\n\n\n\n\n\n\n" ) ;
var termkit = require("../../../src/termkit");
var term = termkit.terminal;

term.clear();

var document = term.createDocument({
  //	backgroundAttr: { bgColor: 'magenta' , dim: true } ,
});

var A = new termkit.Button({
  parent: document,
  content: "<A>",
  value: "A",
  x: 0,
  y: 0,
});

new termkit.Button({
  parent: A,
  content: "<1>",
  value: "1",
  x: 10,
  y: 0,
});

new termkit.Button({
  parent: A,
  content: "<2>",
  value: "2",
  x: 10,
  y: 2,
});

new termkit.Button({
  parent: A,
  content: "<3>",
  value: "3",
  x: 10,
  y: 4,
});

var B = new termkit.Button({
  parent: document,
  content: "<B>",
  value: "B",
  x: 0,
  y: 6,
});

var sub = new termkit.Button({
  parent: B,
  content: "<1>",
  value: "1",
  x: 10,
  y: 6,
});

new termkit.Button({
  parent: sub,
  content: "<...>",
  value: "...",
  x: 20,
  y: 6,
});

new termkit.Button({
  parent: sub,
  content: "<...>",
  value: "...",
  x: 30,
  y: 6,
});

new termkit.Button({
  parent: sub,
  content: "<...>",
  value: "...",
  x: 40,
  y: 6,
});

new termkit.Button({
  parent: B,
  content: "<2>",
  value: "2",
  x: 10,
  y: 8,
});

var sub2 = new termkit.Button({
  parent: B,
  content: "<3>",
  value: "3",
  x: 10,
  y: 10,
});

new termkit.Button({
  parent: sub2,
  content: "<...>",
  value: "...",
  x: 20,
  y: 10,
});

new termkit.Button({
  parent: sub2,
  content: "<...>",
  value: "...",
  x: 30,
  y: 10,
});

new termkit.Button({
  parent: sub2,
  content: "<...>",
  value: "...",
  x: 40,
  y: 10,
});

var C = new termkit.Button({
  parent: document,
  content: "<C>",
  value: "C",
  x: 0,
  y: 12,
});

new termkit.Button({
  parent: C,
  content: "<1>",
  value: "1",
  x: 10,
  y: 12,
});

new termkit.Button({
  parent: C,
  content: "<2>",
  value: "2",
  x: 10,
  y: 14,
});

var sub3 = new termkit.Button({
  parent: C,
  content: "<3>",
  value: "3",
  x: 10,
  y: 16,
});

new termkit.Button({
  parent: sub3,
  content: "<...>",
  value: "...",
  x: 20,
  y: 16,
});

new termkit.Button({
  parent: sub3,
  content: "<...>",
  value: "...",
  x: 30,
  y: 16,
});

new termkit.Button({
  parent: sub3,
  content: "<...>",
  value: "...",
  x: 40,
  y: 16,
});

term.on("key", function (key) {
  switch (key) {
    case "CTRL_C":
      term.grabInput(false);
      term.hideCursor(false);
      term.styleReset();
      term.clear();
      process.exit();
      break;
  }
});
