// @ts-nocheck

import Element from "./Element.js";
import InlineInput from "./InlineInput.js";
import fileHelpers from "../fileHelpers";
import fs from "fs";
import path from "path";

// @ts-nocheck
/*
	An InlineInput that auto-complete filepath.
*/

function InlineFileInput(options) {
  // Clone options if necessary
  options = !options ? {} : options.internal ? options : Object.create(options);
  options.internal = true;

  this.baseDir = options.baseDir ?? null;
  this.resolvedBaseDir = null;
  this.autoCompleteFileOptions = null;

  this.accept =
    options.accept && typeof options.accept === "object"
      ? options.accept
      : { unexistant: true, file: true, directory: true };

  InlineInput.call(this, options);

  this.autoComplete = this.fileAutoComplete.bind(this);
  this.useAutoCompleteHint = options.useAutoCompleteHint ?? true;
  this.useAutoCompleteMenu = options.useAutoCompleteMenu ?? true;

  // Only draw if we are not a superclass of the object
  if (this.elementType === "InlineFileInput" && !options.noDraw) {
    this.draw();
  }

  this.initPromise = this.init();
}

Element.inherit(InlineFileInput, InlineInput);

InlineFileInput.prototype.init = async function () {
  if (this.initPromise) {
    return this.initPromise;
  }

  this.resolvedBaseDir = await fileHelpers.resolveBaseDir(this.baseDir);

  // Force directory, because we need them to navigate to files
  var accept = Object.assign({}, this.accept);
  accept.directory = true;

  this.autoCompleteFileOptions = {
    accept,
    baseDir: this.resolvedBaseDir,
  };
};

InlineFileInput.prototype.fileAutoComplete = async function (inputString) {
  await this.initPromise;
  return fileHelpers.autoCompleteFile(
    inputString,
    this.autoCompleteFileOptions,
  );
};

InlineFileInput.prototype.submit = async function () {
  var filePath, stats;

  if (this.disabled || this.submitted || this.canceled) {
    return;
  }
  //this.submitted = true ;

  filePath = this.getValue();

  if (!filePath || typeof filePath !== "string") {
    if (!this.noEmpty) {
      this.emit("submit", null, undefined, this);
    }
    return;
  }

  await this.initPromise;

  filePath = path.resolve(
    path.isAbsolute(filePath) ? filePath : this.resolvedBaseDir + filePath,
  );

  try {
    stats = await fs.promises.stat(filePath);
  } catch (error) {
    if (error.code === "ENOENT" && this.accept.unexistant) {
      this.emit("submit", filePath, undefined, this);
      return;
    }

    if (!this.noEmpty) {
      this.emit("submit", null, undefined, this);
    }
    return;
  }

  if (!fileHelpers.statsFilter(stats, this.accept)) {
    if (!this.noEmpty) {
      this.emit("submit", null, undefined, this);
    }
    return;
  }

  this.emit("submit", filePath, undefined, this);
};

export default InlineFileInput;
