import termkit from "../..";
// @ts-nocheck
const term = termkit.terminal;
term.clear();
var document = term.createDocument({
    palette: new termkit.Palette(),
    //	backgroundAttr: { bgColor: 'magenta' , dim: true } ,
});
var bar = new termkit.Bar({
    parent: document,
    x: 0,
    y: 2,
    width: 30,
    //barChars: 'classicWithArrow' ,
    //barChars: 'classicWithHalf' ,
    barChars: "solid",
    content: "Downloading...",
    value: 0,
});
var contents = [
    "Downloading...",
    "Decrunching data...",
    "Data mining...",
    "Generating the data tree...",
    "Parsing metadata...",
];
setInterval(() => bar.setValue(bar.getValue() + 0.01), 100);
setInterval(() => bar.setContent(contents[Math.floor(Math.random() * contents.length)]), 1000);
term.on("key", function (key) {
    switch (key) {
        case "CTRL_C":
            term.grabInput(false);
            term.hideCursor(false);
            term.styleReset();
            //term.clear() ;
            term("\n");
            process.exit();
            break;
    }
});
