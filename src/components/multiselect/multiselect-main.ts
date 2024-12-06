import relinka from "@reliverse/relinka";
import { stdin as input, stdout as output } from "node:process";
import readline from "node:readline";
import pc from "picocolors";
import terminalSize from "terminal-size";

import type {
  ColorName,
  TypographyName,
  VariantName,
} from "~/types/general.js";

import { colorize } from "~/main.js";
import { bar, symbols, msg } from "~/utils/messages.js";
import { deleteLastLine } from "~/utils/terminal.js";

type SelectOption<T> = {
  label: string;
  value: T;
  hint?: string;
  disabled?: boolean;
};

type SeparatorOption = {
  separator: true;
  width?: number;
  symbol?: keyof typeof symbols;
};

// Type guard to check if an option is a SelectOption
function isSelectOption<T>(
  option: SelectOption<T> | SeparatorOption,
): option is SelectOption<T> {
  return !("separator" in option);
}

export async function multiselectPrompt<T extends string>(params: {
  title: string;
  options: (SelectOption<T> | SeparatorOption)[];
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
          (opt) =>
            isSelectOption(opt) &&
            defaultValue.includes(opt.value) &&
            !opt.disabled,
        )
      : 0;

  // If no valid defaultValue pointer, default to the first non-disabled option
  if (pointer === -1) {
    pointer = options.findIndex((opt) => isSelectOption(opt) && !opt.disabled);
    if (pointer === -1) {
      pointer = 0;
    } // Fallback if all options are disabled or are separators
  }

  // Initialize selected options based on defaultValue
  const selectedOptions = new Set<number>(
    defaultValue
      .map((opt) =>
        options.findIndex((o) => isSelectOption(o) && o.value === opt),
      )
      .filter(
        (i) => i >= 0 && isSelectOption(options[i]) && !options[i].disabled,
      ), // Ensure defaultValue selections are not disabled or separators
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

  // Check if all selectable options are disabled
  const allDisabled = options
    .filter(isSelectOption)
    .every((option) => option.disabled);

  function renderOptions() {
    // Move cursor up to the start of the options if not the first render
    if (currentLinesRendered > 0) {
      process.stdout.write(`\x1B[${currentLinesRendered}A`);
    }

    let outputStr = `${pc.greenBright(symbols.step_active)}  ${colorize(
      title,
      titleColor,
      titleTypography,
    )}\n`;

    // Display error message if present; otherwise, show instructions or all disabled message
    if (errorMessage) {
      outputStr += `${pc.redBright(symbols.step_error)}  ${errorMessage}\n`;
    } else if (allDisabled) {
      outputStr += `${formattedBar}  ${pc.dim("All options are disabled.")}\n`;
    } else {
      outputStr += `${formattedBar}  ${pc.dim(instructions)}\n`;
    }

    // Determine effective properties based on provided params or defaults
    const size = terminalSize(); // Get terminal size
    const effectiveTerminalHeight = terminalHeight ?? size.rows ?? 24; // Fallback to 24 if rows is undefined
    const effectiveAvailableHeight =
      availableHeight ?? effectiveTerminalHeight - 4; // Header and footer adjustment

    // If maxItems is not set, display all options
    const effectiveComputedMaxItems = maxItems
      ? Math.min(
          maxItems,
          effectiveAvailableHeight > 0 ? effectiveAvailableHeight : Infinity,
          options.length,
        )
      : options.length;

    const minItems = 3; // Minimum number of items to display for better UX
    const effectiveDisplayItems = displayItems
      ? displayItems
      : maxItems
        ? Math.max(effectiveComputedMaxItems, minItems)
        : options.length;

    let effectiveStartIdx: number;
    let effectiveEndIdx: number;

    if (startIdx !== undefined && endIdx !== undefined) {
      // Use provided indices if available
      effectiveStartIdx = startIdx;
      effectiveEndIdx = endIdx;
    } else {
      // Compute indices dynamically based on pointer and displayItems
      if (maxItems) {
        // If maxItems is set, apply the reduction logic
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
        } else {
          effectiveStartIdx = 0;
          effectiveEndIdx = options.length - 1;
        }
      } else {
        // If maxItems is not set, display all options
        effectiveStartIdx = 0;
        effectiveEndIdx = options.length - 1;
      }
    }

    // Determine whether to render ellipses
    let effectiveShouldRenderTopEllipsis: boolean;
    let effectiveShouldRenderBottomEllipsis: boolean;

    if (maxItems) {
      effectiveShouldRenderTopEllipsis =
        shouldRenderTopEllipsis ?? effectiveStartIdx > 0;
      effectiveShouldRenderBottomEllipsis =
        shouldRenderBottomEllipsis ?? effectiveEndIdx < options.length - 1;
    } else {
      // Do not render ellipses if maxItems is not set
      effectiveShouldRenderTopEllipsis = false;
      effectiveShouldRenderBottomEllipsis = false;
    }

    if (effectiveShouldRenderTopEllipsis) {
      outputStr += `${formattedBar}  ${pc.dim("...")}\n`;
    }

    for (let index = effectiveStartIdx; index <= effectiveEndIdx; index++) {
      const option = options[index];

      // Handle separator
      if (!isSelectOption(option)) {
        const width = option.width ?? 20;
        const symbol = option.symbol ?? "line";
        if (symbol in symbols) {
          outputStr += `${formattedBar}  ${pc.dim(symbols[symbol].repeat(width))}\n`;
        } else {
          outputStr += `${formattedBar}  ${pc.dim("─".repeat(width))}\n`;
        }
        continue;
      }

      const isSelected = selectedOptions.has(index);
      const isHighlighted = index === pointer;
      const isDisabled = option.disabled;
      const checkbox = isSelected ? "[x]" : "[ ]";
      const prefix = isHighlighted ? "> " : "  ";

      // Dim the label and hint if the option is disabled
      const optionLabel = isDisabled
        ? pc.dim(option.label)
        : isHighlighted
          ? pc.cyanBright(option.label)
          : option.label;

      const hint = option.hint
        ? ` (${isDisabled ? pc.dim(option.hint) : option.hint})`
        : "";

      outputStr += `${formattedBar} ${prefix}${checkbox} ${optionLabel}${pc.dim(hint)}\n`;
    }

    if (effectiveShouldRenderBottomEllipsis) {
      outputStr += `${formattedBar}  ${pc.dim("...")}\n`;
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
      relinka.log({
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
        // Move up and skip disabled options and separators
        const originalPointer = pointer;
        do {
          pointer = (pointer - 1 + options.length) % options.length;
          const currentOption = options[pointer];
          if (isSelectOption(currentOption) && !currentOption.disabled) {
            break;
          }
        } while (pointer !== originalPointer);
        errorMessage = ""; // Clear error message on navigation
        renderOptions();
      } else if (key.name === "down" || key.name === "j") {
        // Move down and skip disabled options and separators
        const originalPointer = pointer;
        do {
          pointer = (pointer + 1) % options.length;
          const currentOption = options[pointer];
          if (isSelectOption(currentOption) && !currentOption.disabled) {
            break;
          }
        } while (pointer !== originalPointer);
        errorMessage = ""; // Clear error message on navigation
        renderOptions();
      } else if (key.name === "space") {
        const currentOption = options[pointer];
        if (!isSelectOption(currentOption) || currentOption.disabled) {
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
            .filter(
              (index) =>
                isSelectOption(options[index]) && !options[index].disabled,
            ) // Ensure no disabled options are selected
            .map((index) =>
              "value" in options[index] ? options[index].value : null,
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
        relinka.log(""); // Move to a new line
      }
    }

    input.on("keypress", onKeyPress);
  });
}
