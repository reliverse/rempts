// @ts-nocheck
import termkit from "../../../src/termkit.js";
const term = termkit.terminal;
term.clear();
var document = term.createDocument();
var inlineInput = new termkit.InlineInput({
    parent: document,
    textAttr: { bgColor: "blue" },
    voidAttr: { bgColor: "blue" },
    placeholder: "Your name here",
    x: 0,
    y: 10,
    //*
    prompt: {
        textAttr: { bgColor: "blue" },
        content: "^R^+a big ^Gbig ^Ybig ^Rprompt>^:^B ",
        contentHasMarkup: true,
    },
    //*/
    //firstLineRightShift: 8 ,
    //width: 36 ,
    width: 100,
    cancelable: true,
    value: "toto",
    history: ["Bob", "Bill", "Jack", "Some entry string"],
    autoComplete: [
        "Barack Obama",
        "George W. Bush",
        "Bill Clinton",
        "George Bush",
        "Ronald W. Reagan",
        "Jimmy Carter",
        "Gerald Ford",
        "Richard Nixon",
        "Lyndon Johnson",
        "John F. Kennedy",
        "Dwight Eisenhower",
        "Harry Truman",
        "Franklin Roosevelt",
    ],
    autoCompleteMenu: true,
    autoCompleteHint: true,
    autoCompleteHintMinInput: 5,
});
inlineInput.on("submit", onSubmit);
function onSubmit(value) {
    //console.error( 'Submitted: ' , value ) ;
    term.saveCursor();
    term.moveTo.styleReset.eraseLine(1, 22, "Submitted: '%s'\n", value);
    term.restoreCursor();
}
inlineInput.on("cancel", onCancel);
function onCancel() {
    //console.error( 'Submitted: ' , value ) ;
    term.saveCursor();
    term.moveTo.styleReset.eraseLine(1, 22, "Canceled\n");
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
