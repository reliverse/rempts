import termkit from "../../src/termkit.js";
// @ts-nocheck
/* jshint unused:false */
termkit.getDetectedTerminal(function (error, term) {
    term.grabInput();
    function question() {
        var controler;
        term("Do you like javascript? [y|n] ");
        //term.yesOrNo( { yes: [ 'y' , 'o' , 'ENTER' ] , no: [ 'n' ] , echoYes: 'yes' , echoNo: 'no' } , function( error , result ) {
        controler = term.yesOrNo(function (error, result) {
            if (error) {
                term.red.bold("\nAn error occurs: " + error + "\n");
                question();
            }
            else if (result) {
                term.green("\n'Yes' detected! Good bye!\n");
                terminate();
            }
            else {
                term.red("\n'No' detected, are you sure?\n");
                question();
            }
        });
        term.on("key", function (key) {
            if (key === "ESCAPE") {
                term("Escape.\n");
                controler.abort();
                setTimeout(terminate, 2000);
            }
        });
    }
    async function asyncQuestion() {
        var response;
        term("Do you like javascript? [y|n] ");
        while (!(await term.yesOrNo().promise)) {
            term.red("\n'No' detected, are you sure? [y|n] ");
        }
        term.green("\n'Yes' detected! Good bye!\n");
        terminate();
    }
    function terminate() {
        term.grabInput(false);
        // Add a 100ms delay, so the terminal will be ready when the process effectively exit, preventing bad escape sequences drop
        setTimeout(function () {
            process.exit();
        }, 100);
    }
    term.bold.cyan("Yes or no test, hit anything on the keyboard to see how it is detected...\n");
    //question() ;
    asyncQuestion();
});
