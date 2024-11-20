import termkit from "..";
// @ts-nocheck
const term = termkit.terminal;
async function test() {
    var spinner = await term.spinner("unboxing-color");
    term(" Loading... ");
    setTimeout(() => spinner.animate(false), 1000);
    setTimeout(() => spinner.animate(true), 2000);
    //setTimeout( () => process.exit() , 5000 ) ;
}
test();
