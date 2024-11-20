import termkit from "../..";
// @ts-nocheck
const term = termkit.terminal;
term.clear();
var document = term.createDocument();
var columnMenuMixed = new termkit.ColumnMenuMixed({
    parent: document,
    x: 0,
    y: 5,
    width: 20,
    pageMaxHeight: 5,
    leftPadding: "  ",
    turnedOnLeftPadding: "^G✓ ",
    turnedOffLeftPadding: "^R✗ ",
    disabledLeftPadding: "  ",
    paddingHasMarkup: true,
    multiLineItems: true,
    value: {
        light: true,
    },
    items: [
        {
            content: "normal #1",
            key: "normal #1",
        },
        {
            content: "light",
            type: "toggle",
            key: "light",
        },
        {
            content: "switcher",
            type: "toggle",
            key: "switcher",
        },
        {
            content: "normal #2",
            value: "normal #2",
        },
        {
            content: "Disabled button",
            disabled: true,
            key: "disabled",
        },
        {
            content: "more #1",
            value: "more #1",
        },
        {
            content: "more #2",
            value: "more #2",
        },
    ],
});
var submitCount = 0, toggleCount = 0;
function onSubmit(buttonValue, action) {
    term.saveCursor();
    term.moveTo.styleReset.eraseLine(1, 22, "Submitted #%i: %J %J\n", submitCount++, buttonValue, action);
    term.restoreCursor();
}
function onItemToggle(key, toggle) {
    //console.error( 'Submitted: ' , value ) ;
    term.saveCursor();
    term.moveTo.styleReset.eraseLine(1, 24, "Toggled #%i: %s %s\n", toggleCount++, key, toggle);
    term.restoreCursor();
}
columnMenuMixed.on("submit", onSubmit);
columnMenuMixed.on("itemToggle", onItemToggle);
document.giveFocusTo(columnMenuMixed);
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
