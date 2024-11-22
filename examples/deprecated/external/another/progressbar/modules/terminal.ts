// lib/terminal.ts

import type { WriteStream } from "tty";

import * as readline from "readline";

/**
 * Low-level terminal interactions.
 */
export default class Terminal {
  private stream: WriteStream;
  private linewrap: boolean;
  private dy: number;

  /**
   * Constructs a new Terminal instance.
   * @param outputStream - The writable stream to interact with (e.g., process.stderr).
   */
  constructor(outputStream: WriteStream) {
    this.stream = outputStream;
    this.linewrap = true; // Default: line wrapping enabled
    this.dy = 0; // Current, relative y position
  }

  /**
   * Saves the current cursor position and settings.
   */
  cursorSave(): void {
    if (!this.stream.isTTY) {
      return;
    }

    // Save cursor position and settings
    this.stream.write("\x1B7");
  }

  /**
   * Restores the last saved cursor position and settings.
   */
  cursorRestore(): void {
    if (!this.stream.isTTY) {
      return;
    }

    // Restore cursor position and settings
    this.stream.write("\x1B8");
  }

  /**
   * Shows or hides the cursor.
   * @param enabled - If true, shows the cursor; otherwise, hides it.
   */
  cursor(enabled: boolean): void {
    if (!this.stream.isTTY) {
      return;
    }

    if (enabled) {
      this.stream.write("\x1B[?25h"); // Show cursor
    } else {
      this.stream.write("\x1B[?25l"); // Hide cursor
    }
  }

  /**
   * Moves the cursor to the specified absolute position.
   * @param x - The column position (optional).
   * @param y - The row position (optional).
   */
  cursorTo(x?: number, y?: number): void {
    if (!this.stream.isTTY) {
      return;
    }

    // Move cursor to absolute position
    readline.cursorTo(this.stream, x ?? 0, y ?? undefined);
  }

  /**
   * Moves the cursor relative to its current position.
   * @param dx - The number of columns to move (optional).
   * @param dy - The number of rows to move (optional).
   */
  cursorRelative(dx?: number, dy?: number): void {
    if (!this.stream.isTTY) {
      return;
    }

    // Update the relative y position
    this.dy += dy ?? 0;

    // Move cursor relative to current position
    readline.moveCursor(this.stream, dx ?? 0, dy ?? 0);
  }

  /**
   * Resets the relative cursor position to the initial state.
   */
  cursorRelativeReset(): void {
    if (!this.stream.isTTY) {
      return;
    }

    // Move cursor back by the accumulated relative y position
    readline.moveCursor(this.stream, 0, -this.dy);

    // Move cursor to the first column of the current row
    readline.cursorTo(this.stream, 0, undefined);

    // Reset the relative y position counter
    this.dy = 0;
  }

  /**
   * Clears the line to the right of the cursor.
   */
  clearRight(): void {
    if (!this.stream.isTTY) {
      return;
    }

    readline.clearLine(this.stream, 1); // 1 = Clear to the right of cursor
  }

  /**
   * Clears the entire current line.
   */
  clearLine(): void {
    if (!this.stream.isTTY) {
      return;
    }

    readline.clearLine(this.stream, 0); // 0 = Clear the entire line
  }

  /**
   * Clears everything below the current line.
   */
  clearBottom(): void {
    if (!this.stream.isTTY) {
      return;
    }

    readline.clearScreenDown(this.stream);
  }

  /**
   * Adds a new line and increments the relative y position.
   */
  newline(): void {
    this.stream.write("\n");
    this.dy++;
  }

  /**
   * Writes content to the output stream.
   * @param s - The string content to write.
   * @param rawWrite - If true, writes the content as-is without trimming.
   */
  write(s: string, rawWrite = false): void {
    // If line wrapping is enabled and not a raw write, trim the output to the terminal width
    if (this.linewrap && !rawWrite) {
      this.stream.write(s.substring(0, this.getWidth()));
    } else {
      // Standard behavior with disabled line wrapping or raw write
      this.stream.write(s);
    }
  }

  /**
   * Controls line wrapping in the terminal.
   * @param enabled - If true, enables line wrapping; otherwise, disables it.
   */
  lineWrapping(enabled: boolean): void {
    if (!this.stream.isTTY) {
      return;
    }

    // Store the state
    this.linewrap = enabled;

    if (enabled) {
      this.stream.write("\x1B[?7h"); // Enable line wrapping
    } else {
      this.stream.write("\x1B[?7l"); // Disable line wrapping
    }
  }

  /**
   * Checks if the output stream is a TTY (teletypewriter) environment.
   * @returns True if the stream is a TTY; otherwise, false.
   */
  isTTY(): boolean {
    return this.stream.isTTY === true;
  }

  /**
   * Retrieves the width of the terminal.
   * @returns The width of the terminal in characters.
   */
  getWidth(): number {
    // Set max width to 80 in TTY mode and 200 in non-TTY mode
    return this.stream.columns || (this.stream.isTTY ? 80 : 200);
  }
}
