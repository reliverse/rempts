import termkit from "../../../src/termkit.js";
// @ts-nocheck
var term = termkit.terminal;
term.clear();
var document = term.createDocument();
var inlineMenu = new termkit.InlineMenu({
    parent: document,
    x: 0,
    y: 10,
    //*
    prompt: {
        textAttr: { bgColor: "blue" },
        content: "^WReplace? ",
        contentHasMarkup: true,
    },
    //*/
    width: 30,
    items: [
        {
            content: "(Y)es",
            value: "yes",
            hotkey: "y",
        },
        {
            content: "(N)o",
            value: "no",
            hotkey: "n",
        },
        {
            content: "(R)est",
            value: "rest",
            hotkey: "r",
        },
        {
            content: "(A)bort (ESC)",
            value: "abort",
            hotkey: ["a", "ESCAPE"],
        },
    ],
});
function onSubmit(buttonValue) {
    //console.error( 'Submitted: ' , value ) ;
    term.saveCursor();
    term.moveTo.styleReset.eraseLine(1, 22, "Submitted: %s\n", buttonValue);
    term.restoreCursor();
}
function onItemFocus(buttonValue, focus) {
    //console.error( 'Submitted: ' , value ) ;
    term.saveCursor();
    term.moveTo.styleReset.eraseLine(1, 24, "Item focus: %s %s\n", buttonValue, focus);
    term.restoreCursor();
}
inlineMenu.on("submit", onSubmit);
inlineMenu.on("itemFocus", onItemFocus);
document.giveFocusTo(inlineMenu);
term.on("key", (key) => {
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
