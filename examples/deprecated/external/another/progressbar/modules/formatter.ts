/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import stringWidth from "string-width";

import defaultFormatBar from "./format-bar.js";
import defaultFormatTime from "./format-time.js";
import defaultFormatValue from "./format-value.js";

type Options = {
  format: string;
  formatTime?: Function;
  formatValue?: Function;
  formatBar?: Function;
  align?: "left" | "right" | "center";
  autopaddingChar?: string;
  [key: string]: any; // Additional properties
};

type Params = {
  progress: number;
  eta: number;
  startTime: number;
  stopTime?: number;
  total: number;
  value: number;
  maxWidth: number;
};

export default function defaultFormatter(
  options: Options,
  params: Params,
  payload: Record<string, any>,
): string {
  let s = options.format;

  const formatTime = options.formatTime || defaultFormatTime;
  const formatValue = options.formatValue || defaultFormatValue;
  const formatBar = options.formatBar || defaultFormatBar;

  const percentage = Math.floor(params.progress * 100) + "";

  const stopTime = params.stopTime || Date.now();

  const elapsedTime = Math.round((stopTime - params.startTime) / 1000);

  const context = {
    ...payload,
    bar: formatBar(params.progress, options),
    percentage: formatValue(percentage, options, "percentage"),
    total: formatValue(params.total, options, "total"),
    value: formatValue(params.value, options, "value"),
    eta: formatValue(params.eta, options, "eta"),
    eta_formatted: formatTime(params.eta, options, 5),
    duration: formatValue(elapsedTime, options, "duration"),
    duration_formatted: formatTime(elapsedTime, options, 1),
  };

  s = s.replace(/\{(\w+)\}/g, (match, key) => {
    if (typeof context[key] !== "undefined") {
      return context[key];
    }
    return match;
  });

  const fullMargin = Math.max(0, params.maxWidth - stringWidth(s) - 2);
  const halfMargin = Math.floor(fullMargin / 2);

  switch (options.align) {
    case "right":
      s = fullMargin > 0 ? " ".repeat(fullMargin) + s : s;
      break;
    case "center":
      s = halfMargin > 0 ? " ".repeat(halfMargin) + s : s;
      break;
    default:
      break;
  }

  return s;
}
