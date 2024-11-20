import termkit from "../../../src/termkit.js";
// @ts-nocheck
const term = termkit.terminal;
term.clear();
var document = term.createDocument();
var labeledInput;
/*
labeledInput = new termkit.LabeledInput( {
    parent: document ,
    label: 'name: ' ,
    x: 5 ,
    y: 10 ,
    width: 30 ,
} ) ;
//*/
//*
labeledInput = new termkit.LabeledInput({
    parent: document,
    label: "name: ",
    x: 5,
    y: 10,
    width: 30,
    type: "select",
    value: "done",
    items: [
        { content: "Todo", value: "todo" },
        { content: "In progress", value: "in-progress" },
        { content: "Done", value: "done" },
    ],
});
//*/
labeledInput.on("submit", onSubmit);
function onSubmit(value) {
    //console.error( 'Submitted: ' , value ) ;
    term.saveCursor();
    term.moveTo.styleReset.eraseLine(1, 22, "Submitted: %s\n", value);
    term.restoreCursor();
}
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
