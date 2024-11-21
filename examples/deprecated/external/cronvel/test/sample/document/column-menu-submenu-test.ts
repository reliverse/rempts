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
  submenu: {
    /*
		disposition: 'overwrite' ,
		hideParent: true ,
		openOn: 'parentBlinked' ,
		closeOn: 'childSubmit' ,
		focusOnOpen: true ,
		//*/

    //*
    disposition: "right",
    hideParent: false,
    openOn: "parentFocus",
    closeOn: "childSubmit",
    focusOnOpen: false,
    //*/
  },
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
      items: [
        {
          content: "Open",
          value: "open",
        },
        {
          content: "Save",
          value: "save",
        },
      ],
    },
    {
      content: "Edit",
      value: "edit",
      items: [
        {
          content: "Copy",
          value: "copy",
        },
        {
          content: "Cut",
          value: "cut",
        },
        {
          content: "Paste",
          value: "paste",
        },
      ],
    },
    {
      content: "Tools",
      value: "tools",
      items: [
        {
          content: "Decrunch",
          value: "decrunch",
        },
      ],
    },
    {
      content: "Help",
      value: "help",
      items: [
        {
          content: "About",
          value: "about",
        },
        {
          content: "Manual",
          value: "manual",
          items: [
            {
              content: "Local",
              value: "local",
            },
            {
              content: "Online",
              value: "online",
            },
          ],
        },
      ],
    },
  ],
});

var submitCount = 0,
  focusCount = 0;

function onSubmit(buttonValue, action) {
  //console.error( 'Submitted: ' , value ) ;
  if (buttonValue === "view") {
    columnMenu.setItem(buttonValue, { content: "bob" });
  }

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

//document.giveFocusTo( columnMenu ) ;
columnMenu.focusValue("edit");

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
