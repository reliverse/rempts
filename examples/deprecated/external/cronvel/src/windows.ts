// @ts-nocheck

/*
	Windows compatibility.
*/
export default function (termkit) {
  termkit.globalConfig.preferProcessSigwinch = true;
}
