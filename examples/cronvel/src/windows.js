/*
	Windows compatibility.
*/

module.exports = function (termkit) {
  termkit.globalConfig.preferProcessSigwinch = true;
};
