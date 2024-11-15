// @ts-nocheck

const spChars = require("./spChars");

/*
	bar( value , options )
		* value `number` the value to display as bar
		* options `object` of options, where:
			* innerSize `number` the inner width in characters (default: 10)
			* barStyle `function` the style of the bar, default to term.blue
			* str `boolean` (default: false) if true it outputs nothing, instead it returns a string
*/
module.exports = function (value, options) {
  var str = "",
    barString = "";

  options = options || {};

  if (isNaN(value) || value < 0) {
    value = 0;
  } else if (value > 1) {
    value = 1;
  }

  var innerSize = options.innerSize || 10;
  var fullBlocks = Math.floor(value * innerSize);
  var partialBlock = Math.round((value * innerSize - fullBlocks) * 8);
  var barStyle = options.barStyle || this.blue;

  barString += "█".repeat(fullBlocks);

  if (fullBlocks < innerSize) {
    barString += spChars.enlargingBlock[partialBlock];
    barString += " ".repeat(innerSize - fullBlocks - 1);
  }

  if (options.str) {
    str += this.str.inverse("▉");
    str += barStyle.str(barString);
    str += this.str("▏");
    return str;
  }

  this.inverse("▉");
  barStyle(barString);
  this("▏");

  return this;
};
