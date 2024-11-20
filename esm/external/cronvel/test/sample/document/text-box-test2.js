import termkit from "../..";
// @ts-nocheck
const term = termkit.terminal;
term.clear();
var document = term.createDocument({
    palette: new termkit.Palette(),
    //	backgroundAttr: { bgColor: 'magenta' , dim: true } ,
});
var textBox = new termkit.TextBox({
    parent: document,
    //content: '^#^MHe^:^bll^#^Ro!' ,
    content: "^[fg:*royal-blue]royal!",
    //content: 'royal!' ,
    contentHasMarkup: true,
    //attr: { color: 'magenta' } ,
    //attr: { color: 241 } ,
    //attr: { color: '*royal-blue' } ,
    //hidden: true ,
    scrollable: true,
    vScrollBar: true,
    x: 10,
    y: 2,
    width: 30,
    height: 10,
});
term.on("key", function (key) {
    switch (key) {
        case "CTRL_C":
            term.grabInput(false);
            term.hideCursor(false);
            term.styleReset();
            term.clear();
            process.exit();
            break;
        case "ENTER":
        case "KP_ENTER":
            textBox.appendContent("\n");
            break;
        case "BACKSPACE":
        case "DELETE":
            textBox.setContent(textBox.getContent().split("\n").slice(0, -1).join("\n"));
            break;
        case "PAGE_DOWN":
        case "PAGE_UP":
        case "CTRL_O":
            break;
        case "CTRL_P":
            textBox.prependContent("^RR^YA^GI^CN^BB^MO^MW");
            break;
        case "CTRL_R":
            textBox.appendContent("^RR^YA^GI^CN^BB^MO^MW");
            break;
        default:
            textBox.appendContent(key);
            break;
    }
});
