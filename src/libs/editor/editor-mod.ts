import { re } from "@reliverse/relico";
import { relinka } from "@reliverse/relinka";
import ansiEscapes from "ansi-escapes";
import { realpathSync } from "fs";
import { readFile, writeFile } from "fs/promises";
import path from "path";
import readline from "readline";
import { cursor } from "sisteransi";
import type { EditorExitResult } from "../../types";

// Custom terminal interface to replace termkit
class TerminalInterface {
  private rl: readline.Interface;
  private _width: number;
  private _height: number;
  private keyListeners: Array<(key: string, matches: string[], data: any) => void> = [];
  private resizeListeners: Array<(width: number, height: number) => void> = [];

  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: true,
    });

    // Get initial terminal size
    this._width = process.stdout.columns || 80;
    this._height = process.stdout.rows || 24;

    // Handle terminal resize
    process.stdout.on("resize", () => {
      this._width = process.stdout.columns || 80;
      this._height = process.stdout.rows || 24;
      this.resizeListeners.forEach((listener) => listener(this._width, this._height));
    });

    // Handle raw input for key events
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding("utf8");

    process.stdin.on("data", (data) => {
      const key = this.parseKey(data);
      if (key) {
        this.keyListeners.forEach((listener) =>
          listener(key, [], {
            isCharacter: this.isCharacter(key),
            code: data,
            codepoint: data.toString().charCodeAt(0),
          }),
        );
      }
    });
  }

  private parseKey(data: Buffer): string {
    const str = data.toString();

    // Handle special keys
    if (str === "\u0003") return "CTRL_C";
    if (str === "\u0001") return "CTRL_A";
    if (str === "\u000F") return "CTRL_O";
    if (str === "\u0013") return "CTRL_S";
    if (str === "\u0018") return "CTRL_X";
    if (str === "\u0006") return "CTRL_F";
    if (str === "\u000B") return "CTRL_K";
    if (str === "\u0015") return "CTRL_U";
    if (str === "\u0014") return "CTRL_T";
    if (str === "\u0009") return "TAB";
    if (str === "\r" || str === "\n") return "ENTER";
    if (str === "\u007F" || str === "\b") return "BACKSPACE";
    if (str === "\u001B[3~") return "DELETE";
    if (str === "\u001B[A") return "UP";
    if (str === "\u001B[B") return "DOWN";
    if (str === "\u001B[C") return "RIGHT";
    if (str === "\u001B[D") return "LEFT";
    if (str === "\u001B[5~") return "PAGE_UP";
    if (str === "\u001B[6~") return "PAGE_DOWN";
    if (str === "\u001B[H") return "HOME";
    if (str === "\u001B[F") return "END";
    if (str === "\u001B[1;5H") return "CTRL_HOME";
    if (str === "\u001B[1;5F") return "CTRL_END";
    if (str === "\u001B[1;3C") return "ALT_C";
    if (str === "\u001B[2;2~") return "SHIFT_INSERT";
    if (str === "\u001B[2;5~") return "CTRL_INSERT";

    // Return single character for regular input
    return str.length === 1 ? str : "";
  }

  private isCharacter(key: string): boolean {
    return (
      key.length === 1 &&
      !key.startsWith("\u001B") &&
      ![
        "CTRL_C",
        "CTRL_A",
        "CTRL_O",
        "CTRL_S",
        "CTRL_X",
        "CTRL_F",
        "CTRL_K",
        "CTRL_U",
        "CTRL_T",
        "TAB",
        "ENTER",
        "BACKSPACE",
        "DELETE",
        "UP",
        "DOWN",
        "RIGHT",
        "LEFT",
        "PAGE_UP",
        "PAGE_DOWN",
        "HOME",
        "END",
        "CTRL_HOME",
        "CTRL_END",
        "ALT_C",
        "SHIFT_INSERT",
        "CTRL_INSERT",
      ].includes(key)
    );
  }

  get width(): number {
    return this._width;
  }
  get height(): number {
    return this._height;
  }

  fullscreen(enabled: boolean) {
    if (enabled) {
      process.stdout.write("\u001B[?1049h"); // Enter alternate screen
    } else {
      process.stdout.write("\u001B[?1049l"); // Exit alternate screen
    }
  }

  grabInput(enabled: boolean) {
    if (enabled) {
      process.stdin.setRawMode(true);
    } else {
      process.stdin.setRawMode(false);
    }
  }

  on(event: string, listener: (...args: any[]) => void) {
    if (event === "key") {
      this.keyListeners.push(listener);
    } else if (event === "resize") {
      this.resizeListeners.push(listener);
    }
  }

  off(event: string, listener: (...args: any[]) => void) {
    if (event === "key") {
      const index = this.keyListeners.indexOf(listener);
      if (index > -1) this.keyListeners.splice(index, 1);
    } else if (event === "resize") {
      const index = this.resizeListeners.indexOf(listener);
      if (index > -1) this.resizeListeners.splice(index, 1);
    }
  }

  moveTo(x: number, y: number) {
    process.stdout.write(ansiEscapes.cursorTo(x, y));
  }

  clear() {
    process.stdout.write(ansiEscapes.clearScreen);
  }

  eraseLine() {
    process.stdout.write(ansiEscapes.eraseLine);
  }

  eraseLineAfter() {
    process.stdout.write(ansiEscapes.eraseLine);
  }

  hideCursor() {
    process.stdout.write(cursor.hide);
  }

  restoreCursor() {
    process.stdout.write(cursor.show);
  }

  styleReset() {
    process.stdout.write(ansiEscapes.cursorShow + "\u001B[0m"); // Reset colors
  }

  bgColor(color: string) {
    const colorMap: Record<string, string> = {
      black: "\u001B[40m",
      white: "\u001B[47m",
      red: "\u001B[41m",
      green: "\u001B[42m",
      yellow: "\u001B[43m",
      blue: "\u001B[44m",
      magenta: "\u001B[45m",
      cyan: "\u001B[46m",
      brown: "\u001B[43m",
    };
    process.stdout.write(colorMap[color] || "");
    return this;
  }

  color(color: string) {
    const colorMap: Record<string, string> = {
      black: "\u001B[30m",
      white: "\u001B[37m",
      red: "\u001B[31m",
      green: "\u001B[32m",
      yellow: "\u001B[33m",
      blue: "\u001B[34m",
      magenta: "\u001B[35m",
      cyan: "\u001B[36m",
      gray: "\u001B[90m",
    };
    process.stdout.write(colorMap[color] || "");
    return this;
  }

  inputField(options: { echo: boolean }): { promise: Promise<string> } {
    return {
      promise: new Promise((resolve) => {
        const prompt = "> ";
        process.stdout.write(prompt);

        let input = "";
        const onData = (data: Buffer) => {
          const char = data.toString();

          if (char === "\n" || char === "\r") {
            process.stdout.write("\n");
            process.stdin.removeListener("data", onData);
            resolve(input);
            return;
          }

          if (char === "\u0003") {
            // Ctrl+C
            process.stdout.write("\n");
            process.stdin.removeListener("data", onData);
            resolve("");
            return;
          }

          if (char === "\u007F" || char === "\b") {
            // Backspace
            if (input.length > 0) {
              input = input.slice(0, -1);
              process.stdout.write("\b \b");
            }
          } else if (options.echo) {
            input += char;
            process.stdout.write(char);
          } else {
            input += char;
            process.stdout.write("*");
          }
        };

        process.stdin.on("data", onData);
      }),
    };
  }

  yesOrNo(options: { yes: string[]; no: string[] }): { promise: Promise<boolean | null> } {
    return {
      promise: new Promise((resolve) => {
        const prompt = "(y/N) ";
        process.stdout.write(prompt);

        const onData = (data: Buffer) => {
          const char = data.toString().toLowerCase();

          if (char === "\n" || char === "\r") {
            process.stdout.write("\n");
            process.stdin.removeListener("data", onData);
            resolve(false); // Default to no
            return;
          }

          if (char === "\u0003") {
            // Ctrl+C
            process.stdout.write("\n");
            process.stdin.removeListener("data", onData);
            resolve(null);
            return;
          }

          if (options.yes.includes(char)) {
            process.stdout.write(char + "\n");
            process.stdin.removeListener("data", onData);
            resolve(true);
            return;
          }

          if (options.no.includes(char)) {
            process.stdout.write(char + "\n");
            process.stdin.removeListener("data", onData);
            resolve(false);
            return;
          }
        };

        process.stdin.on("data", onData);
      }),
    };
  }

  // Callable interface for writing text
  write(text: string) {
    process.stdout.write(text);
  }

  red(text: string) {
    process.stdout.write("\u001B[31m" + text + "\u001B[0m");
  }

  destroy() {
    this.rl.close();
    process.stdin.setRawMode(false);
    process.stdin.pause();
  }
}

