import termkit from "..";

// @ts-nocheck
const term = termkit.terminal;

term.table(
  [
    ["header #1", "header #2", "header #3"],
    ["row #1", "a much bigger cell ".repeat(10), "cell"],
    ["row #2", "cell", "a medium cell"],
    ["row #3", "with wide char 🔴", "cell 🔴🔴"],
    [
      "row #4",
      "cell\nwith\nnew\nlines",
      "^YThis ^Mis ^Ca ^Rcell ^Gwith ^Bmarkup^R^+!",
    ],
    //, ... new Array( 20 ).fill( [ 'filler row' , 'filler cell' , 'filler cell' ] )
    ...new Array(20)
      .fill(null)
      .map((e, i) => ["filler row #" + i, "filler cell", "filler cell"]),
  ],
  {
    //hasBorder: false ,
    contentHasMarkup: true,
    borderChars: "lightRounded",
    borderAttr: { color: "blue" },
    textAttr: { bgColor: "default" },
    //textAttr: { bgColor: 'black' } ,
    firstCellTextAttr: { bgColor: "blue" },
    firstRowTextAttr: { bgColor: "gray" },
    firstColumnTextAttr: { bgColor: "red" },
    //checkerEvenCellTextAttr: { bgColor: 'gray' } ,
    //evenCellTextAttr: { bgColor: 'gray' } ,
    //evenRowTextAttr: { bgColor: 'gray' } ,
    //evenColumnTextAttr: { bgColor: 'gray' } ,
    width: 60,
    //height: 20 ,
    fit: true, // Activate all expand/shrink + wordWrap
    //expandToWidth: true , shrinkToWidth: true , expandToHeight: true , shrinkToHeight: true , wordWrap: true ,
  },
);
