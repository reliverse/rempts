// @ts-nocheck

import termkit from "..";

// @ts-nocheck
const term = termkit.terminal;

term.table(
  [
    ["header #1", "header #2", "header #3"],
    [
      "row #1",
      "a much bigger cell, a much bigger cell, a much bigger cell... ",
      "cell",
    ],
    ["row #2", "cell", "a medium cell"],
    ["row #3", "cell", "cell"],
    [
      "row #4",
      "cell\nwith\nnew\nlines",
      "^YThis ^Mis ^Ca ^Rcell ^Gwith ^Bmarkup^R^+!",
    ],
  ],
  {
    hasBorder: false,
    contentHasMarkup: true,
    textAttr: { bgColor: "default" },
    firstCellTextAttr: { bgColor: "blue" },
    firstRowTextAttr: { bgColor: "yellow" },
    firstColumnTextAttr: { bgColor: "red" },
    checkerEvenCellTextAttr: { bgColor: "gray" },
    width: 60,
    fit: true, // Activate all expand/shrink + wordWrap
  },
);
