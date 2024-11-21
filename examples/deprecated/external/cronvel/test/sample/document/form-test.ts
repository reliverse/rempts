// @ts-nocheck

import termkit from "../..";

// @ts-nocheck
const term = termkit.terminal;

term.clear();

var document = term.createDocument();

var form = new termkit.Form({
  parent: document,
  x: 10,
  y: 3,
  width: 40,
  inputs: [
    {
      key: "login",
      label: "Login: ",
      content: "login@bob.net",

      // Validators are not yet implemented
      validator: { type: "string" },
    },
    {
      key: "password",
      label: "Password: ",
      hiddenContent: true,
      //textAttr: { bgColor: 'blue' , hiddenContent: true } ,
      validator: { type: "string" },
    },
    {
      key: "firstName",
      label: "first name: ",
      validator: { type: "string" },
    },
    {
      key: "lastName",
      label: "last name: ",
      validator: { type: "string" },
    },
    {
      key: "age",
      label: "age: ",
      validator: { type: "string" },
    },
    {
      key: "v1",
      label: "v1: ",
      type: "select",
      value: 2,
      items: [
        { content: "one", value: 1 },
        { content: "two", value: 2 },
        { content: "three", value: 3 },
        { content: "four", value: 4 },
      ],
    },
    {
      key: "v2",
      label: "v2: ",
      type: "selectMulti",
      //value: 2 ,
      items: [
        { content: "un", key: "un" },
        { content: "deux", key: "deux" },
        { content: "trois", key: "trois" },
      ],
    },
    {
      key: "comment",
      label: "comment: ",
      content: "multi\nline\ncontent",
      height: 5,
      scrollable: true,
      vScrollBar: true,
      validator: { type: "string" },
    },
  ],
  buttons: [
    {
      content: "<Ok>",
      value: "ok",
    },
    {
      content: "<Cancel>",
      value: "cancel",
    },
  ],
});

form.on("submit", onSubmit);

function onSubmit(value) {
  //console.error( 'Submitted: ' , value ) ;
  term.saveCursor();
  term.moveTo.styleReset.eraseLine(1, 24, "Submitted: %J\n", value);
  term.restoreCursor();
}

document.giveFocusTo(form);

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
