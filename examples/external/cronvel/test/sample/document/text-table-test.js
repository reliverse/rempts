import termkit from "../..";
// @ts-nocheck
//console.error( "\n\n\n\n\n\n\n\n" ) ;
const term = termkit.terminal;
term.clear();
var document = term.createDocument({
    palette: new termkit.Palette(),
    //	backgroundAttr: { bgColor: 'magenta' , dim: true } ,
});
var textTable = new termkit.TextTable({
    parent: document,
    cellContents: [
        //*
        ["header #1", "header #2", "header #3"],
        ["row #1", "a much bigger cell ".repeat(10), "cell"],
        ["row #2", "cell", "a medium cell"],
        ["row #3", "with wide char 🔴", "cell"],
        ["row #4", "cell\nwith\nnew\nlines", "cell"],
        //*/
        /*
            [ '1-1' , '2-1' , '3-1' ] ,
            [ '1-2' , '2-2' , '3-2' ] ,
            [ '1-3' , '2-3' , '3-3' ]
            //*/
    ],
    contentHasMarkup: true,
    x: 0,
    y: 2,
    //hasBorder: false ,
    //borderChars: 'double' ,
    borderAttr: { color: "blue" },
    textAttr: { bgColor: "default" },
    //textAttr: { bgColor: 'black' } ,
    firstCellTextAttr: { bgColor: "blue" },
    firstRowTextAttr: { bgColor: "gray" },
    firstColumnTextAttr: { bgColor: "red" },
    //checkerEvenCellTextAttr: { bgColor: 'gray' } ,
    //evenCellTextAttr: { bgColor: 'gray' } ,
    //evenRowTextAttr: { bgColor: 'gray' } ,
    //evenColumnTextAttr: { bgColor: 'gray' } ,
    selectedTextAttr: { bgColor: "blue" },
    selectable: "cell",
    width: 50,
    //width: term.width ,
    height: 20,
    fit: true, // Activate all expand/shrink + wordWrap
    //expandToWidth: true , shrinkToWidth: true , expandToHeight: true , shrinkToHeight: true , wordWrap: true ,
    //lineWrap: true ,
});
//*
setTimeout(() => {
    //textTable.setCellContent( 2 , 3 , "New ^R^+content^:! And BTW... We have to force some line break and so on..." ) ;
    textTable.setCellContent(2, 3, "New ^[fg:*pink]^[bg:*crimson]content^:! And BTW... We have to force some line break and so on...");
}, 1000);
//*/
setTimeout(() => {
    //textTable.setCellAttr( 1 , 2 , { bgColor: 'cyan' } ) ;
    textTable.setRowAttr(2, { bgColor: "cyan" });
    //textTable.setColumnAttr( 1 , { bgColor: 'cyan' } ) ;
    //textTable.setTableAttr( { bgColor: 'cyan' } ) ;
}, 500);
setTimeout(() => {
    //textTable.resetCellAttr( 1 , 2 ) ;
    textTable.resetRowAttr(2);
    //textTable.resetColumnAttr( 1 ) ;
    //textTable.resetTableAttr() ;
}, 1500);
term.on("key", function (key) {
    switch (key) {
        case "CTRL_C":
            term.grabInput(false);
            term.hideCursor(false);
            term.styleReset();
            term.clear();
            process.exit();
            break;
    }
});
