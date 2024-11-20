import terminalKit from "terminal-kit";
// @ts-nocheck
var term = terminalKit.terminal;
term.slowTyping("What a wonderful world!\n", { flashStyle: term.brightWhite }, function () {
    process.exit();
});
