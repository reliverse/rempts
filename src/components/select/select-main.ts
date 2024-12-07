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
    // Move cursor up to the start of the previous render block
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

    // Compute terminal height and display parameters
    const size = terminalSize(); // Get terminal size
    const effectiveTerminalHeight = size.rows ?? 24; // fallback to 24 if rows is undefined
    // We'll reserve a few lines for the title and instructions, so:
    const availableHeight = effectiveTerminalHeight - 4; // Title, instructions, and some margin

    // Determine how many items to display
    const effectiveMaxItems = maxItems
      ? Math.min(maxItems, options.length)
      : options.length;
    const minItems = 3; // Minimum number of items to show for better UX
    const displayItems = maxItems
      ? Math.max(effectiveMaxItems, minItems)
      : options.length;

    // Calculate start and end indices for visible portion
    let startIdx = 0;
    let endIdx = options.length - 1;
    if (maxItems && options.length > displayItems) {
      const half = Math.floor(displayItems / 2);
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

    const shouldRenderTopEllipsis = maxItems ? startIdx > 0 : false;
    const shouldRenderBottomEllipsis = maxItems
      ? endIdx < options.length - 1
      : false;

    if (shouldRenderTopEllipsis) {
      outputStr += `${formattedBar}  ${pc.dim("...")}\n`;
    }

    for (let index = startIdx; index <= endIdx; index++) {
      const option = options[index];

      // Handle separator
      if ("separator" in option) {
        const width = option.width ?? 20;
        const symbol = option.symbol ?? "line";
        const lineSymbol = symbol in symbols ? symbols[symbol] : "─";
        outputStr += `${formattedBar}  ${pc.dim(lineSymbol.repeat(width))}\n`;
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

    if (shouldRenderBottomEllipsis) {
      outputStr += `${formattedBar}  ${pc.dim("...")}\n`;
    }

    // Calculate lines rendered for this frame
    currentLinesRendered =
      1 + // Title line
      1 + // Instructions/error line
      (shouldRenderTopEllipsis ? 1 : 0) +
      (endIdx - startIdx + 1) +
      (shouldRenderBottomEllipsis ? 1 : 0);

    if (debug) {
      console.log({
        terminalHeight: effectiveTerminalHeight,
        availableHeight: availableHeight,
        computedMaxItems: effectiveMaxItems,
        displayItems,
        startIdx,
        endIdx,
        shouldRenderTopEllipsis,
        shouldRenderBottomEllipsis,
        linesRendered: currentLinesRendered,
      });
    }

    process.stdout.write(outputStr);
  }

  renderOptions();

  return new Promise<T>((resolve) => {
    function onKeyPress(str: string, key: readline.Key) {
      if (allDisabled) {
        // If all options are disabled, only allow Ctrl+C to exit
        if (key.name === "c" && key.ctrl) {
          msg({
            type: "M_MIDDLE",
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
        // Move selection up, skipping disabled or separators
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
        // Move selection down, skipping disabled or separators
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
        const option = options[selectedIndex];
        if (!("separator" in option) && option.disabled) {
          errorMessage = "This option is disabled";
          renderOptions();
          return;
        }
        // Confirm selection
        if (required && (!("value" in option) || !option.value)) {
          errorMessage = "You must select an option.";
          renderOptions();
        } else {
          cleanup();
          resolve("value" in option ? option.value : (null as T));
          deleteLastLine();
          msg({
            type: "M_MIDDLE",
          });
        }
      } else if (key.name === "c" && key.ctrl) {
        // Ctrl+C
        msg({
          type: "M_MIDDLE",
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

      if (isCtrlC) {
        process.exit(0);
      }
    }

    input.on("keypress", onKeyPress);
  });
}
