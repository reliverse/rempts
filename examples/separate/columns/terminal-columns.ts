// @see https://github.com/privatenumber/terminal-columns#readme

import { terminalColumns } from "~/main.js";

// Create table data
const tableData = [
  ["Cell A1", "Cell B1", "Cell C1"],
  ["Cell A2", "Cell B2", "Cell C2"],
  ["Cell A3", "Cell B3", "Cell C3"],
];

// Render table
const tableString = terminalColumns(tableData);
console.log(tableString);
