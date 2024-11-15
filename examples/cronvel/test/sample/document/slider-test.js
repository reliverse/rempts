#!/usr/bin/env node

const termkit = require("../..");
const term = termkit.terminal;

term.clear();

var document = term.createDocument({
  palette: new termkit.Palette(),
  //	backgroundAttr: { bgColor: 'magenta' , dim: true } ,
});

var vSlider = new termkit.Slider({
  parent: document,
  x: 10,
  y: 5,
  height: 10,
  isVertical: true,
});

vSlider.on("slideStep", (d) => {
  vSlider.setSlideRate(vSlider.getSlideRate() + 0.1 * d);
});

var hSlider = new termkit.Slider({
  parent: document,
  x: 2,
  y: 2,
  width: 30,
});

hSlider.on("slideStep", (d) => {
  hSlider.setSlideRate(hSlider.getSlideRate() + 0.1 * d);
});

document.focusNext();

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
