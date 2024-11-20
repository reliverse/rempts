import termkit from "../..";

// @ts-nocheck
const term = termkit.terminal;

term.clear();
//term.moveTo.brightMagenta.bold.italic( 1 , 1 , "Responsive terminal layout! Try resizing your terminal! ;)" ) ;

var document = term.createDocument();

var text = new termkit.Text({
  parent: document,
  content: "Responsive terminal layout! Try resizing your terminal! ;)",
  attr: {
    color: "brightMagenta",
    bold: true,
    italic: true,
  },
});

var layout = new termkit.Layout({
  parent: document,
  boxChars: "double",
  layout: {
    id: "main",
    y: 3,
    //widthPercent: 60 ,
    widthPercent: 100,
    //heightPercent: 60 ,
    heightPercent: 80,
    rows: [
      {
        id: "1st row",
        heightPercent: 75,
        columns: [
          { id: "percent", widthPercent: 100 / 3 },
          { id: "auto" },
          { id: "fixed", width: 30 },
        ],
      },
      {
        id: "2nd row",
        columns: [{ id: "fixed2", width: 20 }, { id: "auto2" }],
      },
    ],
  },
});

term.hideCursor();
//layout.draw() ;
//layout.setAutoResize( true ) ;

new termkit.Text({
  parent: document.elements.percent,
  content: "Percent sized box",
  attr: { color: "red" },
});

new termkit.Text({
  parent: document.elements.auto,
  content: "Auto sized box",
  attr: { color: "green", italic: true },
});

new termkit.Text({
  parent: document.elements.auto2,
  content: "Auto sized box (2)",
  attr: { color: "yellow", italic: true },
});

new termkit.Text({
  parent: document.elements.fixed,
  content: "Fixed size box",
  attr: { color: "cyan", bold: true },
});

new termkit.Text({
  parent: document.elements.fixed2,
  content: "Fixed size box (2)",
  attr: { color: "magenta", bold: true },
});

term.on("key", function (key) {
  if (key === "CTRL_C") {
    term.grabInput(false);
    term.hideCursor(false);
    term.moveTo(1, term.height)("\n");
    //term.clear() ;
    process.exit();
  }
});

//term.moveTo( 1 , term.height ) ;
