import { stdin as input, stdout as output } from "node:process";
import readline from "node:readline";
import { cyanBright, dim, greenBright, redBright } from "picocolors";
import terminalSize from "terminal-size";

import type {
  ColorName,
  VariantName,
  TypographyName,
} from "~/types/general.js";

import { deleteLastLine } from "~/main.js";
import { bar, fmt, msg, symbols } from "~/utils/messages.js";

export async function selectPrompt<T extends string>(params: {
  title: string;
  options: { label: string; value: T; hint?: string; disabled?: boolean }[];
  defaultValue?: T;
  required?: boolean;
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
}): Promise<T> {
  const {
    title = "",
    options,
    defaultValue,
    required = false,
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

  // Initialize selectedIndex to the defaultValue if it's not disabled
  let selectedIndex = defaultValue
    ? options.findIndex(
        (option) => option.value === defaultValue && !option.disabled,
      )
    : -1;

  // If defaultValue is not provided or is disabled, find the first non-disabled option
  if (selectedIndex === -1) {
    selectedIndex = options.findIndex((option) => !option.disabled);
  }

  // If still not found, set to 0 (could be disabled)
  if (selectedIndex === -1) {
    selectedIndex = 0;
  }

  const rl = readline.createInterface({ input, output });
  readline.emitKeypressEvents(input, rl);
  if (typeof input.setRawMode === "function") {
    input.setRawMode(true);
  }

  const formattedBar = bar({ borderColor });

  let currentLinesRendered = 0;
  const instructions = `Use <↑/↓> or <k/j> to navigate, <Enter> to select, <Ctrl+C> to exit`;
  let errorMessage = ""; // Initialize error message

  // Check if all options are disabled
  const allDisabled = options.every((option) => option.disabled);

  function renderOptions() {
    // Move cursor up to the start of the options if not the first render
    if (currentLinesRendered > 0) {
      process.stdout.write(`\x1B[${currentLinesRendered}A`);
    }

    let outputStr = `${greenBright(symbols.step_active)}  ${fmt({
      hintColor: "gray",
      type: "M_NULL",
      title,
      titleColor,
    })}\n`;

    // Display error message if present; otherwise, show instructions or all disabled message
    if (errorMessage) {
      outputStr += `${redBright(symbols.step_error)}  ${errorMessage}\n`;
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
      // Compute indices dynamically based on selectedIndex and displayItems
      effectiveStartIdx = 0;
      effectiveEndIdx = options.length - 1;

      if (options.length > effectiveDisplayItems) {
        const half = Math.floor(effectiveDisplayItems / 2);

        // Adjust startIdx and endIdx to center the selectedIndex
        effectiveStartIdx = selectedIndex - half;
        effectiveEndIdx = selectedIndex + (effectiveDisplayItems - half - 1);

        if (effectiveStartIdx < 0) {
          effectiveStartIdx = 0;
          effectiveEndIdx = effectiveDisplayItems - 1;
        } else if (effectiveEndIdx >= options.length) {
          effectiveEndIdx = options.length - 1;
          effectiveStartIdx = options.length - effectiveDisplayItems;
        }
      }
    }

    const effectiveShouldRenderTopEllipsis =
      shouldRenderTopEllipsis ?? effectiveStartIdx > 0;
    const effectiveShouldRenderBottomEllipsis =
      shouldRenderBottomEllipsis ?? effectiveEndIdx < options.length - 1;

    if (effectiveShouldRenderTopEllipsis) {
      outputStr += `${formattedBar}  ${dim("...")}\n`;
    }

    for (let index = effectiveStartIdx; index <= effectiveEndIdx; index++) {
      const option = options[index];
      const isSelected = index === selectedIndex;
      const isDisabled = option.disabled;
      const prefix = isSelected ? "> " : "  ";
      const optionLabel = isDisabled
        ? dim(option.label)
        : isSelected
          ? cyanBright(option.label)
          : option.label;
      const hint = option.hint
        ? ` (${isDisabled ? dim(option.hint) : option.hint})`
        : "";
      outputStr += `${formattedBar} ${prefix}${optionLabel}${hint}\n`;
    }

    if (effectiveShouldRenderBottomEllipsis) {
      outputStr += `${formattedBar}  ${dim("...")}\n`;
    }

    // Calculate lines rendered
    currentLinesRendered =
      linesRendered ??
      1 + // Title
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

  return new Promise<T>((resolve) => {
    function onKeyPress(str: string, key: readline.Key) {
      if (allDisabled) {
        // If all options are disabled, ignore any key presses except Ctrl+C
        if (key.name === "c" && key.ctrl) {
          // Show endTitle message and exit gracefully
          msg({ type: "M_NEWLINE" });
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
        // Skip disabled options when moving up
        const originalPointer = selectedIndex;
        do {
          selectedIndex = (selectedIndex - 1 + options.length) % options.length;
          if (!options[selectedIndex].disabled) {
            break;
          }
        } while (selectedIndex !== originalPointer);
        errorMessage = "";
        renderOptions();
      } else if (key.name === "down" || key.name === "j") {
        // Skip disabled options when moving down
        const originalPointer = selectedIndex;
        do {
          selectedIndex = (selectedIndex + 1) % options.length;
          if (!options[selectedIndex].disabled) {
            break;
          }
        } while (selectedIndex !== originalPointer);
        errorMessage = "";
        renderOptions();
      } else if (key.name === "return") {
        // Prevent selecting disabled options
        if (options[selectedIndex].disabled) {
          errorMessage = "This option is disabled";
          renderOptions();
          return;
        }
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
        }
      } else if (key.name === "c" && key.ctrl) {
        // Show endTitle message and exit gracefully
        msg({ type: "M_NEWLINE" });
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
