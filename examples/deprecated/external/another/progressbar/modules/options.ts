// lib/options.ts

// Define interfaces for better type safety
export type RawOptions = {
  fps?: number;
  stream?: NodeJS.WritableStream;
  terminal?: Terminal;
  clearOnComplete?: boolean;
  stopOnComplete?: boolean;
  barsize?: number;
  align?: "left" | "right" | "center";
  hideCursor?: boolean;
  linewrap?: boolean;
  barGlue?: string;
  barCompleteChar?: string;
  barIncompleteChar?: string;
  format?: string | FormatterFunction;
  formatTime?: FormatterFunction | null;
  formatValue?: FormatterFunction | null;
  formatBar?: FormatterFunction | null;
  etaBuffer?: number;
  etaAsynchronousUpdate?: boolean;
  progressCalculationRelative?: boolean;
  synchronousUpdate?: boolean;
  noTTYOutput?: boolean;
  notTTYSchedule?: number;
  emptyOnZero?: boolean;
  forceRedraw?: boolean;
  autopadding?: boolean;
  autopaddingChar?: string;
  gracefulExit?: boolean;
  // Add other options as needed
};

export type Options = {
  throttleTime: number;
  stream: NodeJS.WritableStream;
  terminal: Terminal | null;
  clearOnComplete: boolean;
  stopOnComplete: boolean;
  barsize: number;
  align: "left" | "right" | "center";
  hideCursor: boolean;
  linewrap: boolean;
  barGlue: string;
  barCompleteChar: string;
  barIncompleteChar: string;
  format: string;
  formatTime: FormatterFunction | null;
  formatValue: FormatterFunction | null;
  formatBar: FormatterFunction | null;
  etaBufferLength: number;
  etaAsynchronousUpdate: boolean;
  progressCalculationRelative: boolean;
  synchronousUpdate: boolean;
  noTTYOutput: boolean;
  notTTYSchedule: number;
  emptyOnZero: boolean;
  forceRedraw: boolean;
  autopadding: boolean;
  autopaddingChar: string;
  gracefulExit: boolean;
  barCompleteString: string;
  barIncompleteString: string;
} & RawOptions;

// Placeholder for the Terminal class.
// Replace this with the actual import if Terminal is defined elsewhere.
import type Terminal from "./terminal.js";

// Placeholder for the FormatterFunction type.
// Replace this with the actual type definition based on your formatter implementation.
export type FormatterFunction = (
  options: Options,
  params: any, // Define a more specific type if possible
  payload: Record<string, any>,
) => string;

/**
 * Utility function to merge options with default values.
 * @param v - The value to merge.
 * @param defaultValue - The default value if v is undefined or null.
 * @returns The merged value.
 */
function mergeOption<T>(v: T | undefined | null, defaultValue: T): T {
  return v === undefined || v === null ? defaultValue : v;
}

export function parse(
  rawOptions: Partial<RawOptions>,
  preset: Partial<RawOptions> = {},
): Options {
  // Merge preset and raw options
  const opt = { ...preset, ...rawOptions };

  // Construct the options object with default values
  const options: Options = {
    throttleTime: 1000 / mergeOption(opt.fps, 10),
    stream: mergeOption(opt.stream, process.stderr),
    terminal: mergeOption(opt.terminal, null),
    clearOnComplete: mergeOption(opt.clearOnComplete, false),
    stopOnComplete: mergeOption(opt.stopOnComplete, false),
    barsize: mergeOption(opt.barsize, 40),
    align: mergeOption(opt.align, "left"),
    hideCursor: mergeOption(opt.hideCursor, false),
    linewrap: mergeOption(opt.linewrap, false),
    barGlue: mergeOption(opt.barGlue, ""),
    barCompleteChar: mergeOption(opt.barCompleteChar, "="),
    barIncompleteChar: mergeOption(opt.barIncompleteChar, "-"),
    format: mergeOption(
      opt.format,
      "progress [{bar}] {percentage}% | ETA: {eta}s | {value}/{total}",
    ),
    formatTime: mergeOption(opt.formatTime, null),
    formatValue: mergeOption(opt.formatValue, null),
    formatBar: mergeOption(opt.formatBar, null),
    etaBufferLength: mergeOption(opt.etaBuffer, 10),
    etaAsynchronousUpdate: mergeOption(opt.etaAsynchronousUpdate, false),
    progressCalculationRelative: mergeOption(
      opt.progressCalculationRelative,
      false,
    ),
    synchronousUpdate: mergeOption(opt.synchronousUpdate, true),
    noTTYOutput: mergeOption(opt.noTTYOutput, false),
    notTTYSchedule: mergeOption(opt.notTTYSchedule, 2000),
    emptyOnZero: mergeOption(opt.emptyOnZero, false),
    forceRedraw: mergeOption(opt.forceRedraw, false),
    autopadding: mergeOption(opt.autopadding, false),
    autopaddingChar: mergeOption(opt.autopaddingChar, "   "),
    gracefulExit: mergeOption(opt.gracefulExit, false),
    // Derived options will be assigned later
    barCompleteString: "",
    barIncompleteString: "",
  };

  return options;
}

/**
 * Assign derived options that are specific to each bar instance.
 * @param options - The parsed options.
 * @returns The options with derived properties.
 */
export function assignDerivedOptions(options: Options): Options {
  // Pre-render bar strings for performance
  options.barCompleteString = options.barCompleteChar.repeat(
    options.barsize + 1,
  );
  options.barIncompleteString = options.barIncompleteChar.repeat(
    options.barsize + 1,
  );

  // Autopadding character - empty if autopadding is disabled
  options.autopaddingChar = options.autopadding
    ? mergeOption(options.autopaddingChar, "   ")
    : "";

  return options;
}
