import { getTerminalWidth } from "~/core/utils.js";

import type { Options, OptionsFunction, ColumnMetasArray } from "../types.js";

type InternalOptions = {
  columns: ColumnMetasArray;
  stdoutColumns: number;
};

export const getOptions = (
  options?: Options | OptionsFunction,
): InternalOptions => {
  const stdoutColumns = getTerminalWidth() ?? Number.POSITIVE_INFINITY;

  if (typeof options === "function") {
    options = options(stdoutColumns);
  }

  if (!options) {
    options = {};
  }

  if (Array.isArray(options)) {
    return {
      columns: options,
      stdoutColumns,
    };
  }

  return {
    columns: options.columns ?? [],
    stdoutColumns: options.stdoutColumns ?? stdoutColumns,
  };
};
