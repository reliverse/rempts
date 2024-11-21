// @ts-nocheck

import Element from "./Element";

// @ts-nocheck

function Text(options) {
  // Clone options if necessary
  options = !options ? {} : options.internal ? options : Object.create(options);
  options.internal = true;

  this.attr = options.attr || { bgColor: "brightBlack" };

  this.leftPadding = options.leftPadding || "";
  this.rightPadding = options.rightPadding || "";
  this.paddingHasMarkup = !!options.paddingHasMarkup;
  this.leftPaddingWidth = 0;
  this.rightPaddingWidth = 0;

  if (!Array.isArray(options.content)) {
    options.content = [options.content || ""];
  }

  // Usually done by the Element's constructor, but it's required now
  // Also check that sub-class hasn't defined it yet...
  this.content = ""; // set by .setContent()
  this.contentHasMarkup = options.contentHasMarkup || false; // can be true/false or 'ansi' or 'legacyAnsi'
  this.contentEllipsis =
    options.contentEllipsis === true ? "…" : options.contentEllipsis || "";

  this.contentAdaptativeWidth =
    options.contentAdaptativeWidth ?? !options.width;
  this.contentAdaptativeHeight =
    options.contentAdaptativeHeight ?? !options.height;

  this.innerWidth = 0; // content width + padding width

  // We need to compute that now
  if (this.setContent === Text.prototype.setContent) {
    this.setContent(options.content, this.contentHasMarkup, true, true);
  }

  // Forced or adaptative windth/height?
  if (!options.width) {
    options.width = this.innerWidth;
    options.contentAdaptativeWidth = true;
  }

  if (!options.height) {
    options.height = this.contentHeight;
    options.contentAdaptativeHeight = true;
  }

  Element.call(this, options);

  if (this.elementType === "Text" && !options.noDraw) {
    this.draw();
  }
}

Element.inherit(Text);

Text.prototype.forceContentArray = true;

Text.prototype.setContent = function (
  content,
  hasMarkup,
  dontDraw = false,
  dontResize = false,
) {
  if (this.forceContentArray && !Array.isArray(content)) {
    content = [content || ""];
  }

  var oldOutputWidth = this.outputWidth,
    oldOutputHeight = this.outputHeight;

  this.content = content;
  this.contentHasMarkup = hasMarkup;

  this.computeRequiredWidth();
  this.computeRequiredHeight();

  if (!dontResize && this.resizeOnContent) {
    this.resizeOnContent();
  }

  if (!dontDraw) {
    if (
      this.outputWidth < oldOutputWidth ||
      this.outputHeight < oldOutputHeight
    ) {
      this.outerDraw();
    } else {
      this.draw();
    }
  }
};

Text.prototype.computeRequiredWidth = function () {
  this.leftPaddingWidth = Element.computeContentWidth(
    this.leftPadding,
    this.paddingHasMarkup,
  );
  this.rightPaddingWidth = Element.computeContentWidth(
    this.rightPadding,
    this.paddingHasMarkup,
  );
  this.contentWidth = this.animation
    ? Math.max(
        ...this.animation.map((e) =>
          Element.computeContentWidth(e, this.contentHasMarkup),
        ),
      )
    : Element.computeContentWidth(this.content, this.contentHasMarkup) || 1;
  this.innerWidth =
    this.leftPaddingWidth + this.rightPaddingWidth + this.contentWidth;

  return this.innerWidth;
};

Text.prototype.computeRequiredHeight = function () {
  this.contentHeight = this.animation
    ? Math.max(...this.animation.map((e) => e.length))
    : this.content.length;

  return this.contentHeight;
};

Text.prototype.resizeOnContent = function () {
  if (this.contentAdaptativeWidth) {
    this.outputWidth = this.innerWidth;
  }

  if (this.contentAdaptativeHeight) {
    this.outputHeight = this.contentHeight;
  }
};

Text.prototype.postDrawSelf = function () {
  if (!this.outputDst) {
    return this;
  }

  var resumeAttr;

  // This is the gap caused by an output width larger than its actual content + padding
  var outputWidthGap =
    this.outputWidth -
    (this.leftPaddingWidth + this.rightPaddingWidth + this.contentWidth);

  var contentClip = {
    x: this.outputX + this.leftPaddingWidth,
    y: this.outputY,
    // NOT contentWidth, it could exceed the actual outputWidth
    width: this.outputWidth - this.leftPaddingWidth - this.rightPaddingWidth,
    height: this.outputHeight,
  };

  var elementClip = {
    x: this.outputX,
    y: this.outputY,
    width: this.outputWidth,
    height: this.outputHeight,
  };

  for (let lineNumber = 0; lineNumber < this.outputHeight; lineNumber++) {
    let contentLine = this.content[lineNumber] || "";

    // Write the left padding
    if (this.leftPadding) {
      this.outputDst.put(
        {
          x: this.outputX,
          y: this.outputY + lineNumber,
          attr: this.attr,
          markup: this.paddingHasMarkup,
          clip: elementClip,
        },
        this.leftPadding,
      );

      let leftPaddingGap =
        this.outputX + this.leftPaddingWidth - this.outputDst.cx;
      if (leftPaddingGap > 0) {
        this.outputDst.put({ attr: this.attr }, " ".repeat(leftPaddingGap));
      }
    }

    // Write the content
    resumeAttr = this.outputDst.put(
      {
        x: this.outputX + this.leftPaddingWidth,
        y: this.outputY + lineNumber,
        attr: this.attr,
        resumeAttr: resumeAttr,
        markup: this.contentHasMarkup,
        clip: contentClip,
        clipChar: this.contentEllipsis,
      },
      contentLine,
    );

    // We add the output width gap to the content gap
    let contentGap =
      this.outputX +
      this.leftPaddingWidth +
      this.contentWidth +
      outputWidthGap -
      this.outputDst.cx;
    if (contentGap > 0) {
      this.outputDst.put({ attr: this.attr }, " ".repeat(contentGap));
    }

    // Write the right padding
    if (this.rightPadding) {
      this.outputDst.put(
        {
          x: this.outputX + this.outputWidth - this.rightPaddingWidth,
          y: this.outputY + lineNumber,
          attr: this.attr,
          markup: this.paddingHasMarkup,
          clip: elementClip,
        },
        this.rightPadding,
      );

      let rightPaddingGap =
        this.outputX +
        this.leftPaddingWidth +
        this.contentWidth +
        outputWidthGap +
        this.rightPaddingWidth -
        this.outputDst.cx;
      if (rightPaddingGap > 0) {
        this.outputDst.put({ attr: this.attr }, " ".repeat(rightPaddingGap));
      }
    }
  }
};

export default Text;