const term = new TerminalInterface();

// --- Interfaces ---
interface EditorTheme {
  text: (str: string) => string;
  statusBarBg: (str: string) => string;
  statusBarText: (str: string) => string;
  highlight: (str: string) => string;
  lineNumber: (str: string) => string;
}

interface EditorConfig {
  syntaxHighlighting?: boolean;
  theme?: "auto" | "light" | "dark";
  defaultAllowSaveAs?: boolean;
  defaultAllowOpen?: boolean;
  defaultAutoCloseOnSave?: boolean;
  defaultReturnContentOnSave?: boolean;
  // Allow other properties potentially loaded
  [key: string]: any;
}

interface EditorOptions {
  filename?: string | null;
  initialContent?: string | null;
  onSave?: (
    content: string,
    filename: string | null,
  ) => Promise<string | boolean | undefined> | string | boolean | undefined;
  onExit?: (
    content: string | null,
    saved: boolean,
    filename: string | null,
  ) => Promise<void> | void;
  configOverrides?: Partial<EditorConfig>;
  allowSaveAs?: boolean;
  allowOpen?: boolean;
  autoCloseOnSave?: boolean;
  returnContentOnSave?: boolean;
  mode?: string;
  cwd?: string;
}

interface EditorState {
  lines: string[];
  cursorX: number;
  cursorY: number;
  topLine: number;
  leftCol: number;
  filename: string | null;
  originalContent: string;
  modified: boolean;
  statusMessage: string;
  lastSearchTerm: string;
  editorConfig: EditorConfig;
  hooks: {
    onSave?: EditorOptions["onSave"];
    onExit?: EditorOptions["onExit"];
  };
  options: {
    // Resolved options combining defaults, config, and overrides
    filename?: string | null;
    initialContent?: string | null;
    configOverrides?: Partial<EditorConfig>;
    allowSaveAs: boolean; // Non-optional after resolution
    allowOpen: boolean; // Non-optional after resolution
    autoCloseOnSave: boolean; // Non-optional after resolution
    returnContentOnSave: boolean; // Non-optional after resolution
    mode?: string;
    cwd?: string;
  };
  clipboard: string[];
  isRunning: boolean;
  theme: EditorTheme;
  syntaxHighlightToggle: boolean;
  exitResolver: ((value: EditorExitResult) => void) | null;
  exitRejecter: ((reason?: any) => void) | null;
}

