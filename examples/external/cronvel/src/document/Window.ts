import Element from "./Element.js";
import Container from "./Container.js";

// @ts-nocheck
const framesChars = require("../spChars").box;

function Window(options) {
  // Clone options if necessary
  options = !options ? {} : options.internal ? options : Object.create(options);
  options.internal = true;

  if (options.movable === undefined) {
    options.movable = true;
  }
  if (options.title) {
    options.content = options.title;
  }
  if (options.titleHasMarkup) {
    options.contentHasMarkup = options.titleHasMarkup;
  }

  Container.call(this, options);

  this.frameChars = framesChars.double;

  // Backward compatibility, boxChars is DEPRECATED
  if (options.boxChars && !options.frameChars) {
    options.frameChars = options.boxChars;
  }

  if (options.frameChars) {
    if (typeof options.frameChars === "object") {
      this.frameChars = options.frameChars;
    } else if (
      typeof options.frameChars === "string" &&
      framesChars[options.frameChars]
    ) {
      this.frameChars = framesChars[options.frameChars];
    }
  }

  // Only draw if we are not a superclass of the object
  if (this.elementType === "Window" && !options.noDraw) {
    this.draw();
  }
}

Element.inherit(Window, Container);

Window.prototype.containerBorderSize = 1;
Window.prototype.outerDrag = true;

Window.prototype.preDrawSelf = function () {
  var y,
    title,
    titleWidth,
    vFrame,
    titleMaxWidth = this.outputWidth - 8;

  // Draw the top border
  if (this.content && titleMaxWidth >= 1) {
    title = Element.truncateContent(
      this.content,
      titleMaxWidth,
      this.contentHasMarkup,
    );
    titleWidth = Element.getLastTruncateWidth();

    this.outputDst.put(
      { x: this.outputX, y: this.outputY, markup: this.contentHasMarkup },
      this.frameChars.topLeft +
        this.frameChars.horizontal +
        "[" +
        title +
        "]" +
        this.frameChars.horizontal.repeat(this.outputWidth - 5 - titleWidth) +
        this.frameChars.topRight,
    );
  } else {
    this.outputDst.put(
      { x: this.outputX, y: this.outputY },
      this.frameChars.topLeft +
        this.frameChars.horizontal.repeat(this.outputWidth - 2) +
        this.frameChars.topRight,
    );
  }

  // Draw the bottom border
  this.outputDst.put(
    { x: this.outputX, y: this.outputY + this.outputHeight - 1 },
    this.frameChars.bottomLeft +
      this.frameChars.horizontal.repeat(this.outputWidth - 2) +
      this.frameChars.bottomRight,
  );

  // Draw the left and right border
  vFrame = this.frameChars.vertical.repeat(this.outputHeight - 2);
  this.outputDst.put(
    { x: this.outputX, y: this.outputY + 1, direction: "down" },
    vFrame,
  );
  this.outputDst.put(
    {
      x: this.outputX + this.outputWidth - 1,
      y: this.outputY + 1,
      direction: "down",
    },
    vFrame,
  );

  Container.prototype.preDrawSelf.call(this);
};

// Allow only the top-border/title-bar to be draggable?
//Window.prototype.onDrag = function( data ) { Container.prototype.onDrag.call( this , data ) ; } ;
export default Window;
