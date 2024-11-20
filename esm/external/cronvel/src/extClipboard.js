import "./patches.js";
import childProcess from "child_process";
import { spawn as spawn$0 } from "child_process";
import Promise from "seventh";
const execAsync = { execAsync: childProcess }.execAsync;
const execFileAsync = { execFileAsync: childProcess }.execFileAsync;
const spawn = { spawn: spawn$0 }.spawn;
const XCLIP_SELECTION_ARG = {
    c: "clipboard",
    p: "primary",
    s: "secondary",
};
if (process.platform === "linux") {
}
else {
}
export const getClipboard = async (source) => {
    var arg = XCLIP_SELECTION_ARG[source[0]] || "clipboard";
    return await execFileAsync("xclip", ["-o", "-selection", arg]);
};
export const setClipboard = async (str, source) => {
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
        }
        else {
            promise.resolve();
        }
    });
    // Send the string to push to the clipboard
    xclip.stdin.end(str);
    return promise;
};
