// @ts-nocheck

const fileHelpers = require("./fileHelpers");
const path = require("path");

/*
	/!\ Document that!!! /!\
*/
module.exports = async function fileInput(options, callback) {
  var baseDir, autoCompleteFileOptions, inputFieldOptions, input;

  if (typeof options === "function") {
    callback = options;
    options = {};
  }
  if (!options || typeof options !== "object") {
    options = {};
  }

  try {
    baseDir = await fileHelpers.resolveBaseDir(options.baseDir);

    autoCompleteFileOptions = { baseDir };

    // Transmit options to inputField()
    inputFieldOptions = Object.assign({}, options, {
      autoComplete: (inputString) =>
        fileHelpers.autoCompleteFile(inputString, autoCompleteFileOptions),
      autoCompleteMenu: true,
      minLength: 1,
    });

    input = await this.inputField(inputFieldOptions).promise;
  } catch (error) {
    if (callback) {
      callback(error);
      return;
    }
    throw error;
  }

  if (!input && typeof input !== "string") {
    input = undefined;
  } else {
    input = path.resolve(path.isAbsolute(input) ? input : baseDir + input);
  }

  if (callback) {
    callback(undefined, input);
  }

  return input;
};
