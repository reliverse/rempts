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
term.green("mouse in motion mode\n");
// Set Application Keypad mode, but it does not works on every box (sometime numlock should be off for this to work)
term.applicationKeypad();
//term.keyboardModifier() ;
term.grabInput({ mouse: "motion", focus: true });
var mouseMode = 3;
term.on("key", (name, matches, data) => {
    if (matches.indexOf("CTRL_C") >= 0) {
        term.green("CTRL-C received...\n");
        terminate();
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
    term("'mouse' event: %s %n\n", name, data);
});
term.on("unknown", (buffer) => {
    console.log("'unknown' event, buffer:", buffer);
});
