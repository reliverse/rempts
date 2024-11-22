import { EventEmitter } from "events";

import type { Options } from "./options.js";

import GenericBar from "./generic-bar.js";
import { parse } from "./options.js";
import Terminal from "./terminal.js";

/**
 * Interface representing a generic progress bar.
 * Replace this with the actual interface if GenericBar has a more specific type.
 */
type IGenericBar = {} & GenericBar;

/**
 * Interface for payload data.
 */
type Payload = Record<string, any>;

/**
 * Interface for bar options overrides.
 */
type BarOptions = Record<string, any>;

export class MultiBar extends EventEmitter {
  private bars: IGenericBar[];
  private options: Options;
  private terminal: Terminal;
  private timer: NodeJS.Timeout | null;
  private isActive: boolean;
  private schedulingRate: number;
  private loggingBuffer: string[];
  private sigintCallback: (() => void) | null;

  constructor(options: Partial<Options> = {}, preset: Partial<Options> = {}) {
    super();

    // Initialize properties
    this.bars = [];
    this.options = parse(options, preset);

    // Disable synchronous updates
    this.options.synchronousUpdate = false;

    // Store terminal instance
    this.terminal = this.options.terminal
      ? this.options.terminal
      : new Terminal(this.options.stream as unknown as NodeJS.WriteStream);

    // Initialize other properties
    this.timer = null;
    this.isActive = false;
    this.schedulingRate = this.terminal.isTTY()
      ? this.options.throttleTime
      : this.options.notTTYSchedule;
    this.loggingBuffer = [];
    this.sigintCallback = null;
  }

  /**
   * Adds a new bar to the stack.
   * @param total - The total value of the progress bar.
   * @param startValue - The initial value of the progress bar.
   * @param payload - Optional payload data.
   * @param barOptions - Optional overrides for bar-specific options.
   * @returns The created GenericBar instance.
   */
  create(
    total?: number,
    startValue?: number,
    payload?: Payload,
    barOptions: Partial<Options> = {},
  ): IGenericBar {
    // Create new bar element and merge global options with overrides
    const bar = new GenericBar({
      ...this.options,
      terminal: this.terminal,
      ...barOptions,
    });

    // Store bar
    this.bars.push(bar);

    // Progress updates are only visible in TTY mode!
    if (!this.options.noTTYOutput && !this.terminal.isTTY()) {
      return bar;
    }

    // Add handler to restore cursor settings (stop the bar) on SIGINT/SIGTERM
    if (this.sigintCallback === null && this.options.gracefulExit) {
      this.sigintCallback = this.stop.bind(this);
      process.once("SIGINT", this.sigintCallback);
      process.once("SIGTERM", this.sigintCallback);
    }

    // Initialize MultiBar if not active
    if (!this.isActive) {
      // Hide the cursor if required
      if (this.options.hideCursor) {
        this.terminal.cursor(false);
      }

      // Disable line wrapping if required
      if (!this.options.linewrap) {
        this.terminal.lineWrapping(false);
      }

      // Initialize update timer
      // @ts-expect-error TODO: Fix ts
      this.timer = setTimeout(() => this.update(), this.schedulingRate);
    }

    // Set active flag
    this.isActive = true;

    // Start the progress bar
    bar.start(total, startValue, payload);

    // Trigger start event
    this.emit("start");

    return bar;
  }

  /**
   * Removes a bar from the stack.
   * @param bar - The GenericBar instance to remove.
   * @returns A boolean indicating if the bar was successfully removed.
   */
  remove(bar: IGenericBar): boolean {
    const index = this.bars.indexOf(bar);

    if (index < 0) {
      return false;
    }

    // Remove the bar from the stack
    this.bars.splice(index, 1);

    // Force an update to reflect removal
    this.update();

    // Clear the bottom of the terminal
    this.terminal.newline();
    this.terminal.clearBottom();

    return true;
  }

  /**
   * Internal update routine to redraw all bars.
   */
  private update(): void {
    // Stop the existing timer
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    // Trigger update-pre event
    this.emit("update-pre");

    // Reset cursor to initial position
    this.terminal.cursorRelativeReset();

    // Trigger redraw-pre event
    this.emit("redraw-pre");

    // Handle logging buffer if any
    if (this.loggingBuffer.length > 0) {
      this.terminal.clearLine();

      // Flush logging buffer and write content to terminal
      while (this.loggingBuffer.length > 0) {
        const log = this.loggingBuffer.shift();
        if (log !== undefined) {
          this.terminal.write(log, true);
        }
      }
    }

    // Update each bar
    this.bars.forEach((bar, index) => {
      if (index > 0) {
        this.terminal.newline();
      }
      bar.render();
    });

    // Trigger redraw-post event
    this.emit("redraw-post");

    // Add new lines in non-TTY mode
    if (this.options.noTTYOutput && !this.terminal.isTTY()) {
      this.terminal.newline();
      this.terminal.newline();
    }

    // Schedule the next update
    // @ts-expect-error TODO: Fix ts
    this.timer = setTimeout(() => this.update(), this.schedulingRate);

    // Trigger update-post event
    this.emit("update-post");

    // Stop MultiBar if stopOnComplete is true and all bars have completed
    // @ts-expect-error TODO: Fix ts
    if (this.options.stopOnComplete && !this.bars.some((bar) => bar.isActive)) {
      this.stop();
    }
  }

  /**
   * Stops all bars and cleans up the MultiBar instance.
   */
  stop(): void {
    // Stop the update timer
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    // Remove SIGINT and SIGTERM listeners
    if (this.sigintCallback) {
      process.removeListener("SIGINT", this.sigintCallback);
      process.removeListener("SIGTERM", this.sigintCallback);
      this.sigintCallback = null;
    }

    // Set active flag to false
    this.isActive = false;

    // Show the cursor if it was hidden
    if (this.options.hideCursor) {
      this.terminal.cursor(true);
    }

    // Re-enable line wrapping if it was disabled
    if (!this.options.linewrap) {
      this.terminal.lineWrapping(true);
    }

    // Reset cursor position
    this.terminal.cursorRelativeReset();

    // Trigger stop-pre-clear event
    this.emit("stop-pre-clear");

    // Clear lines or show final progress based on options
    if (this.options.clearOnComplete) {
      // Clear all bars from the terminal
      this.terminal.clearBottom();
    } else {
      // Update each bar for final rendering
      this.bars.forEach((bar, index) => {
        if (index > 0) {
          this.terminal.newline();
        }
        bar.render();
        bar.stop();
      });

      // Add a new line after completion
      this.terminal.newline();
    }

    // Trigger stop event
    this.emit("stop");
  }

  /**
   * Logs a message by adding it to the logging buffer.
   * @param s - The string message to log.
   */
  log(s: string): void {
    this.loggingBuffer.push(s);
  }
}
