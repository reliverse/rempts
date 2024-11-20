// @ts-nocheck

import termkit from "..";

// @ts-nocheck
const term = termkit.terminal;

var buffer = new termkit.ScreenBuffer({ dst: term, width: 8, height: 8 });
buffer.fill({ attr: { bgColor: "cyan" } });
buffer.fill({
  attr: { bgColor: "brightMagenta" },
  region: { x: 3, y: 2, width: 3, height: 3 },
});
buffer.draw();

term("\n");
