// @ts-nocheck

import termkit from "../..";

// @ts-nocheck
const term = termkit.terminal;

term.clear();

var document = term.createDocument({ palette: new termkit.Palette() });

var columnMenu = new termkit.ColumnMenu({
  parent: document,
  x: 0,
  y: 5,
  width: 20,
  pageMaxHeight: 5,
  //height: 5 ,
  blurLeftPadding: "^;  ",
  focusLeftPadding: "^;^R> ",
  disabledLeftPadding: "^;  ",
  paddingHasMarkup: true,
  multiLineItems: true,
  buttonEvenBlurAttr: { bgColor: "@dark-gray", color: "white", bold: true },
  buttonKeyBindings: {
    ENTER: "submit",
    CTRL_UP: "submit",
    CTRL_DOWN: "submit",
  },
  buttonActionKeyBindings: {
    CTRL_UP: "up",
    CTRL_DOWN: "down",
  },
  items: [
    {
      content: "File",
      value: "file",
    },
    {
      //content: 'Edit' ,
      markup: true,
      content: "^REdit",
      //content: '^R> > > > > EDIT < < < < <' ,
      blurContent: "^REdit",
      focusContent: "^R> EDIT <",
      //focusContent: '^R> > > > > EDIT < < < < <' ,
      value: "edit",
    },
    {
      content: "View",
      value: "view",
    },
    {
      content: "History",
      value: "history",
    },
    {
      content: "^[fg:*royal-blue]Bookmarks",
      markup: true,
      value: "bookmarks",
    },
    {
      content: "Tools",
      value: "tools",
    },
    {
      content: "Help",
      value: "help",
    },
    {
      content: "Disabled button",
      disabled: true,
      value: "disabled",
    },
    //*
    {
      //content: 'Very long, very long, very long, very long, very long, very long, very long, very long, very long, very long' ,
      content:
        "Very long, very long, very ^rlong, very long, very long, very long, very ^blong, very long, very long, very long",
      markup: true,
      //focusContent: 'Very big, very big, very ^rbig, very big, very big, very big, very ^bbig, very big, very big, very big' , markup: true ,
      value: "very long",
    },
    //*/
    {
      content: "Not long",
      value: "not long",
    },
  ],
});

var submitCount = 0,
  focusCount = 0;

function onSubmit(buttonValue, action) {
  //console.error( 'Submitted: ' , value ) ;
  //if ( buttonValue === 'view' ) { columnMenu.setItem( buttonValue , { content: 'bob' } ) ; }

  term.saveCursor();
  term.moveTo.styleReset.eraseLine(
    1,
    22,
    "Submitted #%i: %s %s\n",
    submitCount++,
    buttonValue,
    action,
  );
  term.restoreCursor();
}

function onItemFocus(buttonValue, focus) {
  //console.error( 'Submitted: ' , value ) ;
  term.saveCursor();
  term.moveTo.styleReset.eraseLine(
    1,
    24,
    "Item focus #%i: %s %s\n",
    focusCount++,
    buttonValue,
    focus,
  );
  term.restoreCursor();
}

columnMenu.on("submit", onSubmit);
//columnMenu.on( 'blinked' , onSubmit ) ;
columnMenu.on("itemFocus", onItemFocus);

document.giveFocusTo(columnMenu);
//columnMenu.focusValue( 'edit' ) ;

term.on("key", function (key) {
  switch (key) {
    case "CTRL_C":
      term.grabInput(false);
      term.hideCursor(false);
      term.styleReset();
      term.clear();
      process.exit();
      break;
    case "CTRL_D":
      columnMenu.draw();
      break;
    case "CTRL_R":
      columnMenu.redraw();
      break;
  }
});
