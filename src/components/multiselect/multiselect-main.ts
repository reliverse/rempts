import { stdin as input, stdout as output } from "node:process";
import readline from "node:readline";
import { cyanBright, dim, greenBright, redBright, reset } from "picocolors";

import type { ColorName, Variant, TypographyName } from "~/types/general.js";

import { colorize } from "~/mod.js";
import { bar, symbols, msg } from "~/utils/messages.js";
import { deleteLastLine } from "~/utils/terminal.js";

export async function multiselectPrompt<T extends string>(params: {
  title: string;
  options: { value: T; hint?: string }[];
  required?: boolean;
  initial?: T[];
  borderColor?: ColorName;
  titleColor?: ColorName;
  titleTypography?: TypographyName;
  titleVariant?: Variant;
  border?: boolean;
  endTitle?: string;
  endTitleColor?: ColorName;
}): Promise<T[]> {
  const {
    title,
    options,
    required = false,
    initial = [],
    borderColor = "viceGradient",
    titleColor = "cyanBright",
    titleTypography = "bold",
    titleVariant,
    border = true,
    endTitle = "👋",
    endTitleColor = "passionGradient",
  } = params;

  let pointer = 0;
  const selectedOptions = new Set<number>(
    initial.map((opt) => options.findIndex((o) => o.value === opt)).filter((i) => i >= 0),
  );

  const rl = readline.createInterface({ input, output });
  readline.emitKeypressEvents(input, rl);
  if (typeof input.setRawMode === "function") {
    input.setRawMode(true);
  }

  const formattedBar = bar({ borderColor });

  let linesRendered = 0;
  const instructions = `Use <↑/↓> or <k/j> to navigate, <Space> to select/deselect, <Enter> to confirm, <Ctrl+C> to exit`;
  let errorMessage = ""; // Initialize error message

  function renderOptions() {
    // Move cursor up to the start of the options if not the first render
    if (linesRendered > 0) {
      process.stdout.write(`\x1B[${linesRendered}A`);
    }

    let outputStr = `${greenBright(symbols.step_active)}  ${colorize(title, titleColor, titleTypography)}\n`;

    // Display error message if present; otherwise, show instructions
    if (errorMessage) {
      outputStr += redBright(`${symbols.step_error}  ${errorMessage}\n`);
    } else {
      outputStr += `${formattedBar}  ${dim(instructions)}\n`;
    }

    options.forEach((option, index) => {
      const isSelected = selectedOptions.has(index);
      const isHighlighted = index === pointer;
      const checkbox = isSelected ? "[x]" : "[ ]";
      const prefix = isHighlighted ? "> " : "  ";
      const optionLabel = isHighlighted ? cyanBright(option.value) : option.value;
      const hint = option.hint ? ` (${option.hint})` : "";
      outputStr += `${formattedBar} ${prefix}${checkbox} ${optionLabel}${dim(hint)}\n`;
    });

    process.stdout.write(outputStr);

    // Calculate lines rendered:
    linesRendered = 1 + 1 + options.length; // Symbol + Title + (Error Message or Instructions) + options
  }

  renderOptions();

  return new Promise<T[]>((resolve) => {
    function onKeyPress(str: string, key: readline.Key) {
      if (key.name === "up" || key.name === "k") {
        // Move up
        pointer = (pointer - 1 + options.length) % options.length;
        errorMessage = ""; // Clear error message on navigation
        renderOptions();
      } else if (key.name === "down" || key.name === "j") {
        // Move down
        pointer = (pointer + 1) % options.length;
        errorMessage = ""; // Clear error message on navigation
        renderOptions();
      } else if (key.name === "space") {
        // Toggle selection
        if (selectedOptions.has(pointer)) {
          selectedOptions.delete(pointer);
        } else {
          selectedOptions.add(pointer);
        }
        errorMessage = ""; // Clear error message on selection
        renderOptions();
      } else if (key.name === "return") {
        // Return selected options
        if (!required || selectedOptions.size > 0) {
          const selectedValues = Array.from(selectedOptions).map(
            (index) => options[index].value,
          );
          cleanup();
          resolve(selectedValues);
          deleteLastLine();
          deleteLastLine();
          msg({
            type: "M_MIDDLE",
          });
        } else {
          deleteLastLine();
          errorMessage = "You must select at least one option.\x1B[K";
          renderOptions();
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
