// @ts-nocheck

import Element from "./Element";
import TextBox from "./TextBox";
import RowMenu from "./RowMenu";
import Promise from "seventh";
import string from "string-kit";

// @ts-nocheck

function InlineMenu(options) {
  // Clone options if necessary
  options = !options ? {} : options.internal ? options : Object.create(options);
  options.internal = true;

  if (options.value) {
    options.content = options.value;
  }

  // It is always 1 at the begining
  options.outputHeight = 1;

  this.promptTextBox = null;

  if (options.prompt) {
    this.promptTextBox = new TextBox(
      Object.assign(
        {
          textAttr: options.textAttr,
        },
        options.prompt,
        {
          internal: true,
          //parent: this ,
          outputX: options.outputX || options.x,
          outputY: options.outputY || options.y,
          outputWidth: options.outputWidth || options.width,
          outputHeight: options.outputHeight || options.height,
          lineWrap: options.lineWrap,
          wordWrap: options.wordWrap || options.wordwrap,
        },
      ),
    );

    // Drop void cells
    this.promptTextBox.textBuffer.setVoidAttr(null);

    let size = this.promptTextBox.getContentSize();
    this.promptTextBox.setSizeAndPosition(size);

    if (size.height > 1) {
      options.outputY = (options.outputY || options.y) + size.height - 1;
    }

    this.leftMargin = this.promptTextBox.outputWidth;
  }

  RowMenu.call(this, options);

  if (this.promptTextBox) {
    this.attach(this.promptTextBox);
  }

  // Only draw if we are not a superclass of the object
  if (this.elementType === "InlineMenu" && !options.noDraw) {
    this.draw();
  }
}

Element.inherit(InlineMenu, RowMenu);

// Pre-compute page and eventually create Buttons automatically
InlineMenu.prototype.initChildren = function (noInitPage = false) {
  RowMenu.prototype.initChildren.call(this);

  // Only initPage if we are not a superclass of the object
  if (this.elementType === "InlineMenu" && !noInitPage) {
    this.initPage();
  }
};

export default InlineMenu;
