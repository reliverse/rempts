import { stdin as input, stdout as output } from "node:process";
import readline from "node:readline";
import { cyanBright, dim, greenBright, redBright, reset } from "picocolors";

import type { ColorName, Variant, TypographyName } from "~/types/general.js";

import { bar, fmt, msg, symbols } from "~/utils/messages.js";
import { deleteLastLine } from "~/utils/terminal.js";

export async function selectPrompt<T extends string>(params: {
  title: string;
  options: { label: string; value: T }[];
  hints?: string[];
  initial?: T;
  required?: boolean;
  borderColor?: ColorName;
  titleColor?: ColorName;
  titleTypography?: TypographyName;
  titleVariant?: Variant;
  border?: boolean;
  endTitle?: string;
  endTitleColor?: ColorName;
}): Promise<T> {
  const {
    title,
    options,
    hints = [],
    initial,
    required = false,
    borderColor = "viceGradient",
    titleColor = "cyanBright",
    titleTypography = "bold",
    titleVariant,
    border = true,
    endTitle = "👋",
    endTitleColor = "passionGradient",
  } = params;

  let selectedIndex = initial
    ? options.findIndex((option) => option.value === initial)
    : 0;
  if (selectedIndex === -1) selectedIndex = 0;

  const rl = readline.createInterface({ input, output });
  readline.emitKeypressEvents(input, rl);
  if (typeof input.setRawMode === "function") {
    input.setRawMode(true);
  }

  const formattedBar = bar({ borderColor });

  let linesRendered = 0;
  const instructions = `Use <↑/↓> or <k/j> to navigate, <Enter> to select, <Ctrl+C> to exit`;
  let errorMessage = ""; // Initialize error message

  function renderOptions() {
    // Move cursor up to the start of the options if not the first render
    if (linesRendered > 0) {
      process.stdout.write(`\x1B[${linesRendered}A`);
    }

    let outputStr = `${greenBright(symbols.step_active)}  ${fmt({
      type: "M_NULL",
      title,
      titleColor,
    })}\n`;

    // Display error message if present; otherwise, show instructions
    if (errorMessage) {
      outputStr += `${redBright(symbols.step_error)}  ${errorMessage}\n`;
    } else {
      outputStr += `${formattedBar}  ${dim(instructions)}\n`;
    }

    options.forEach((option, index) => {
      const isSelected = index === selectedIndex;
      const prefix = isSelected ? "> " : "  ";
      const optionLabel = isSelected ? cyanBright(option.label) : option.label;
      const hint = hints[index] ? ` (${hints[index]})` : "";
      outputStr += `${formattedBar} ${prefix}${optionLabel}${dim(hint)}\n`;
    });

    process.stdout.write(outputStr);

    // Calculate lines rendered:
    linesRendered = 1 + 1 + options.length; // Title + (Error Message or Instructions) + options
  }

  renderOptions();

  return new Promise<T>((resolve) => {
    function onKeyPress(str: string, key: readline.Key) {
      if (key.name === "up" || key.name === "k") {
        // Move up
        selectedIndex = (selectedIndex - 1 + options.length) % options.length;
        errorMessage = ""; // Clear error message on navigation
        renderOptions();
      } else if (key.name === "down" || key.name === "j") {
        // Move down
        selectedIndex = (selectedIndex + 1) % options.length;
        errorMessage = ""; // Clear error message on navigation
        renderOptions();
      } else if (key.name === "return") {
        // Confirm selection
        if (required && !options[selectedIndex].value) {
          deleteLastLine();
          errorMessage = "You must select an option.";
          renderOptions();
        } else {
          cleanup();
          resolve(options[selectedIndex].value);
          deleteLastLine();
          deleteLastLine();
          msg({
            type: "M_MIDDLE",
          });
        }
      } else if (key.name === "c" && key.ctrl) {
        // Show endTitle message and exit gracefully
        msg({
          type: "M_NEWLINE",
        });
        msg({
          type: "M_END",
          title: endTitle,
          titleColor: endTitleColor,
          titleTypography,
          titleVariant,
          border,
          borderColor,
        });
        cleanup(true);
      }
    }

    function cleanup(isCtrlC = false) {
      if (typeof input.setRawMode === "function") {
        input.setRawMode(false);
      }
      rl.close();
      input.removeListener("keypress", onKeyPress);
      // Move cursor down to the end of options
      process.stdout.write(`\x1B[${linesRendered}B`);
      if (isCtrlC) {
        process.exit(); // Exit the process without throwing an error
      } else {
        console.log(); // Move to a new line
      }
    }

    input.on("keypress", onKeyPress);
  });
}
