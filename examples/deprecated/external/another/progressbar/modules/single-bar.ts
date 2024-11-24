// @ts-nocheck
import type { Options } from "./options.js";

import GenericBar from "./generic-bar.js";
import { parse } from "./options.js";

/**
 * Interface representing payload data.
 */
type Payload = Record<string, any>;

/**
 * Interface for bar options overrides.
 */
type BarOptions = Record<string, any>;

/**
 * SingleBar class extends the GenericBar to handle single progress bars.
 */
export default class SingleBar extends GenericBar {
  private timer: NodeJS.Timeout | null;
  private schedulingRate: number;
  private sigintCallback: (() => void) | null;

  constructor(options: Partial<Options> = {}, preset: Partial<Options> = {}) {
    super(parse(options, preset));

    // Initialize properties
    this.timer = null;

    // Disable synchronous updates in non-TTY mode
    if (this.options.noTTYOutput && !this.terminal.isTTY()) {
      this.options.synchronousUpdate = false;
    }

    // Set update interval based on TTY status
    this.schedulingRate = this.terminal.isTTY()
      ? this.options.throttleTime
      : this.options.notTTYSchedule;

    // Initialize SIGINT/SIGTERM callback
    this.sigintCallback = null;
  }

  /**
   * Internal render function to update the progress bar.
   */
  render(): void {
    // Stop the existing timer
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    // Run internal rendering from GenericBar
    super.render();

    // Add a new line in non-TTY mode
    if (this.options.noTTYOutput && !this.terminal.isTTY()) {
      this.terminal.newline();
    }

    // Schedule the next update
    this.timer = setTimeout(() => this.render(), this.schedulingRate);
  }

  /**
   * Update the progress bar value and optionally the payload.
   * @param current - The new value or payload object.
   * @param payload - Optional payload data if the first argument is a value.
   */
  update(current: number | Payload, payload: Payload = {}): void {
    // If timer is inactive, do not proceed
    if (!this.timer) {
      return;
    }

    // Call the update method from GenericBar
    super.update(current, payload);

    // Trigger synchronous update if conditions are met
    if (
      this.options.synchronousUpdate &&
      this.lastRedraw + this.options.throttleTime * 2 < Date.now()
    ) {
      // Force update by calling render
      this.render();
    }
  }

  /**
   * Start the progress bar.
   * @param total - The total value of the progress bar.
   * @param startValue - The initial value of the progress bar.
   * @param payload - Optional payload data.
   */
  start(total?: number, startValue?: number, payload?: Payload): void {
    // Progress updates are only visible in TTY mode
    if (!this.options.noTTYOutput && !this.terminal.isTTY()) {
      return;
    }

    // Add handlers to restore cursor settings on SIGINT/SIGTERM if gracefulExit is enabled
    if (this.sigintCallback === null && this.options.gracefulExit) {
      this.sigintCallback = this.stop.bind(this);
      process.once("SIGINT", this.sigintCallback);
      process.once("SIGTERM", this.sigintCallback);
    }

    // Save current cursor settings
    this.terminal.cursorSave();

    // Hide the cursor if required
    if (this.options.hideCursor) {
      this.terminal.cursor(false);
    }

    // Disable line wrapping if required
    if (!this.options.linewrap) {
      this.terminal.lineWrapping(false);
    }

    // Initialize and start the progress bar using GenericBar's start method
    super.start(total, startValue, payload);

    // Trigger initial render
    this.render();
  }

  /**
   * Stop the progress bar and restore terminal settings.
   */
  stop(): void {
    // If timer is inactive, do not proceed
    if (!this.timer) {
      return;
    }

    // Remove SIGINT and SIGTERM listeners if they were added
    if (this.sigintCallback) {
      process.removeListener("SIGINT", this.sigintCallback);
      process.removeListener("SIGTERM", this.sigintCallback);
      this.sigintCallback = null;
    }

    // Trigger final rendering
    this.render();

    // Restore state by calling GenericBar's stop method
    super.stop();

    // Stop the update timer
    clearTimeout(this.timer);
    this.timer = null;

    // Show the cursor if it was hidden
    if (this.options.hideCursor) {
      this.terminal.cursor(true);
    }

    // Re-enable line wrapping if it was disabled
    if (!this.options.linewrap) {
      this.terminal.lineWrapping(true);
    }

    // Restore cursor position and settings
    this.terminal.cursorRestore();

    // Clear the line on complete if required
    if (this.options.clearOnComplete) {
      this.terminal.cursorTo(0, null);
      this.terminal.clearLine();
    } else {
      // Add a new line after completion
      this.terminal.newline();
    }
  }
}
