import fs from "fs";
import path from "path";
import termkit from "../..";
// @ts-nocheck
/*
    The Object-viewer should have its own Document Element later.
    For instance this is just a proof of concept.
*/
const term = termkit.terminal;
if (process.argv.length <= 2) {
    term.magenta("Usage is: ./%s <file-path>\n", path.basename(process.argv[1]));
    process.exit(1);
}
const filepath = process.argv[2];
async function run() {
    term.clear();
    var content = await fs.promises.readFile(filepath, "utf8");
    var object = JSON.parse(content);
    var document = term.createDocument({ palette: new termkit.Palette() });
    var inspector = new termkit.Inspector({
        parent: document,
        inspectedObject: object,
        x: 0,
        y: 0,
        width: 30,
        //width: document.outputWidth - 1 ,
        height: document.outputHeight - 1,
    });
    inspector.on("submit", onSubmit);
    function onSubmit(value) {
        console.error("Submitted: ", value);
    }
    document.giveFocusTo(inspector);
}
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
run();
