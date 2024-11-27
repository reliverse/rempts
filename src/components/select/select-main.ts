import { stdin as input, stdout as output } from "node:process";
import readline from "node:readline";
import { cyanBright, dim, greenBright, redBright } from "picocolors";

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
}): Promise<T> {
  const {
    title,
    options,
    defaultValue,
    required = false,
    borderColor = "viceGradient",
    titleColor = "cyanBright",
    titleTypography = "bold",
    titleVariant,
    border = true,
    endTitle = "👋",
    endTitleColor = "passionGradient",
    maxItems,
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

  let linesRendered = 0;
  const instructions = `Use <↑/↓> or <k/j> to navigate, <Enter> to select, <Ctrl+C> to exit`;
  let errorMessage = ""; // Initialize error message

  // Check if all options are disabled
  const allDisabled = options.every((option) => option.disabled);

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

    // Display error message if present; otherwise, show instructions or all disabled message
    if (errorMessage) {
      outputStr += `${redBright(symbols.step_error)}  ${errorMessage}\n`;
    } else if (allDisabled) {
      outputStr += `${formattedBar}  ${dim("All options are disabled.")}\n`;
    } else {
      outputStr += `${formattedBar}  ${dim(instructions)}\n`;
    }

    // Determine max items based on terminal size and provided maxItems
    const terminalHeight = process.stdout.rows || 24; // Default to 24 if undefined
    const availableHeight = terminalHeight - 4; // Header and footer adjustment
    const computedMaxItems = Math.min(
      maxItems ?? Infinity,
      availableHeight > 0 ? availableHeight : Infinity,
      options.length,
    );
    const minItems = 3; // Minimum number of items to display for better UX
    const displayItems = Math.max(computedMaxItems, minItems);

    let startIdx = 0;
    let endIdx = options.length - 1;

    if (options.length > displayItems) {
      const half = Math.floor(displayItems / 2);

      // Adjust startIdx and endIdx to center the selectedIndex
      startIdx = selectedIndex - half;
      endIdx = selectedIndex + (displayItems - half - 1);

      if (startIdx < 0) {
        startIdx = 0;
        endIdx = displayItems - 1;
      } else if (endIdx >= options.length) {
        endIdx = options.length - 1;
        startIdx = options.length - displayItems;
      }
    }

    // Determine if ellipses should be displayed
    const shouldRenderTopEllipsis = startIdx > 0;
    const shouldRenderBottomEllipsis = endIdx < options.length - 1;

    if (shouldRenderTopEllipsis) {
      outputStr += `${formattedBar}  ${dim("...")}\n`;
    }

    for (let index = startIdx; index <= endIdx; index++) {
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

    if (shouldRenderBottomEllipsis) {
      outputStr += `${formattedBar}  ${dim("...")}\n`;
    }

    // Calculate lines rendered
    linesRendered =
      1 + // Title
      1 + // Instructions or error message
      (shouldRenderTopEllipsis ? 1 : 0) + // Top ellipsis
      (endIdx - startIdx + 1) + // Displayed options
      (shouldRenderBottomEllipsis ? 1 : 0); // Bottom ellipsis

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
