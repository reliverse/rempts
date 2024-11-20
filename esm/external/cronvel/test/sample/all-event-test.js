import  from "..";
// @ts-nocheck
const term = .terminal;
function terminate() {
    term.brightBlack("About to exit...\n");
    term.grabInput(false);
    term.applicationKeypad(false);
    // Add a 100ms delay, so the terminal will be ready when the process effectively exit, preventing bad escape sequences drop
    setTimeout(() => {
        process.exit();
    }, 100);
}
term.bold.cyan("Key test, hit anything on the keyboard to see how it is detected...\n");
term.green("Hit CTRL-C to quit, CTRL-D to change the mouse reporting mode\n\n");
// Set Application Keypad mode, but it does not works on every box (sometime numlock should be off for this to work)
term.applicationKeypad();
//term.keyboardModifier() ;
term.grabInput({ mouse: "button", focus: true });
var mouseMode = 1;
term.on("key", (name, matches, data) => {
    console.log("'key' event:", name, matches, Buffer.isBuffer(data.code) ? data.code : data.code.toString(16), data.codepoint ? data.codepoint.toString(16) : "");
    if (matches.indexOf("CTRL_C") >= 0) {
        term.green("CTRL-C received...\n");
        terminate();
    }
    if (matches.indexOf("CTRL_R") >= 0) {
        term.green("CTRL-R received... asking terminal some information...\n");
        term.requestCursorLocation();
        term.requestScreenSize();
    }
    if (matches.indexOf("CTRL_T") >= 0) {
        // For instance, only *kitty* is known to respond to XTGETTCAP, which is used by getTerminfo
        term.green("CTRL-T received... requesting terminfo...\n");
        //term.getTerminfo( 'name' , 'TN' , 'colors' , 'RGB' , 'rgb' , 'kitty-query-version' , 'kitty-query-allow_hyperlinks' ) ;
        term.getTerminfo("name");
        term.getTerminfo("colors");
        term.getTerminfo("RGB");
        term.getTerminfo("rgb");
    }
    if (matches.indexOf("CTRL_Y") >= 0) {
        term.green("CTRL-Y received... requesting terminal unit ID\n");
        term.requestTerminalUnitIdLL();
    }
    if (matches.indexOf("CTRL_V") >= 0) {
        term.green("CTRL-V received... asking terminal the clipboard...\n");
        term.requestClipboard();
    }
    if (matches.indexOf("CTRL_D") >= 0) {
        term.green("CTRL-D received: ");
        mouseMode = (mouseMode + 1) % 4;
        switch (mouseMode) {
            case 0:
                term.green("turn mouse off\n");
                term.grabInput({ mouse: false, focus: true });
                break;
            case 1:
                term.green("mouse in button mode\n");
                term.grabInput({ mouse: "button", focus: true });
                break;
            case 2:
                term.green("mouse in drag mode\n");
                term.grabInput({ mouse: "drag", focus: true });
                break;
            case 3:
                term.green("mouse in motion mode\n");
                term.grabInput({ mouse: "motion", focus: true });
                break;
        }
    }
});
term.on("terminal", (name, data) => {
    console.log("'terminal' event:", name, data);
});
term.on("mouse", (name, data) => {
    console.log("'mouse' event:", name, data);
});
term.on("unknown", (buffer) => {
    console.log("'unknown' event, buffer:", buffer);
});
term.on("resize", (width, height) => {
    console.log("'resize' event, new width and height:", width, height);
});
