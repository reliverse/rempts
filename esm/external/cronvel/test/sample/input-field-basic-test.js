import termkit from "..";
// @ts-nocheck
const term = termkit.terminal;
term("Terminal: %s\n", term.termconfigFile);
async function asyncQuestion() {
    term.green("Enter something:\n> ");
    var input = await term.inputField().promise;
    term.green("\nYour input is '%s'\n", input);
    term.processExit();
}
term.bold.cyan("Input field test, type something and hit the ENTER key...\n");
asyncQuestion();
