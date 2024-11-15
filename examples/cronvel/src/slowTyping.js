var Promise = require("seventh");

/*
	fakeTyping( str , [options] , callback )
		* str
		* options
			* style
			* delay
			* flashStyle
			* flashDelay
		* callback
*/
module.exports = function slowTyping(str, options, callback) {
  if (typeof str !== "string") {
    throw new TypeError(
      "[terminal] slowTyping(): argument #0 should be a string",
    );
  }
  if (typeof options === "function") {
    callback = options;
    options = {};
  }
  if (!options || typeof options !== "object") {
    options = {};
  }

  if (!options.style) {
    options.style = this.green;
  }
  if (!options.delay) {
    options.delay = 150;
  }
  if (!options.flashStyle) {
    options.flashStyle = this.bold.brightGreen;
  }
  if (!options.flashDelay) {
    options.flashDelay = 100;
  }

  var index,
    unflashTimer,
    promise = new Promise();

  var printChar = () => {
    if (unflashTimer) {
      clearTimeout(unflashTimer);
      unflashTimer = null;
      unflash();
    }

    if (index === undefined) {
      index = 0;
    } else if (index >= str.length) {
      if (callback) {
        callback();
      } else {
        promise.resolve();
      }
      return;
    } else {
      if (options.flashStyle && str[index].match(/\S/)) {
        options.flashStyle(str[index]);
        unflashTimer = setTimeout(unflash, options.flashDelay);
      } else {
        options.style(str[index]);
      }

      index++;
    }

    setTimeout(printChar, (0.2 + Math.random() * 1.8) * options.delay);
  };

  var unflash = () => {
    this.left(1);
    options.style(str[index - 1]);
    unflashTimer = null;
  };

  printChar();

  return promise;
};
