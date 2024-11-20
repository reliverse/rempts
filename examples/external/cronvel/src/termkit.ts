// @ts-nocheck

import path from "path";

// @ts-nocheck

/*
	Terminal Kit

	Copyright (c) 2009 - 2022 Cédric Ronvel

	The MIT License (MIT)

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in all
	copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
	SOFTWARE.
*/
if (
  process.browser ||
  require.cache[path.join(__dirname, "termkit-no-lazy-require")]
) {
  console.log("using termkit-no-lazy-require");
  module.exports = require("./termkit-no-lazy-require");
  process.exit();
}

const termkit = {};
const lazy = require("lazyness")(require);

// Global config
termkit.globalConfig = {};

lazy.requireProperty(termkit, "tty", "./tty");

// For some reason, starting from node v4, once process.stdin getter is triggered, the 'tty' command would not work properly.
// This 'hack' cache the result of the command 'tty' if we are in the linux console, so 'gpm' can work.
if (process.env.TERM === "linux") {
  termkit.tty.getPath();
}

// Core submodules
Object.assign(termkit, require("./misc"));
Object.assign(termkit, require("./detectTerminal"));

termkit.Terminal = require("./Terminal");
termkit.createTerminal = termkit.Terminal.create;

// Windows patches
if (process.platform === "win32") {
  require("./windows")(termkit);
}

// Lazy submodules
lazy.requireProperties(termkit, {
  image: "./image",
  Palette: "./Palette",
  Rect: "./Rect",
  ScreenBuffer: "./ScreenBuffer",
  ScreenBufferHD: "./ScreenBufferHD",
  TextBuffer: "./TextBuffer",
  Vte: "./vte/Vte",
  autoComplete: "./autoComplete",
  spChars: "./spChars",

  // Document model
  Element: "./document/Element",
  Document: "./document/Document",
  Container: "./document/Container",
  Text: "./document/Text",
  AnimatedText: "./document/AnimatedText",
  Button: "./document/Button",
  ToggleButton: "./document/ToggleButton",
  TextBox: "./document/TextBox",
  EditableTextBox: "./document/EditableTextBox",
  Slider: "./document/Slider",
  Bar: "./document/Bar",
  LabeledInput: "./document/LabeledInput",
  InlineInput: "./document/InlineInput",
  InlineFileInput: "./document/InlineFileInput",
  InlineMenu: "./document/InlineMenu",
  Inspector: "./document/Inspector",
  Form: "./document/Form",
  RowMenu: "./document/RowMenu",
  ColumnMenu: "./document/ColumnMenu",
  ColumnMenuMulti: "./document/ColumnMenuMulti",
  ColumnMenuMixed: "./document/ColumnMenuMixed",
  SelectList: "./document/SelectList",
  SelectListMulti: "./document/SelectListMulti",
  DropDownMenu: "./document/DropDownMenu",
  TextTable: "./document/TextTable",
  Layout: "./document/Layout",
  Border: "./document/Border",
  Window: "./document/Window",

  // External modules
  chroma: "chroma-js",
});

lazy.properties(
  termkit,
  {
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
  },
  true,
);

export default termkit;
