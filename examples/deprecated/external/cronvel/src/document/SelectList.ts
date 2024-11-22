// @ts-nocheck

import Element from "./Element.js";
import BaseMenu from "./BaseMenu.js";
import ColumnMenu from "./ColumnMenu.js";
import Button from "./Button.js";

// @ts-nocheck
// Inherit from ColumnMenu for common methods

function SelectList(options) {
  // Clone options if necessary
  options = !options ? {} : options.internal ? options : Object.create(options);
  options.internal = true;

  if (!options.master || typeof options.master !== "object") {
    options.master = Object.assign({}, this.defaultOptions.master);
  } else {
    options.master = Object.assign(
      {},
      this.defaultOptions.master,
      options.master,
    );
  }

  if (options.content) {
    options.master.content = options.content;
  }

  if (!options.separator || typeof options.separator !== "object") {
    options.separator = Object.assign({}, this.defaultOptions.separator);
  } else {
    options.separator = Object.assign(
      {},
      this.defaultOptions.separator,
      options.separator,
    );
  }

  ColumnMenu.call(this, options);

  this.showMenu = false;
  this.zIndexRef = this.zIndex; // Back-up for zIndex

  if (options.value !== undefined && this.setValue(options.value, true)) {
    // .initPage() is called by .setValue() only when a correct value was found
    this.toggle(this.showMenu, options.noDraw);
  } else {
    this.initPage();
    this.toggle(this.showMenu, options.noDraw);
  }

  this.onClickOut = this.onClickOut.bind(this);

  this.on("clickOut", this.onClickOut);

  // Only draw if we are not a superclass of the object
  if (this.elementType === "SelectList" && !options.noDraw) {
    this.draw();
  }
}

Element.inherit(SelectList, ColumnMenu);

SelectList.prototype.defaultOptions = {
  buttonBlurAttr: { bgColor: "gray", color: "white", bold: true },
  buttonFocusAttr: { bgColor: "white", color: "black", bold: true },
  buttonDisabledAttr: {
    bgColor: "gray",
    color: "white",
    bold: true,
    dim: true,
  },
  buttonSubmittedAttr: { bgColor: "gray", color: "brightWhite", bold: true },
  turnedOnBlurAttr: { bgColor: "cyan" },
  turnedOnFocusAttr: { bgColor: "brightCyan", color: "gray", bold: true },
  turnedOffBlurAttr: { bgColor: "gray", dim: true },
  turnedOffFocusAttr: { bgColor: "white", color: "black", bold: true },

  master: {
    content: "select-list",
    symbol: "▼",
    internalRole: "toggle",
  },
  separator: {
    content: "-",
    contentRepeat: true,
    internalRole: "separator",
  },
};

SelectList.prototype.toggle = function (showMenu = null, noDraw = false) {
  var i, iMax;

  if (showMenu === null) {
    this.showMenu = !this.showMenu;
  } else {
    this.showMenu = !!showMenu;
  }

  for (i = 1, iMax = this.buttons.length; i < iMax; i++) {
    this.buttons[i].hidden = !this.showMenu;
  }

  // We're adjusting outputHeight here to avoid the list to be clickable when reduced
  this.outputHeight = this.showMenu ? this.pageHeight : 1;

  if (this.showMenu) {
    this.topZ();
  } else {
    this.restoreZ();
  }

  // Return now if noDraw is set, bypassing both drawing and focus
  if (noDraw) {
    return;
  }

  if (showMenu) {
    for (i = 1, iMax = this.buttons.length; i < iMax; i++) {
      if (this.buttons[i].value === this.value) {
        this.document.giveFocusTo(this.buttons[i]);
        break;
      }
    }
  } else {
    this.document.giveFocusTo(this.buttons[0]);
  }

  this.outerDraw();
};

// selectOnly: don't draw, don't toggle
SelectList.prototype.select = function (button, selectOnly) {
  // /!\ Warning! button can be a button (called from .onButtonSubmit()) or a buttonDef (called from .setValue()) /!\
  // This is nasty and should be fixed!
  // Ideally, a button should retain a 'def' pointer
  var width,
    extraWidth = 1 + this.buttonSymbolWidth,
    buttonContent = button.content;

  if (Array.isArray(buttonContent)) {
    buttonContent = buttonContent[0] || "";
  }

  width =
    Element.computeContentWidth(buttonContent, button.contentHasMarkup) +
    this.buttonPaddingWidth +
    this.buttonSymbolWidth;

  if (width > this.buttonsMaxWidth) {
    // This is the normal case here...
    this.masterDef.buttonContent =
      Element.truncateContent(
        buttonContent,
        this.buttonsMaxWidth - this.buttonSymbolWidth,
        button.contentHasMarkup,
      ) +
      " " +
      this.masterDef.symbol;
  } else if (width < this.buttonsMaxWidth) {
    this.masterDef.buttonContent =
      buttonContent +
      " ".repeat(this.buttonsMaxWidth - width) +
      " " +
      this.masterDef.symbol;
  } else {
    this.masterDef.buttonContent = buttonContent + " " + this.masterDef.symbol;
  }

  this.masterDef.contentHasMarkup = button.contentHasMarkup;
  this.masterDef.width = this.buttonsMaxWidth;
  this.value = this.masterDef.value = button.value;

  // Only when it's a buttonDef ATM:
  if (button.page !== undefined) {
    this.page = button.page;
  }

  this.initPage();

  if (selectOnly) {
    return;
  }

  this.toggle(false); // , noDraw ) ;
};

SelectList.prototype.onButtonSubmit = function (buttonValue, action, button) {
  switch (button.internalRole) {
    case "previousPage":
      this.previousPage();
      break;
    case "nextPage":
      this.nextPage();
      break;
    case "toggle":
      this.toggle();
      break;
    default:
      this.select(button);
      this.emit("submit", buttonValue, action, this, button);
  }
};

// .setValue() will also select the first matching item
SelectList.prototype.setValue = function (value, noDraw) {
  var buttonDef = this.itemsDef.find((b) => b.value === value);
  if (!buttonDef) {
    return false;
  }
  this.select(buttonDef, noDraw);
  return true;
};

SelectList.prototype.onClickOut = function () {
  this.toggle(false);
};
SelectList.prototype.getValue = function () {
  return this.value;
};

export default SelectList;
