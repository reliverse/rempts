import { getTerminalWidth } from "@reliverse/relinka";

import type { Row, Options, OptionsFunction } from "./types.js";

import { computeColumnWidths } from "./utils/compute-column-widths.js";
import { getColumnContentWidths } from "./utils/get-column-content-widths.js";
import { getOptions } from "./utils/get-options.js";
import { renderRow } from "./utils/render-row.js";

export function terminalColumns(
  tableData: Row[],
  options?: Options | OptionsFunction,
) {
  if (!tableData || tableData.length === 0) {
    return "";
  }

  const columnContentWidths = getColumnContentWidths(tableData);
  const columnCount = columnContentWidths.length;
  if (columnCount === 0) {
    return "";
  }

  const { columns } = getOptions(options);
  const adjustedStdoutColumns = getTerminalWidth();

  if (columns.length > columnCount) {
    throw new Error(
      `${columns.length} columns defined, but only ${columnCount} columns found`,
    );
  }

  const computedColumns = computeColumnWidths(
    adjustedStdoutColumns,
    columns,
    columnContentWidths,
  );

  return tableData.map((row) => renderRow(computedColumns, row)).join("\n");
}
