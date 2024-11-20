import terminalKit from "terminal-kit";
// @ts-nocheck
var term = terminalKit.terminal;
function test() {
    term.slowTyping("What a wonderful world!\n", { flashStyle: term.brightWhite }, function () {
        process.exit();
    });
}
async function asyncTest() {
    await term.slowTyping("What a wonderful world!\n", {
        flashStyle: term.brightWhite,
    });
    term("done!\n");
    process.exit();
}
//test() ;
asyncTest();
