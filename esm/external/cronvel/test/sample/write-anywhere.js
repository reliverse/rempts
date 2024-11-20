import termkit from "../../src/termkit.js";
// @ts-nocheck
/* jshint unused:false */
var term = termkit.terminal;
term.grabInput({ mouse: "button" });
term.on("key", function (key, matches, data) {
    switch (key) {
        case "UP":
            term.up(1);
            break;
        case "DOWN":
            term.down(1);
            break;
        case "LEFT":
            term.left(1);
            break;
        case "RIGHT":
            term.right(1);
            break;
        case "INSERT":
            term.insert(1);
            break;
        case "ALT_INSERT":
            term.insertLine(1);
            break;
        case "DELETE":
            term.delete(1);
            break;
        case "ALT_DELETE":
            term.deleteLine(1);
            break;
        case "CTRL_C":
            process.exit();
            break;
        default:
            // Echo anything else
            term.noFormat(Buffer.isBuffer(data.code) ? data.code : String.fromCharCode(data.code));
            //console.error( require( 'string-kit' ).escape.control( data.code.toString() ) ) ;
            break;
    }
});
term.on("mouse", function (name, data) {
    term.moveTo(data.x, data.y);
});
