import Promise from "seventh";
import string from "string-kit";

// @ts-nocheck
require("./patches");
const execAsync = require("child_process").execAsync;
const execFileAsync = require("child_process").execFileAsync;
const spawn = require("child_process").spawn;

const XCLIP_SELECTION_ARG = {
  c: "clipboard",
  p: "primary",
  s: "secondary",
};

if (process.platform === "linux") {
  exports.getClipboard = async (source) => {
    var arg = XCLIP_SELECTION_ARG[source[0]] || "clipboard";
    return await execFileAsync("xclip", ["-o", "-selection", arg]);
  };

  exports.setClipboard = async (str, source) => {
    var promise = new Promise();
    var arg = XCLIP_SELECTION_ARG[source[0]] || "clipboard";
    var xclip = spawn("xclip", ["-i", "-selection", arg]);

    xclip.on("error", (error) => {
      //console.error( 'xclip error:' , error ) ;
      promise.reject(error);
    });

    xclip.on("exit", (code) => {
      //console.log( 'xclip exited with code:' , code ) ;
      if (code !== 0) {
        promise.reject(code);
      } else {
        promise.resolve();
      }
    });

    // Send the string to push to the clipboard
    xclip.stdin.end(str);

    return promise;
  };
} else {
  exports.getClipboard = () =>
    Promise.reject(new Error("No clipboard manipulation program found"));
  exports.setClipboard = () =>
    Promise.reject(new Error("No clipboard manipulation program found"));
}
