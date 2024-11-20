import lazyness from "lazyness";
import * as misc from "./misc.js";
import * as detectTerminal from "./detectTerminal.js";
import windows from "./windows.js";
// @ts-nocheck
const termkit = {};
const lazy = lazyness(require);
// Global config
termkit.globalConfig = {};
termkit.tty = require("./tty");
// For some reason, starting from node v4, once process.stdin getter is triggered, the 'tty' command would not work properly.
// This 'hack' cache the result of the command 'tty' if we are in the linux console, so 'gpm' can work.
if (process.env.TERM === "linux") {
    termkit.tty.getPath();
}
// Core submodules
Object.assign(termkit, misc);
Object.assign(termkit, detectTerminal);
termkit.Terminal = require("./Terminal");
termkit.createTerminal = termkit.Terminal.create;
// Windows patches
if (process.platform === "win32") {
    windows(termkit);
}
termkit.image = require("./image");
termkit.Palette = require("./Palette");
termkit.Rect = require("./Rect");
termkit.ScreenBuffer = require("./ScreenBuffer");
termkit.ScreenBufferHD = require("./ScreenBufferHD");
termkit.TextBuffer = require("./TextBuffer");
termkit.Vte = require("./vte/Vte");
termkit.autoComplete = require("./autoComplete");
termkit.spChars = require("./spChars");
// Document model
termkit.Element = require("./document/Element");
termkit.Document = require("./document/Document");
termkit.Container = require("./document/Container");
termkit.Text = require("./document/Text");
termkit.AnimatedText = require("./document/AnimatedText");
termkit.Button = require("./document/Button");
termkit.ToggleButton = require("./document/ToggleButton");
termkit.TextBox = require("./document/TextBox");
termkit.EditableTextBox = require("./document/EditableTextBox");
termkit.Slider = require("./document/Slider");
termkit.Bar = require("./document/Bar");
termkit.LabeledInput = require("./document/LabeledInput");
termkit.InlineInput = require("./document/InlineInput");
termkit.InlineFileInput = require("./document/InlineFileInput");
termkit.InlineMenu = require("./document/InlineMenu");
termkit.Inspector = require("./document/Inspector");
termkit.Form = require("./document/Form");
termkit.RowMenu = require("./document/RowMenu");
termkit.ColumnMenu = require("./document/ColumnMenu");
termkit.ColumnMenuMulti = require("./document/ColumnMenuMulti");
termkit.ColumnMenuMixed = require("./document/ColumnMenuMixed");
termkit.SelectList = require("./document/SelectList");
termkit.SelectListMulti = require("./document/SelectListMulti");
termkit.DropDownMenu = require("./document/DropDownMenu");
termkit.TextTable = require("./document/TextTable");
termkit.Layout = require("./document/Layout");
termkit.Border = require("./document/Border");
termkit.Window = require("./document/Window");
// External modules
termkit.chroma = require("chroma-js");
lazy.properties(termkit, {
    terminal: () => {
        var guessed = termkit.guessTerminal();
        return termkit.createTerminal({
            stdin: process.stdin,
            stdout: process.stdout,
            stderr: process.stderr,
            generic: guessed.generic || "unknown",
            appId: guessed.safe ? guessed.appId : undefined,
            //	appName: guessed.safe ? guessed.appName : undefined ,
            isTTY: guessed.isTTY,
            isSSH: guessed.isSSH,
            processSigwinch: true,
            preferProcessSigwinch: !!termkit.globalConfig.preferProcessSigwinch,
        });
    },
    realTerminal: () => {
        var guessed = termkit.guessTerminal(true);
        var input = termkit.tty.getInput();
        var output = termkit.tty.getOutput();
        return termkit.createTerminal({
            stdin: input,
            stdout: output,
            stderr: process.stderr,
            generic: guessed.generic || "unknown",
            appId: guessed.safe ? guessed.appId : undefined,
            //	appName: guessed.safe ? guessed.appName : undefined ,
            isTTY: true,
            isSSH: guessed.isSSH,
            processSigwinch: true,
            preferProcessSigwinch: !!termkit.globalConfig.preferProcessSigwinch,
        });
    },
}, true);
export default termkit;
