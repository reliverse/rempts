import terminalKit from "terminal-kit";
// @ts-nocheck
var term = terminalKit.terminal;
term("Choose a file: ");
term.fileInput(
//{ baseDir: __dirname + '/../' } ,
{ baseDir: "../" }, function (error, input) {
    if (error) {
        term.red.bold("\nAn error occurs: " + error + "\n");
    }
    else {
        term.green("\nYour file is '%s'\n", input);
    }
    process.exit();
});
