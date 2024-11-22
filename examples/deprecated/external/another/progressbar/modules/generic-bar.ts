import { EventEmitter } from "events";

import type FormatterFunction from "./formatter.js";
import type { Options } from "./options.js";

import ETA from "./eta.js";
import formatter from "./formatter.js";
import { assignDerivedOptions } from "./options.js";
import Terminal from "./terminal.js";
import type { WriteStream } from "tty";

/**
 * Interface representing formatter parameters.
 */
type Params = {
  progress: number;
  eta: number | string;
  startTime: number | null;
  stopTime: number | null;
  total: number;
  value: number;
  maxWidth: number;
};

/**
 * Interface for payload data.
 */
type Payload = Record<string, any>;

export default class GenericBar extends EventEmitter {
  protected options: Options;
  protected terminal: Terminal;
  protected value: number;
  protected startValue: number;
  protected total: number;
  protected lastDrawnString: string | null;
  protected startTime: number | null;
  protected stopTime: number | null;
  protected lastRedraw: number;
  protected eta: ETA;
  protected payload: Payload;
  protected isActive: boolean;
  protected formatter: typeof FormatterFunction;

  constructor(options: Partial<Options>) {
    super();

    // Store options and assign derived ones (instance specific)
    this.options = assignDerivedOptions(options as Options);

    // Store terminal instance
    this.terminal = this.options.terminal
      ? this.options.terminal
      : new Terminal(this.options.stream as unknown as WriteStream);

    // Initialize properties
    this.value = 0;
    this.startValue = 0;
    this.total = 100;
    this.lastDrawnString = null;
    this.startTime = null;
    this.stopTime = null;
    this.lastRedraw = Date.now();
    this.eta = new ETA(this.options.etaBufferLength, 0, 0);
    this.payload = {};
    this.isActive = false;

    // Use default formatter or custom one
    this.formatter =
      typeof this.options.format === "function"
        ? this.options.format
        : formatter;
  }

  // Internal render function
  render(forceRendering = false): void {
    // Formatter params
    const params: Params = {
      progress: this.getProgress(),
      eta: this.eta.getTime(),
      startTime: this.startTime,
      stopTime: this.stopTime,
      total: this.total,
      value: this.value,
      maxWidth: this.terminal.getWidth(),
    };

    // Automatic ETA update? (long running processes)
    if (this.options.etaAsynchronousUpdate) {
      this.updateETA();
    }

    // Format string
    const s: string = this.formatter(
      this.options,
      {
        ...params,
        eta:
          typeof params.eta === "string" ? parseFloat(params.eta) : params.eta,
      },
      this.payload,
    );

    const forceRedraw =
      forceRendering ||
      this.options.forceRedraw ||
      (this.options.noTTYOutput && !this.terminal.isTTY());

    // String changed? Only trigger redraw on change!
    if (forceRedraw || this.lastDrawnString !== s) {
      // Trigger event
      this.emit("redraw-pre");

      // Set cursor to start of line
      this.terminal.cursorTo(0, null);

      // Write output
      this.terminal.write(s);

      // Clear to the right from cursor
      this.terminal.clearRight();

      // Store string
      this.lastDrawnString = s;

      // Set last redraw time
      this.lastRedraw = Date.now();

      // Trigger event
      this.emit("redraw-post");
    }
  }

  // Start the progress bar
  start(total?: number, startValue?: number, payload?: Payload): void {
    // Set initial values
    this.value = startValue ?? 0;
    this.total = total !== undefined && total >= 0 ? total : 100;

    // Set start value for progress calculation
    this.startValue = startValue ?? 0;

    // Store payload (optional)
    this.payload = payload ?? {};

    // Store start time for duration+ETA calculation
    this.startTime = Date.now();

    // Reset stop time for 're-start' scenario (used for duration calculation)
    this.stopTime = null;

    // Reset string line buffer (redraw detection)
    this.lastDrawnString = "";

    // Initialize ETA buffer
    this.eta = new ETA(
      this.options.etaBufferLength,
      this.startTime,
      this.value,
    );

    // Set flag
    this.isActive = true;

    // Start event
    this.emit("start", this.total, this.startValue);
  }

  // Stop the bar
  stop(): void {
    // Set flag
    this.isActive = false;

    // Store stop timestamp to get total duration
    this.stopTime = Date.now();

    // Stop event
    this.emit("stop", this.total, this.value);
  }

  // Update the bar value
  // update(value, payload)
  // update(payload)
  update(arg0: number | Payload, arg1: Payload = {}): void {
    // Value set?
    if (typeof arg0 === "number") {
      // Update value
      this.value = arg0;

      // Add new value; recalculate ETA
      this.eta.update(Date.now(), arg0, this.total);
    }

    // Extract payload
    const payloadData: Payload =
      typeof arg0 === "object" ? (arg0 as Payload) : arg1;

    // Update event (before stop() is called)
    this.emit("update", this.total, this.value);

    // Merge payload
    Object.assign(this.payload, payloadData);

    // Limit reached? Autostop set?
    if (this.value >= this.getTotal() && this.options.stopOnComplete) {
      this.stop();
    }
  }

  // Calculate the actual progress value
  getProgress(): number {
    // Calculate the normalized current progress
    let progress = this.value / this.total;

    // Use relative progress calculation? Range between startValue and total is then used as 100%
    if (this.options.progressCalculationRelative) {
      progress =
        (this.value - this.startValue) / (this.total - this.startValue);
    }

    // Handle NaN Errors caused by total=0. Set to complete in this case
    if (isNaN(progress)) {
      progress = this.options.emptyOnZero ? 0.0 : 1.0;
    }

    // Limiter
    progress = Math.min(Math.max(progress, 0.0), 1.0);

    return progress;
  }

  // Increment the bar value
  // increment(delta, payload)
  // increment(payload)
  increment(arg0: number | Payload = 1, arg1: Payload = {}): void {
    if (typeof arg0 === "object") {
      // Handle the use case when `step` is omitted but payload is passed
      this.update(this.value + 1, arg0 as Payload);
    } else {
      // increment([step=1], [payload={}])
      this.update(this.value + arg0, arg1);
    }
  }

  /**
   * Public getter to retrieve the total value of the progress bar.
   * @returns The total value.
   */
  public getTotal(): number {
    return this.total;
  }

  /**
   * Public getter to retrieve the current value of the progress bar.
   * @returns The current value.
   */
  public getValue(): number {
    return this.value;
  }

  // Set the total (limit) value
  setTotal(total: number): void {
    if (total !== undefined && total >= 0) {
      this.total = total;
    }
  }

  // Force ETA calculation update (long running processes)
  updateETA(): void {
    // Add new value; recalculate ETA
    this.eta.update(Date.now(), this.value, this.total);
  }
}