// --- Editor State ---
let state: EditorState = {
  lines: [""], // Document content as an array of strings
  cursorX: 0, // Horizontal cursor position (0-based index within the line string)
  cursorY: 0, // Vertical cursor position (0-based line index)
  topLine: 0, // Index of the top visible line in the viewport
  leftCol: 0, // Index of the leftmost visible column (for horizontal scroll - basic impl)
  filename: null, // Current file path
  originalContent: "", // Content when the file was opened/saved last
  modified: false, // Has the file been modified?
  statusMessage: "", // Message to display in the status bar
  lastSearchTerm: "",
  editorConfig: {}, // Loaded configuration
  hooks: {}, // Callbacks { onSave, onExit }
  options: {
    // Default options before resolution
    allowSaveAs: true,
    allowOpen: true,
    autoCloseOnSave: false,
    returnContentOnSave: false,
  },
  clipboard: [], // Simple line-based clipboard
  isRunning: true, // Flag to control the main loop
  theme: {
    // Default Light Theme
    text: (str) => str,
    statusBarBg: (str) => re.bgBrown(str),
    statusBarText: (str) => re.white(str),
    highlight: (str) => re.bgYellow(re.black(str)), // For search results, etc.
    lineNumber: (str) => re.blue(str),
  },
  syntaxHighlightToggle: false, // Toggled state for syntax highlighting
  exitResolver: null,
  exitRejecter: null,
};

// --- Configuration Loading ---
// async function loadEditorConfig(
//   cwd: string = process.cwd(),
//   overrides: Partial<EditorConfig> = {},
// ): Promise<EditorConfig> {
//   const { config } = await loadConfig<EditorConfig>({
//     name: "minedit",
//     cwd,
//     defaults: {
//       // Low priority defaults
//       syntaxHighlighting: false,
//       theme: "auto",
//       defaultAllowSaveAs: true,
//       defaultAllowOpen: true,
//       defaultAutoCloseOnSave: false,
//       defaultReturnContentOnSave: false,
//     },
//     // user provided overrides during programmatic call have higher priority
//     overrides: overrides,
//   });
//   return config || {}; // Ensure we return an object
// }

// --- Theme Setup ---
function setupTheme(configTheme: EditorConfig["theme"]) {
  let mode = configTheme;
  if (mode === "auto") {
    const termBg = process.env.COLORFGBG;
    mode = termBg && termBg.split(";")[1] === "0" ? "dark" : "light";
    if (!termBg) mode = "light"; // Default to light if detection fails
  }

  if (mode === "dark") {
    state.theme = {
      text: (str) => re.white(str),
      statusBarBg: (str) => re.bgWhite(str),
      statusBarText: (str) => re.black(str),
      highlight: (str) => re.bgYellow(re.black(str)),
      lineNumber: (str) => re.blue(str),
    };
    term.bgColor("black").color("white");
  } else {
    // Light mode (default)
    state.theme = {
      text: (str) => re.black(str),
      statusBarBg: (str) => re.bgBrown(str),
      statusBarText: (str) => re.white(str),
      highlight: (str) => re.bgCyan(re.black(str)),
      lineNumber: (str) => re.gray(str),
    };
    term.bgColor("white").color("black");
  }
  term.styleReset(); // Apply initial colors
}

// --- Utility Functions ---
// Removed unused getVisibleLines

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(value, max));
}

function getCurrentLine(): string {
  return state.lines[state.cursorY] || "";
}

function updateModifiedStatus() {
  const currentContent = state.lines.join("\n");
  state.modified = currentContent !== state.originalContent;
}

// --- Rendering ---
function renderStatusBar() {
  const { width } = term;
  const filename = state.filename ? path.basename(state.filename) : "[No Name]";
  const modifiedIndicator = state.modified ? "*" : "";
  const position = `L: ${state.cursorY + 1} C: ${state.cursorX + 1}`;
  const fileInfo = `${filename}${modifiedIndicator} - ${state.lines.length} lines`;

  const leftPart = ` ${fileInfo} `;
  const rightPart = ` ${position} `;
  // Basic key hints - make dynamic based on mode/options
  let hints =
    " Ctrl+S:Save | Ctrl+A:SaveAs | Ctrl+O:Open | Ctrl+X:Save&Exit | Ctrl+C:Exit | Ctrl+F:Find ";
  if (!state.options.allowSaveAs) {
    hints = hints.replace("Ctrl+A:SaveAs | ", "");
  }
  if (!state.options.allowOpen) {
    hints = hints.replace("Ctrl+O:Open | ", "");
  }

  const remainingWidth = width - leftPart.length - rightPart.length;
  const hintPadding = Math.max(0, remainingWidth - hints.length);
  const middlePart = hints + " ".repeat(hintPadding);

  const statusBar = leftPart + middlePart + rightPart;
  term.moveTo(1, term.height - 1);
  term.write(state.theme.statusBarBg(state.theme.statusBarText(statusBar.padEnd(width))));
}

function renderMessageBar() {
  term.moveTo(1, term.height);
  term.eraseLine();
  if (state.statusMessage) {
    term.write(state.theme.highlight(state.statusMessage.slice(0, term.width)));
    // Clear message after a delay
    setTimeout(() => {
      if (state.isRunning) {
        // Check if editor is still active
        state.statusMessage = "";
        render(); // Re-render to clear message
      }
    }, 3000);
  }
}

