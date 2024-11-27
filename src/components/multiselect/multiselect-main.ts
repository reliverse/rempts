import { stdin as input, stdout as output } from "node:process";
import readline from "node:readline";
import { cyanBright, dim, greenBright, redBright } from "picocolors";
import terminalSize from "terminal-size";

import type {
  ColorName,
  TypographyName,
  VariantName,
} from "~/types/general.js";

import { colorize } from "~/main.js";
import { bar, symbols, msg } from "~/utils/messages.js";
import { deleteLastLine } from "~/utils/terminal.js";

export async function multiselectPrompt<T extends string>(params: {
  title: string;
  options: { label: string; value: T; hint?: string; disabled?: boolean }[];
  required?: boolean;
  defaultValue?: T[];
  borderColor?: ColorName;
  titleColor?: ColorName;
  titleTypography?: TypographyName;
  titleVariant?: VariantName;
  border?: boolean;
  endTitle?: string;
  endTitleColor?: ColorName;
  maxItems?: number;
  debug?: boolean;
  terminalHeight?: number;
  availableHeight?: number;
  computedMaxItems?: number;
  displayItems?: number;
  startIdx?: number;
  endIdx?: number;
  shouldRenderTopEllipsis?: boolean;
  shouldRenderBottomEllipsis?: boolean;
  linesRendered?: number;
}): Promise<T[]> {
  const {
    title = "",
    options,
    required = false,
    defaultValue = [],
    borderColor = "viceGradient",
    titleColor = "blueBright",
    titleTypography = "bold",
    titleVariant,
    border = true,
    endTitle = "",
    endTitleColor = "dim",
    maxItems,
    debug = false,
    terminalHeight,
    availableHeight,
    computedMaxItems,
    displayItems,
    startIdx,
    endIdx,
    shouldRenderTopEllipsis,
    shouldRenderBottomEllipsis,
    linesRendered,
  } = params;

  // Initialize pointer to the first selected option or the first non-disabled option
  let pointer =
    defaultValue.length > 0
      ? options.findIndex(
          (opt) => defaultValue.includes(opt.value) && !opt.disabled,
        )
      : 0;

  // If no valid defaultValue pointer, default to the first non-disabled option
  if (pointer === -1) {
    pointer = options.findIndex((opt) => !opt.disabled);
    if (pointer === -1) {
      pointer = 0;
    } // Fallback if all options are disabled
  }

  // Initialize selected options based on defaultValue
  const selectedOptions = new Set<number>(
    defaultValue
      .map((opt) => options.findIndex((o) => o.value === opt))
      .filter((i) => i >= 0 && !options[i].disabled), // Ensure defaultValue selections are not disabled
  );

  const rl = readline.createInterface({ input, output });
  readline.emitKeypressEvents(input, rl);
  if (typeof input.setRawMode === "function") {
    input.setRawMode(true);
  }

  const formattedBar = bar({ borderColor });

  let currentLinesRendered = 0;
  const instructions = `Use <↑/↓> or <k/j> to navigate, <Space> to select/deselect, <Enter> to confirm, <Ctrl+C> to exit`;
  let errorMessage = ""; // Initialize error message

  // Check if all options are disabled
  const allDisabled = options.every((option) => option.disabled);

  function renderOptions() {
    // Move cursor up to the start of the options if not the first render
    if (currentLinesRendered > 0) {
      process.stdout.write(`\x1B[${currentLinesRendered}A`);
    }

    let outputStr = `${greenBright(symbols.step_active)}  ${colorize(
      title,
      titleColor,
      titleTypography,
    )}\n`;

    // Display error message if present; otherwise, show instructions or all disabled message
    if (errorMessage) {
      outputStr += redBright(`${symbols.step_error}  ${errorMessage}\n`);
    } else if (allDisabled) {
      outputStr += `${formattedBar}  ${dim("All options are disabled.")}\n`;
    } else {
      outputStr += `${formattedBar}  ${dim(instructions)}\n`;
    }

    // Determine effective properties based on provided params or defaults
    const size = terminalSize(); // Get terminal size
    const effectiveTerminalHeight = terminalHeight ?? size.rows ?? 24; // Fallback to 24 if rows is undefined
    const effectiveAvailableHeight =
      availableHeight ?? effectiveTerminalHeight - 4; // Header and footer adjustment
    const effectiveComputedMaxItems =
      computedMaxItems ??
      Math.min(
        maxItems ?? Infinity,
        effectiveAvailableHeight > 0 ? effectiveAvailableHeight : Infinity,
        options.length,
      );
    const minItems = 3; // Minimum number of items to display for better UX
    const effectiveDisplayItems =
      displayItems ?? Math.max(effectiveComputedMaxItems, minItems);

    let effectiveStartIdx: number;
    let effectiveEndIdx: number;

    if (startIdx !== undefined && endIdx !== undefined) {
      // Use provided indices if available
      effectiveStartIdx = startIdx;
      effectiveEndIdx = endIdx;
    } else {
      // Compute indices dynamically based on pointer and displayItems
      effectiveStartIdx = 0;
      effectiveEndIdx = options.length - 1;

      if (options.length > effectiveDisplayItems) {
        const half = Math.floor(effectiveDisplayItems / 2);

        // Adjust startIdx and endIdx to center the pointer
        effectiveStartIdx = pointer - half;
        effectiveEndIdx = pointer + (effectiveDisplayItems - half - 1);

        if (effectiveStartIdx < 0) {
          effectiveStartIdx = 0;
          effectiveEndIdx = effectiveDisplayItems - 1;
        } else if (effectiveEndIdx >= options.length) {
          effectiveEndIdx = options.length - 1;
          effectiveStartIdx = options.length - effectiveDisplayItems;
        }
      }
    }

    // Determine if ellipses should be displayed
    const effectiveShouldRenderTopEllipsis =
      shouldRenderTopEllipsis ?? effectiveStartIdx > 0;
    const effectiveShouldRenderBottomEllipsis =
      shouldRenderBottomEllipsis ?? effectiveEndIdx < options.length - 1;

    if (effectiveShouldRenderTopEllipsis) {
      outputStr += `${formattedBar}  ${dim("...")}\n`;
    }

    for (let index = effectiveStartIdx; index <= effectiveEndIdx; index++) {
      const option = options[index];
      const isSelected = selectedOptions.has(index);
      const isHighlighted = index === pointer;
      const isDisabled = option.disabled;
      const checkbox = isSelected ? "[x]" : "[ ]";
      const prefix = isHighlighted ? "> " : "  ";

      // Dim the label and hint if the option is disabled
      const optionLabel = isDisabled
        ? dim(option.label)
        : isHighlighted
          ? cyanBright(option.label)
          : option.label;

      const hint = option.hint
        ? ` (${isDisabled ? dim(option.hint) : option.hint})`
        : "";

      outputStr += `${formattedBar} ${prefix}${checkbox} ${optionLabel}${dim(hint)}\n`;
    }

    if (effectiveShouldRenderBottomEllipsis) {
      outputStr += `${formattedBar}  ${dim("...")}\n`;
    }

    // Calculate lines rendered:
    currentLinesRendered =
      linesRendered ??
      1 + // Symbol + Title
        1 + // Instructions or error message
        (effectiveShouldRenderTopEllipsis ? 1 : 0) + // Top ellipsis
        (effectiveEndIdx - effectiveStartIdx + 1) + // Displayed options
        (effectiveShouldRenderBottomEllipsis ? 1 : 0); // Bottom ellipsis

    if (debug) {
      console.log({
        terminalHeight: effectiveTerminalHeight,
        availableHeight: effectiveAvailableHeight,
        computedMaxItems: effectiveComputedMaxItems,
        displayItems: effectiveDisplayItems,
        startIdx: effectiveStartIdx,
        endIdx: effectiveEndIdx,
        shouldRenderTopEllipsis: effectiveShouldRenderTopEllipsis,
        shouldRenderBottomEllipsis: effectiveShouldRenderBottomEllipsis,
        linesRendered: currentLinesRendered,
      });
    }

    process.stdout.write(outputStr);
  }

  renderOptions();

  return new Promise<T[]>((resolve) => {
    function onKeyPress(str: string, key: readline.Key) {
      if (allDisabled) {
        // If all options are disabled, ignore any key presses except Ctrl+C
        if (key.name === "c" && key.ctrl) {
          // Show endTitle message and exit gracefully
          msg({
            type: "M_NEWLINE",
          });
          if (endTitle !== "") {
            msg({
              type: "M_END",
              title: endTitle,
              titleColor: endTitleColor,
              titleTypography,
              titleVariant,
              border,
              borderColor,
            });
          }
          cleanup(true);
        }
        return;
      }

      if (key.name === "up" || key.name === "k") {
        // Move up and skip disabled options
        const originalPointer = pointer;
        do {
          pointer = (pointer - 1 + options.length) % options.length;
          if (!options[pointer].disabled) {
            break;
          }
        } while (pointer !== originalPointer);
        errorMessage = ""; // Clear error message on navigation
        renderOptions();
      } else if (key.name === "down" || key.name === "j") {
        // Move down and skip disabled options
        const originalPointer = pointer;
        do {
          pointer = (pointer + 1) % options.length;
          if (!options[pointer].disabled) {
            break;
          }
        } while (pointer !== originalPointer);
        errorMessage = ""; // Clear error message on navigation
        renderOptions();
      } else if (key.name === "space") {
        const currentOption = options[pointer];
        if (currentOption.disabled) {
          errorMessage = "This option is disabled";
        } else {
          if (selectedOptions.has(pointer)) {
            selectedOptions.delete(pointer);
          } else {
            selectedOptions.add(pointer);
          }
          errorMessage = ""; // Clear error message on successful toggle
        }
        renderOptions();
      } else if (key.name === "return") {
        // Return selected options
        if (!required || selectedOptions.size > 0) {
          const selectedValues = Array.from(selectedOptions)
            .filter((index) => !options[index].disabled) // Ensure no disabled options are selected
            .map((index) => options[index].value);
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
        if (endTitle !== "") {
          msg({
            type: "M_END",
            title: endTitle,
            titleColor: endTitleColor,
            titleTypography,
            titleVariant,
            border,
            borderColor,
          });
        }
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
      process.stdout.write(`\x1B[${currentLinesRendered}B`);
      if (isCtrlC) {
        process.exit(); // Exit the process without throwing an error
      } else {
        console.log(); // Move to a new line
      }
    }

    input.on("keypress", onKeyPress);
  });
}
