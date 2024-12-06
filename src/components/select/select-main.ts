import relinka from "@reliverse/relinka";
import { stdin as input, stdout as output } from "node:process";
import readline from "node:readline";
import pc from "picocolors";
import terminalSize from "terminal-size";

import type {
  ColorName,
  VariantName,
  TypographyName,
} from "~/types/general.js";

import { deleteLastLine } from "~/main.js";
import { bar, fmt, msg, symbols } from "~/utils/messages.js";

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

function isSelectOption<T>(
  option: SelectOption<T> | SeparatorOption,
): option is SelectOption<T> {
  return !("separator" in option);
}

export async function selectPrompt<T extends string>(params: {
  title: string;
  options: (SelectOption<T> | SeparatorOption)[];
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
        (option) =>
          "value" in option &&
          option.value === defaultValue &&
          !option.disabled,
      )
    : -1;

  // If defaultValue is not provided or is disabled, find the first non-disabled option
  if (selectedIndex === -1) {
    selectedIndex = options.findIndex(
      (option) => "disabled" in option && !option.disabled,
    );
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
  const allDisabled = options.every(
    (option) => "disabled" in option && option.disabled,
  );

  function renderOptions() {
    // Move cursor up to the start of the options if not the first render
    if (currentLinesRendered > 0) {
      process.stdout.write(`\x1B[${currentLinesRendered}A`);
    }

    let outputStr = `${pc.greenBright(symbols.step_active)}  ${fmt({
      hintColor: "gray",
      type: "M_NULL",
      title,
      titleColor,
    })}\n`;

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
      // Compute indices dynamically based on selectedIndex and displayItems
      if (maxItems) {
        // If maxItems is set, apply the original logic
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
      if ("separator" in option) {
        const width = option.width ?? 20;
        const symbol = option.symbol ?? "line";
        if (symbol in symbols) {
          outputStr += `${formattedBar}  ${pc.dim(symbols[symbol].repeat(width))}\n`;
        } else {
          outputStr += `${formattedBar}  ${pc.dim("─".repeat(width))}\n`;
        }
        continue;
      }

      const isSelected = index === selectedIndex;
      const isDisabled = option.disabled;
      const prefix = isSelected ? "> " : "  ";
      const optionLabel = isDisabled
        ? pc.dim(option.label)
        : isSelected
          ? pc.cyanBright(option.label)
          : option.label;
      const hint = option.hint
        ? ` (${isDisabled ? pc.dim(option.hint) : option.hint})`
        : "";
      outputStr += `${formattedBar} ${prefix}${optionLabel}${hint}\n`;
    }

    if (effectiveShouldRenderBottomEllipsis) {
      outputStr += `${formattedBar}  ${pc.dim("...")}\n`;
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
        // Skip disabled options and separators when moving up
        const originalPointer = selectedIndex;
        do {
          selectedIndex = (selectedIndex - 1 + options.length) % options.length;
          const option = options[selectedIndex];
          if (isSelectOption(option) && !option.disabled) {
            break;
          }
        } while (selectedIndex !== originalPointer);
        renderOptions();
      } else if (key.name === "down" || key.name === "j") {
        // Skip disabled options and separators when moving down
        const originalPointer = selectedIndex;
        do {
          selectedIndex = (selectedIndex + 1) % options.length;
          const option = options[selectedIndex];
          if (isSelectOption(option) && !option.disabled) {
            break;
          }
        } while (selectedIndex !== originalPointer);
        renderOptions();
      } else if (key.name === "return") {
        // Prevent selecting disabled options
        const option = options[selectedIndex];
        if (!("separator" in option) && option.disabled) {
          errorMessage = "This option is disabled";
          renderOptions();
          return;
        }
        // Confirm selection
        if (required && (!("value" in option) || !option.value)) {
          deleteLastLine();
          errorMessage = "You must select an option.";
          renderOptions();
        } else {
          cleanup();
          resolve("value" in option ? option.value : null);
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
        relinka.log(""); // Move to a new line
      }
    }

    input.on("keypress", onKeyPress);
  });
}