function applySyntaxHighlighting(line: string): string {
  if (!state.editorConfig.syntaxHighlighting || !state.syntaxHighlightToggle) {
    return state.theme.text(line);
  }
  // Very basic example
  let highlightedLine = line;
  highlightedLine = highlightedLine.replace(/(\/\/.*)/g, (match) => re.green(match)); // Comments
  highlightedLine = highlightedLine.replace(/(['"`].*?['"`])/g, (match) => re.magenta(match)); // Strings
  highlightedLine = highlightedLine.replace(
    /\b(const|let|var|function|return|if|else|for|while|import|export|from|default|async|await|new|this)\b/g,
    (match) => re.blue(match),
  ); // Keywords
  highlightedLine = highlightedLine.replace(/(\d+)/g, (match) => re.cyan(match)); // Numbers
  // Apply default text color to the entire potentially modified line
  // This ensures parts not matched by regex still get the base theme color.
  // A more sophisticated approach would tokenize and color segments.
  return state.theme.text(highlightedLine);
}

function renderEditor() {
  const { height, width } = term;
  const editorHeight = height - 2; // Leave room for status and message bar

  // Adjust scroll if cursor is out of view
  if (state.cursorY < state.topLine) {
    state.topLine = state.cursorY;
  } else if (state.cursorY >= state.topLine + editorHeight) {
    state.topLine = state.cursorY - editorHeight + 1;
  }

  // Basic Horizontal Scroll Adjustment
  const displayWidth = width - 4; // Leave space for line numbers
  if (state.cursorX < state.leftCol) {
    state.leftCol = state.cursorX;
  } else if (state.cursorX >= state.leftCol + displayWidth) {
    state.leftCol = state.cursorX - displayWidth + 1;
  }
  state.leftCol = Math.max(0, state.leftCol); // Ensure leftCol is not negative

  for (let y = 0; y < editorHeight; y++) {
    const fileLineIndex = state.topLine + y;
    term.moveTo(1, y + 1); // Move to start of line
    if (fileLineIndex < state.lines.length) {
      const lineNum = String(fileLineIndex + 1).padStart(3);
      // Use template literal here
      term.write(state.theme.lineNumber(`${lineNum} `)); // Line number

      const line = state.lines[fileLineIndex];
      const displayLine = line?.substring(state.leftCol, state.leftCol + displayWidth);

      // Apply syntax highlighting here before printing
      const highlightedDisplayLine = applySyntaxHighlighting(displayLine ?? "");

      term.write(highlightedDisplayLine);
      term.eraseLineAfter(); // Clear rest of the terminal line
    } else {
      term.eraseLine(); // Clear empty terminal lines below content
    }
  }
}

function render() {
  if (!state.isRunning) return; // Don't render if not running
  term.hideCursor();
  term.clear();
  renderEditor();
  renderStatusBar();
  renderMessageBar();
  // Position cursor relative to viewport and account for line numbers
  const screenX = state.cursorX - state.leftCol + 4 + 1; // +4 for line num, +1 for 1-based term coords
  const screenY = state.cursorY - state.topLine + 1; // +1 for 1-based term coords
  term.moveTo(clamp(screenX, 5, term.width), clamp(screenY, 1, term.height - 2));
  term.restoreCursor();
}

// --- Editing Operations ---
function insertChar(char: string) {
  const line = getCurrentLine();
  const newLine = line.slice(0, state.cursorX) + char + line.slice(state.cursorX);
  state.lines[state.cursorY] = newLine;
  state.cursorX++;
  updateModifiedStatus();
}

function deleteCharBackward() {
  if (state.cursorX > 0) {
    const line = getCurrentLine();
    const newLine = line.slice(0, state.cursorX - 1) + line.slice(state.cursorX);
    state.lines[state.cursorY] = newLine;
    state.cursorX--;
    updateModifiedStatus();
  } else if (state.cursorY > 0) {
    // Join with previous line
    const currentLine = state.lines.splice(state.cursorY, 1)[0];
    state.cursorY--;
    const prevLine = state.lines[state.cursorY];
    state.cursorX = prevLine?.length ?? 0;
    state.lines[state.cursorY] = prevLine + (currentLine ?? "");
    updateModifiedStatus();
  }
}

function deleteCharForward() {
  const line = getCurrentLine();
  if (state.cursorX < line.length) {
    const newLine = line.slice(0, state.cursorX) + line.slice(state.cursorX + 1);
    state.lines[state.cursorY] = newLine;
    updateModifiedStatus();
  } else if (state.cursorY < state.lines.length - 1) {
    // Join with next line
    const nextLine = state.lines.splice(state.cursorY + 1, 1)[0];
    state.lines[state.cursorY] = line + nextLine;
    updateModifiedStatus();
  }
}

function insertNewline() {
  const line = getCurrentLine();
  const beforeCursor = line.slice(0, state.cursorX);
  const afterCursor = line.slice(state.cursorX);
  state.lines[state.cursorY] = beforeCursor;
  state.lines.splice(state.cursorY + 1, 0, afterCursor);
  state.cursorY++;
  state.cursorX = 0;
  state.leftCol = 0; // Reset horizontal scroll on new line
  updateModifiedStatus();
}

function copyLine() {
  if (state.lines.length > 0) {
    state.clipboard = [getCurrentLine()];
    state.statusMessage = "Line copied";
  }
}

function cutLine() {
  if (state.lines.length > 0) {
    state.clipboard = state.lines.splice(state.cursorY, 1);
    // If we deleted the last line, inject an empty one back
    if (state.lines.length === 0) {
      state.lines.push("");
    }
    // Adjust cursor if it's now beyond the last line
    state.cursorY = clamp(state.cursorY, 0, state.lines.length - 1);
    state.cursorX = 0; // Move cursor to beginning of the (potentially new) current line
    updateModifiedStatus();
    state.statusMessage = "Line cut";
  }
}

function pasteLine() {
  if (state.clipboard.length > 0) {
    // Insert lines from clipboard below the current line
    state.lines.splice(state.cursorY + 1, 0, ...state.clipboard);
    state.cursorY += state.clipboard.length; // Move cursor to the last pasted line
    state.cursorX = 0;
    updateModifiedStatus();
    state.statusMessage = `${state.clipboard.length} line(s) pasted`;
  }
}

// --- Navigation ---
function moveCursor(dx: number, dy: number) {
  state.cursorY = clamp(state.cursorY + dy, 0, state.lines.length - 1);
  // Adjust X based on the new line's length
  const currentLineLength = getCurrentLine().length;
  state.cursorX = clamp(state.cursorX + dx, 0, currentLineLength);

  // If moving vertically, try to maintain horizontal position relative to line length
  if (dy !== 0) {
    state.cursorX = clamp(state.cursorX, 0, getCurrentLine().length);
  }
}

function pageMove(direction: number) {
  const { height } = term;
  const editorHeight = height - 2;
  const step = direction * (editorHeight - 1); // Move almost a full page

  // Move cursor first
  state.cursorY = clamp(state.cursorY + step, 0, state.lines.length - 1);

  // Then adjust scroll based on new cursor position (the render function will fine-tune)
  state.topLine = clamp(state.topLine + step, 0, Math.max(0, state.lines.length - editorHeight));
  // Ensure cursor stays within the new viewport bounds roughly
  if (state.cursorY < state.topLine) {
    state.topLine = state.cursorY;
  } else if (state.cursorY >= state.topLine + editorHeight) {
    state.topLine = state.cursorY - editorHeight + 1;
  }

  // Adjust X to be within the new line's bounds
  state.cursorX = clamp(state.cursorX, 0, getCurrentLine().length);
}

function jumpToLineEdge(pos: "start" | "end") {
  if (pos === "start") {
    state.cursorX = 0;
  } else if (pos === "end") {
    state.cursorX = getCurrentLine().length;
  }
  state.leftCol = 0; // Reset horizontal scroll when jumping
}

function jumpToDocumentEdge(pos: "start" | "end") {
  if (pos === "start") {
    state.cursorY = 0;
    state.cursorX = 0;
    state.topLine = 0;
  } else if (pos === "end") {
    state.cursorY = state.lines.length - 1;
    state.cursorX = getCurrentLine().length;
    // Adjust topLine so the last line is visible
    const { height } = term;
    const editorHeight = height - 2;
    state.topLine = Math.max(0, state.lines.length - editorHeight);
  }
  state.leftCol = 0;
}

// --- File Operations ---
async function promptForFilename(promptMessage = "File path: "): Promise<string | null> {
  renderStatusBar(); // Update status bar before prompt
  renderMessageBar(); // Render any existing message first
  term.moveTo(1, term.height); // Move to message bar line for input
  term.eraseLine();
  // Use template literal
  term.write(promptMessage);
  try {
    const input = await term.inputField({ echo: true }).promise;
    term.moveTo(1, term.height); // Clean up prompt line
    term.eraseLine();
    return input ? input.trim() : null;
  } catch (_error) {
    // Use _error as it's intentionally unused
    term.moveTo(1, term.height); // Clean up on error/cancel
    term.eraseLine();
    state.statusMessage = "Cancelled";
    render(); // Re-render to show cancellation message
    return null;
  }
}

async function confirmAction(promptMessage = "Are you sure? (y/N)"): Promise<boolean> {
  renderStatusBar();
  renderMessageBar();
  term.moveTo(1, term.height);
  term.eraseLine();
  term.write(`${promptMessage} `); // Use template literal
  try {
    const confirm = await term.yesOrNo({
      yes: ["y", "Y"],
      no: ["n", "N", "ENTER"],
    }).promise;
    term.moveTo(1, term.height);
    term.eraseLine();
    return confirm ?? false;
  } catch (_error) {
    // Use _error as it's intentionally unused
    term.moveTo(1, term.height);
    term.eraseLine();
    state.statusMessage = "Cancelled";
    render(); // Re-render to show cancellation message
    return false;
  }
}

async function saveFile(): Promise<boolean> {
  if (!state.filename) {
    return saveAsFile(); // Requires filename if not set
  }

  let contentToSave = state.lines.join("\n");
  let proceed = true;

  // --- Pre-save Hook ---
  if (state.hooks?.onSave) {
    try {
      const hookResult = await state.hooks.onSave(contentToSave, state.filename);
      if (hookResult === false) {
        state.statusMessage = "Save prevented by hook.";
        proceed = false;
      } else if (typeof hookResult === "string") {
        contentToSave = hookResult; // Allow hook to modify content
        state.lines = contentToSave.split("\n"); // Update internal state
        state.statusMessage = "Content modified by pre-save hook.";
        // Re-evaluate modified status if hook changed content
        updateModifiedStatus();
      }
      // If hook returns true or undefined, proceed normally
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      state.statusMessage = `Error in onSave hook: ${errorMessage}`;
      relinka("error", "onSave Hook Error:", error);
      proceed = false; // Don't save if hook fails
    }
  }

  if (!proceed) {
    render();
    return false; // Indicate save was prevented or failed
  }

  // --- Check if content should be returned instead of writing ---
  const returnContent = state.options.returnContentOnSave;

  if (returnContent) {
    state.originalContent = contentToSave; // Mark as "saved"
    state.modified = false;
    state.statusMessage = `Content prepared. ${state.filename || ""}`;
    render();
    // Resolve the main promise if editor should close
    if (state.options.autoCloseOnSave) {
      await cleanupAndExit(true, contentToSave); // Pass content back
    }
    return true; // Indicate success (content is ready)
  }

  // --- Actual File Write ---
  try {
    await writeFile(state.filename, contentToSave);
    state.originalContent = contentToSave; // Update original content marker
    state.modified = false;
    state.statusMessage = `Saved to ${state.filename}`;
    render();

    // --- Auto-close After Save ---
    if (state.options.autoCloseOnSave) {
      await cleanupAndExit(true); // Exit after successful save
    }
    return true; // Indicate save success
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    state.statusMessage = `Error saving file: ${errorMessage}`;
    relinka("error", "Save Error:", error);
    render();
    return false; // Indicate save failure
  }
}

async function saveAsFile(): Promise<boolean> {
  if (!state.options.allowSaveAs) {
    state.statusMessage = "Save As is disabled in this mode.";
    render();
    return false;
  }
  const newFilename = await promptForFilename("Save As: ");
  if (newFilename) {
    // Resolve the path relative to cwd if provided, otherwise process.cwd()
    const cwd = state.options.cwd || process.cwd();
    state.filename = path.resolve(cwd, newFilename);
    return saveFile(); // Call regular save
  }
  state.statusMessage = "Save As cancelled.";
  render();
  return false;
}

async function openFilePrompt(): Promise<void> {
  if (!state.options.allowOpen) {
    state.statusMessage = "Opening files is disabled in this mode.";
    render();
    return;
  }
  if (state.modified) {
    const shouldSave = await confirmAction(
      `Save changes to ${state.filename || "current file"}? (Y/n)`,
    );
    // confirmAction returns boolean, no undefined check needed here

    if (shouldSave) {
      const saved = await saveFile(); // saveFile handles saveAs if needed
      if (!saved) {
        // If save failed (could be regular save or Save As)
        state.statusMessage = "Save failed or cancelled. Open cancelled.";
        render();
        return;
      }
      // If saved successfully, proceed to open prompt
    }
    // If 'no', proceed without saving
  }

  const fileToOpen = await promptForFilename("Open file: ");
  if (fileToOpen) {
    await loadFile(fileToOpen);
  } else {
    state.statusMessage = "Open cancelled.";
    render();
  }
}

async function loadFile(filePath: string): Promise<void> {
  try {
    // Resolve the path relative to cwd if provided, otherwise process.cwd()
    const cwd = state.options.cwd || process.cwd();
    const absolutePath = path.resolve(cwd, filePath);
    let content = "";
    try {
      content = await readFile(absolutePath, "utf-8");
      state.statusMessage = `Opened ${absolutePath}`;
    } catch (error: any) {
      // Catch specific error types
      if (error && error.code === "ENOENT") {
        // File doesn't exist, treat as new file
        content = "";
        state.statusMessage = `New file: ${absolutePath}`;
      } else {
        throw error; // Re-throw other errors
      }
    }

    state.lines = content.split("\n");
    // Handle potential empty file resulting in [''] - ensure at least one line
    if (
      state.lines.length === 0 ||
      (state.lines.length === 1 && state.lines[0] === "" && content.length > 0)
    ) {
      // If split resulted in empty array, or it's [""] but original content wasn't empty (e.g. just "\n"), reset to [""]
      // A file with just "\n" should result in ["", ""] from split.
      // A file with "" (0 bytes) should result in [""]
      // An empty file `content = ""` -> `content.split("\n")` -> `[""]` - this is correct.
      // A file with `content = "\n"` -> `content.split("\n")` -> `["", ""]`
      // A file with `content = "a\n"` -> `content.split("\n")` -> `["a", ""]`
      // If `split` gives `[""]` but `content` was not "", something is off, ensure it's at least `[""]`
      // If `split` gives `[]`, ensure it's `[""]`
      if (state.lines.length === 0) state.lines = [""];
    }

    state.filename = absolutePath;
    state.originalContent = content;
    state.modified = false;
    state.cursorX = 0;
    state.cursorY = 0;
    state.topLine = 0;
    state.leftCol = 0;
    render();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    state.statusMessage = `Error opening file: ${errorMessage}`;
    relinka("error", "Open Error:", error);
    // Keep existing buffer content if open fails
    render();
  }
}

// --- Search ---
async function findText(): Promise<void> {
  const searchTerm = await promptForFilename(
    `Find (Leave empty to cancel, Prev: ${state.lastSearchTerm}): `,
  );
  if (searchTerm === null) {
    // User cancelled prompt (e.g. ESC)
    state.statusMessage = "Find cancelled.";
    render();
    return;
  }
  if (!searchTerm && !state.lastSearchTerm) {
    state.statusMessage = "No search term provided.";
    render();
    return;
  }

  const termToUse = searchTerm || state.lastSearchTerm;
  if (!termToUse) return; // Should be covered above, but safety check

  state.lastSearchTerm = termToUse;
  state.statusMessage = `Searching for: ${termToUse}`;

  let found = false;
  // Start search from the line *after* the cursor
  for (let y = state.cursorY; y < state.lines.length; y++) {
    const line = state.lines[y];
    // Start searching after cursor pos on the current line, otherwise from start
    const startIdx = y === state.cursorY ? state.cursorX + 1 : 0;
    const matchIndex = line?.indexOf(termToUse, startIdx) ?? -1;
    if (matchIndex !== -1) {
      state.cursorY = y;
      state.cursorX = matchIndex;
      found = true;
      break;
    }
  }

  // If not found from cursor onwards, wrap around and search from the beginning
  if (!found) {
    state.statusMessage = `Search wrapped: ${termToUse}`;
    for (let y = 0; y <= state.cursorY; y++) {
      const line = state.lines[y];
      // On the cursor line search only up to the original cursor pos
      const endIdx = y === state.cursorY ? state.cursorX + 1 : (line?.length ?? 0); // Search whole line if wrapping
      const matchIndex = line?.substring(0, endIdx).indexOf(termToUse) ?? -1;
      if (matchIndex !== -1) {
        state.cursorY = y;
        state.cursorX = matchIndex;
        found = true;
        break;
      }
    }
  }

  if (found) {
    // Ensure found text is visible (render will handle scrolling)
    state.statusMessage = `Found: ${termToUse} at L:${state.cursorY + 1}, C:${state.cursorX + 1}`;
  } else {
    state.statusMessage = `Not found: ${termToUse}`;
  }
  render();
}

// --- Input Handling ---
async function handleInput(
  key: string,
  _matches: string[],
  data: { isCharacter: boolean; code: number | Buffer; codepoint: number },
): Promise<void> {
  let handled = true; // Assume handled unless default action is needed

  if (data.isCharacter) {
    insertChar(key);
  } else {
    switch (key) {
      // --- Hotkeys ---
      case "CTRL_S":
        await saveFile();
        break;
      case "CTRL_A":
        if (state.options.allowSaveAs) {
          await saveAsFile();
        } else {
          state.statusMessage = "Save As disabled.";
        }
        break;
      case "CTRL_O":
        if (state.options.allowOpen) {
          await openFilePrompt();
        } else {
          state.statusMessage = "Open disabled.";
        }
        break;
      case "CTRL_X":
        if (state.modified) {
          const saved = await saveFile();
          if (saved) {
            // Exit if saved successfully (saveFile handles autoClose logic)
            // If autoCloseOnSave is false, saveFile returns true but doesn't exit
            if (!state.options.autoCloseOnSave) {
              await cleanupAndExit(true); // Explicitly exit if not auto-closed
            }
          } else if (!state.filename && !saved) {
            // If it was a new file and Save As was cancelled/failed
            state.statusMessage = "Save failed or cancelled. Exit cancelled.";
          } else if (state.filename && !saved) {
            // If it was an existing file and save failed
            state.statusMessage = "Save failed. Exit cancelled.";
          }
        } else {
          await cleanupAndExit(false); // No modifications, just exit
        }
        break;
      case "CTRL_C":
        if (state.modified) {
          const confirm = await confirmAction("Discard changes? (y/N)");
          if (confirm) {
            await cleanupAndExit(false);
          } else {
            state.statusMessage = "Exit cancelled.";
          }
        } else {
          await cleanupAndExit(false);
        }
        break;
      case "CTRL_F":
        await findText();
        break;
      case "CTRL_K": // Simple Cut Line (like nano)
        cutLine();
        break;
      case "CTRL_U": // Simple Paste Line (like nano)
        pasteLine();
        break;
      case "ALT_C": // Simple Copy Line (Alternative binding)
      case "CTRL_INSERT": // Common copy binding
        copyLine();
        break;
      case "SHIFT_INSERT": // Common paste binding
        pasteLine();
        break;
      case "CTRL_T": {
        // Added braces to fix noSwitchDeclarations
        state.syntaxHighlightToggle = !state.syntaxHighlightToggle;
        state.statusMessage = `Syntax Highlighting: ${state.syntaxHighlightToggle ? "ON" : "OFF"}`;
        break;
      }

      // --- Navigation ---
      case "UP":
        moveCursor(0, -1);
        break;
      case "DOWN":
        moveCursor(0, 1);
        break;
      case "LEFT":
        moveCursor(-1, 0);
        break;
      case "RIGHT":
        moveCursor(1, 0);
        break;
      case "PAGE_UP":
        pageMove(-1);
        break;
      case "PAGE_DOWN":
        pageMove(1);
        break;
      case "HOME":
        jumpToLineEdge("start");
        break;
      case "END":
        jumpToLineEdge("end");
        break;
      case "CTRL_HOME":
        jumpToDocumentEdge("start");
        break;
      case "CTRL_END":
        jumpToDocumentEdge("end");
        break;

      // --- Editing ---
      case "BACKSPACE":
        deleteCharBackward();
        break;
      case "DELETE":
        deleteCharForward();
        break;
      case "ENTER":
        insertNewline();
        break;
      case "TAB":
        // Basic tab implementation (insert spaces)
        {
          // Use block scope for const
          const tabWidth = 4;
          for (let i = 0; i < tabWidth; i++) insertChar(" ");
        }
        break;

      default:
        handled = false; // Let terminal handle other keys if needed
        // state.statusMessage = `Unrecognized key: ${key} ${data.code || ''} ${data.isCharacter}`;
        break;
    }
  }

  if (handled && state.isRunning) {
    updateModifiedStatus(); // Update modified status after any potential change
    render(); // Re-render after handling input
  }
}

// --- Editor Lifecycle ---
async function cleanupAndExit(saved = false, content: string | null = null): Promise<void> {
  if (!state.isRunning) return; // Prevent double-exit issues
  state.isRunning = false; // Stop input loop and rendering

  // Determine content to pass to hooks/resolve
  const exitContent = content ?? (saved ? state.lines.join("\n") : null);

  // Call onExit hook if provided
  if (state.hooks?.onExit) {
    try {
      await state.hooks.onExit(exitContent, saved, state.filename);
    } catch (error) {
      relinka("error", "onExit Hook Error:", error);
      // Decide if the error should prevent exit (probably not usually)
    }
  }

  // Clean up terminal
  term.off("key", handleInputWrapper);
  term.off("resize", handleResize);
  term.hideCursor();
  term.grabInput(false);
  term.fullscreen(false);
  term.styleReset();
  term.clear(); // Clear the screen on exit

  // Resolve the main promise for programmatic usage
  if (state.exitResolver) {
    state.exitResolver({
      saved,
      content: exitContent,
      filename: state.filename,
    });
    state.exitResolver = null; // Clear resolver
    state.exitRejecter = null; // Clear rejecter
  } else {
    // If run directly, exit the process
    process.exit(0);
  }
}

// Use _width and _height as they are intentionally unused
function handleResize(_width: number, _height: number): void {
  // Re-render on resize to adapt layout
  if (state.isRunning) {
    render();
  }
}

let isHandlingInput = false;
async function handleInputWrapper(key: string, matches: string[], data: any): Promise<void> {
  if (isHandlingInput || !state.isRunning) return; // Prevent re-entrancy and handling after exit called
  isHandlingInput = true;
  try {
    // Pass underscore-prefixed matches since it's unused
    await handleInput(key, matches, data);
  } catch (error) {
    // Log errors during input handling but try to keep editor running
    relinka("error", "Input Handling Error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    state.statusMessage = `Error: ${errorMessage}`;
    render(); // Show error in status bar
  } finally {
    isHandlingInput = false;
  }
}

// Helper function for async setup before Promise creation
async function initializeEditorState(options: EditorOptions): Promise<void> {
  // --- Reset State for potential re-entry ---
  state = {
    // Keep defaults for theme, clipboard, potentially others?
    ...state, // Start with previous state defaults for theme etc.
    lines: [""],
    cursorX: 0,
    cursorY: 0,
    topLine: 0,
    leftCol: 0,
    filename: options.filename || null,
    originalContent: "",
    modified: false,
    statusMessage: "",
    lastSearchTerm: "",
    editorConfig: {}, // Will be loaded/merged below
    hooks: {
      onSave: options.onSave,
      onExit: options.onExit,
    },
    options: {
      // Will be resolved below
      filename: options.filename,
      initialContent: options.initialContent,
      configOverrides: options.configOverrides || {},
      allowSaveAs: true, // Default, will be overridden
      allowOpen: true, // Default, will be overridden
      autoCloseOnSave: false, // Default, will be overridden
      returnContentOnSave: false, // Default, will be overridden
      mode: options.mode || "normal",
      cwd: options.cwd || process.cwd(),
    },
    clipboard: [],
    isRunning: true, // Reset running state
    exitResolver: null, // Will be set by Promise executor
    exitRejecter: null, // Will be set by Promise executor
    syntaxHighlightToggle: false, // Reset toggle state
  };

  // --- Load Configuration ---
  try {
    // const loadedConfig = await loadEditorConfig(state.options.cwd, options.configOverrides);
    state.editorConfig = {
      defaultAllowSaveAs: true,
      defaultAllowOpen: true,
      defaultAutoCloseOnSave: false,
      defaultReturnContentOnSave: false,
      syntaxHighlighting: false,
      theme: "light",
      ...options.configOverrides,
    }; // Store loaded config

    // Determine final behavior based on options > config > defaults
    state.options.allowSaveAs =
      options.allowSaveAs ?? state.editorConfig.defaultAllowSaveAs ?? true;
    state.options.allowOpen = options.allowOpen ?? state.editorConfig.defaultAllowOpen ?? true;
    state.options.autoCloseOnSave =
      options.autoCloseOnSave ?? state.editorConfig.defaultAutoCloseOnSave ?? false;
    state.options.returnContentOnSave =
      options.returnContentOnSave ?? state.editorConfig.defaultReturnContentOnSave ?? false;
    state.syntaxHighlightToggle = state.editorConfig.syntaxHighlighting ?? false; // Initial toggle based on config
    state.theme = {
      // Reset theme based on config
      text: (str) => str,
      statusBarBg: (str) => re.bgBrown(str),
      statusBarText: (str) => re.white(str),
      highlight: (str) => re.bgYellow(re.black(str)),
      lineNumber: (str) => re.blue(str),
    };
    setupTheme(state.editorConfig.theme); // Apply theme based on loaded config
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    relinka("error", "Error loading configuration:", message, error);
    term.red("Failed to load configuration. Using defaults.\n");
    // Ensure critical options have defaults even if config fails
    state.options.allowSaveAs = options.allowSaveAs ?? true;
    state.options.allowOpen = options.allowOpen ?? true;
    state.options.autoCloseOnSave = options.autoCloseOnSave ?? false;
    state.options.returnContentOnSave = options.returnContentOnSave ?? false;
    state.syntaxHighlightToggle = false;
    setupTheme("light"); // Fallback theme
  }

  // --- Load Initial Content ---
  if (options.initialContent !== undefined && options.initialContent !== null) {
    const content = String(options.initialContent);
    state.lines = content.split("\n");
    if (state.lines.length === 0) state.lines = [""]; // Ensure at least one line
    state.originalContent = content;
    state.modified = false; // Initially unmodified
    // Use filename from options if provided, even with initialContent
    state.filename = options.filename || null;
    state.statusMessage = options.filename
      ? `Editing ${path.basename(options.filename)}`
      : "Editing new buffer";
  } else if (options.filename) {
    // loadFile needs state.options.cwd to be set, which it is now
    await loadFile(options.filename); // Load file from disk if specified
  } else {
    // Start with a blank buffer if no content or file given
    state.lines = [""];
    state.originalContent = "";
    state.modified = false;
    state.filename = null;
    state.statusMessage = "New file. Ctrl+S to save.";
  }
}

// --- Main Editor Function (for embedding) ---
export async function startEditor(options: EditorOptions = {}): Promise<EditorExitResult> {
  // Perform all async setup *before* creating the promise
  await initializeEditorState(options);

  // Now, create the promise for the synchronous UI lifecycle part
  return new Promise((resolve, reject) => {
    // Store resolver/rejecter in state so cleanupAndExit can use them
    state.exitResolver = resolve;
    state.exitRejecter = reject;

    // --- Initialize Terminal (Synchronous) ---
    // Theme already set up in initializeEditorState
    try {
      term.fullscreen(true);
      term.grabInput(true);
      term.on("key", handleInputWrapper);
      term.on("resize", handleResize);

      // Initial render
      render();
    } catch (termError) {
      // If terminal setup fails, reject the promise immediately
      state.isRunning = false; // Ensure loops stop
      reject(
        new Error(
          `Terminal initialization failed: ${termError instanceof Error ? termError.message : String(termError)}`,
        ),
      );
      // Attempt basic cleanup if possible
      try {
        term.grabInput(false);
        term.fullscreen(false);
        term.styleReset();
        term.clear();
      } catch (_cleanupErr) {
        /* Ignore cleanup errors */
      }
    }

    // The promise resolves/rejects when cleanupAndExit is called
  });
}

// --- Direct Execution ---
// Use dynamic import check for CJS/ESM compatibility if needed
// Or rely on the `#!/usr/bin/env node` and `.mjs` extension.
const isDirectRun = (() => {
  try {
    // Resolve potential symlinks for robust comparison
    const scriptPath = realpathSync(process.argv[1] || "");
    const modulePath = realpathSync(import.meta.filename);
    return scriptPath === modulePath;
  } catch (_e) {
    // Handle cases where process.argv[1] or import.meta.filename might be invalid/undefined
    // or fs.realpathSync fails (e.g., file doesn't exist)
    return false;
  }
})();

if (isDirectRun) {
  const fileArg = process.argv[2];
  startEditor({ filename: fileArg })
    .then((_result: EditorExitResult) => {
      // Use _result or destructure with _ if unused
      // Optional: Log status after editor exits when run directly
      // const { _saved, _filename } = result; // Example if needing to use prefix
      // relinka("log", `Editor closed. Saved: ${_saved}. File: ${_filename || '[None]'}`);
    })
    .catch((error) => {
      // Cleanup terminal state even on unexpected errors before exiting
      try {
        term.grabInput(false);
        term.fullscreen(false);
        term.styleReset();
        term.clear();
      } catch (_cleanupErr) {
        /* Ignore cleanup errors */
      }
      relinka("error", "\nAn unexpected error occurred:", error);
      process.exit(1);
    });
}
