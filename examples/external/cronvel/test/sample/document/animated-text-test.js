import termkit from "../..";
// @ts-nocheck
var term = termkit.terminal;
term.clear();
var document = term.createDocument();
var spinner = new termkit.AnimatedText({
    parent: document,
    animation: "unboxing-color",
    //contentHasMarkup: true ,
    x: 0,
    y: term.height - 1,
});
setTimeout(() => spinner.animate(2), 2000);
//setTimeout( () => spinner.animate( false ) , 5000 ) ;
//setTimeout( () => spinner.animate( 4 ) , 6000 ) ;
term.on("key", function (key) {
    switch (key) {
        case "CTRL_C":
            term.styleReset();
            term.clear();
            process.exit();
            break;
    }
});
