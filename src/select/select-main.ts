import type { BorderColorName, VariantName } from "@reliverse/relinka";

import { deleteLastLine, symbols } from "@reliverse/relinka";
import { msg, type ColorName, type TypographyName } from "@reliverse/relinka";
import { stdin as input, stdout as output } from "node:process";
import readline from "node:readline";
import { re } from "@reliverse/relico";
import terminalSize from "terminal-size";

import { completePrompt } from "~/utils/prompt-end.js";

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

type SelectPromptParams<T extends string> = {
  title: string;
  content?: string;
  options: (SelectOption<T> | SeparatorOption)[];
  defaultValue?: T;
  required?: boolean;
  borderColor?: BorderColorName;
  titleColor?: ColorName;
  titleTypography?: TypographyName;
  titleVariant?: VariantName;
  contentColor?: ColorName;
  contentTypography?: TypographyName;
  border?: boolean;
  endTitle?: string;
  endTitleColor?: ColorName;
  maxItems?: number;
  debug?: boolean;
  terminalWidth?: number;
  displayInstructions?: boolean;
};

/**
 * Renders the entire prompt UI by printing each line using `msg()`.
 * Returns the number of interactive UI lines rendered (for clearing during re-renders).
 */
function renderPromptUI<T extends string>(params: {
  title: string;
  content: string;
  options: (SelectOption<T> | SeparatorOption)[];
  selectedIndex: number;
  errorMessage: string;
  displayInstructions: boolean;
  allDisabled: boolean;
  instructions: string;
  borderColor: ColorName;
  titleColor: ColorName;
  contentColor: ColorName;
  contentTypography: TypographyName;
  debug: boolean;
  maxItems?: number;
  titleVariant?: VariantName;
  titleTypography?: TypographyName;
  terminalWidth?: number;
  isRerender?: boolean;
}): number {
  const {
    title,
    content,
    options,
    selectedIndex,
    errorMessage,
    displayInstructions,
    allDisabled,
    instructions,
    titleColor,
    contentColor,
    contentTypography,
    debug,
    maxItems,
    isRerender = false,
  } = params;

  const size = terminalSize();
  const effectiveTerminalHeight = size.rows ?? 24;

  // Only render title and content on first render
  if (!isRerender) {
    // Title
    msg({
      type: "M_GENERAL",
      title,
      titleColor,
    });

    // Content
    if (content) {
      msg({
        type: "M_NULL",
        content,
        contentColor,
        contentTypography,
      });
    }
  }

  let uiLineCount = 0;

  // Error or instructions
  if (errorMessage) {
    msg({
      type: "M_ERROR",
      title: `${re.redBright(symbols.step_error)} ${re.redBright(errorMessage)}`,
    });
    uiLineCount++;
  } else if (allDisabled) {
    msg({
      type: "M_ERROR",
      title: re.redBright("All options are disabled."),
    });
    uiLineCount++;
  } else if (displayInstructions && !isRerender) {
    msg({
      type: "M_NULL",
      title: re.blue(instructions),
    });
    uiLineCount++;
  }

  // Determine how many items to display
  const effectiveMaxItems = maxItems
    ? Math.min(maxItems, options.length)
    : options.length;
  const minItems = 3;
  const displayItems = maxItems
    ? Math.max(effectiveMaxItems, minItems)
    : options.length;

  // Calculate start/end indexes for "scrolling"
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

  const shouldRenderTopEllipsis = Boolean(maxItems && startIdx > 0);
  const shouldRenderBottomEllipsis = Boolean(
    maxItems && endIdx < options.length - 1,
  );

  if (shouldRenderTopEllipsis) {
    msg({ type: "M_NULL", title: re.dim("...") });
    uiLineCount++;
  }

  // Render options
  for (
    let index = startIdx;
    index <= endIdx && index < options.length;
    index++
  ) {
    const option = options[index];
    if (!option) continue;

    if (!isSelectOption(option)) {
      // Separator
      const width = option.width ?? 20;
      const symbolKey = option.symbol ?? "line";
      const lineSymbol = symbolKey in symbols ? symbols[symbolKey] : "─";
      msg({
        type: "M_NULL",
        title: re.dim(lineSymbol.repeat(width)),
      });
      uiLineCount++;
      continue;
    }

    const isSelected = index === selectedIndex;
    const isDisabled = option.disabled;
    const prefix = isSelected ? re.dim(re.reset("> ")) : "  ";
    const labelColor = isDisabled
      ? re.dim(re.reset(option.label))
      : isSelected
        ? re.reset(re.yellow(option.label))
        : re.reset(option.label);

    const hint = option.hint
      ? re.reset(
          ` (${isDisabled ? re.dim(option.hint) : re.italic(re.dim(option.hint))})`,
        )
      : "";

    msg({
      type: "M_NULL",
      title: `${prefix}${labelColor}${hint}`,
    });
    uiLineCount++;
  }

  if (shouldRenderBottomEllipsis) {
    msg({ type: "M_NULL", title: re.dim("...") });
    uiLineCount++;
  }

  if (debug) {
    console.log({
      terminalHeight: effectiveTerminalHeight,
      computedMaxItems: effectiveMaxItems,
      displayItems,
      startIdx,
      endIdx,
      shouldRenderTopEllipsis,
      shouldRenderBottomEllipsis,
    });
  }

  return uiLineCount;
}

/**
 * Displays a selectable prompt in the terminal and returns the chosen value.
 */
export async function selectPrompt<T extends string>(
  params: SelectPromptParams<T>,
): Promise<T> {
  const {
    title = "",
    content = "",
    options,
    defaultValue,
    required = false,
    borderColor = "dim",
    titleColor = "cyan",
    titleTypography = "none",
    titleVariant,
    contentColor = "dim",
    contentTypography = "italic",
    border = true,
    endTitle = "",
    endTitleColor = "dim",
    maxItems,
    debug = false,
    terminalWidth: customTerminalWidth = 90,
    displayInstructions = false,
  } = params;

  let selectedIndex = defaultValue
    ? options.findIndex(
        (option) =>
          isSelectOption(option) &&
          option.value === defaultValue &&
          !option.disabled,
      )
    : -1;

  if (selectedIndex === -1) {
    selectedIndex = options.findIndex(
      (option) => isSelectOption(option) && !option.disabled,
    );
  }

  if (selectedIndex === -1) {
    selectedIndex = 0;
  }

  const rl = readline.createInterface({ input, output });
  readline.emitKeypressEvents(input, rl);
  if (typeof input.setRawMode === "function") {
    input.setRawMode(true);
  }

  const instructions = `Use <↑/↓> or <k/j> to navigate, <Enter> to select, <Ctrl+C> to exit`;
  let errorMessage = "";
  const allDisabled = options.every(
    (option) => isSelectOption(option) && option.disabled,
  );

  let lastUILineCount = 0;

  function renderOptions() {
    // Clear only the previous UI lines
    if (lastUILineCount > 0) {
      for (let i = 0; i < lastUILineCount; i++) {
        process.stdout.write("\x1b[1A\x1b[2K");
      }
    }
    // Print new prompt UI and track its line count
    lastUILineCount = renderPromptUI({
      title,
      content,
      options,
      selectedIndex,
      errorMessage,
      displayInstructions,
      allDisabled,
      instructions,
      borderColor,
      titleColor,
      contentColor,
      contentTypography,
      debug,
      ...(maxItems ? { maxItems } : {}),
      ...(titleVariant ? { titleVariant } : {}),
      titleTypography,
      terminalWidth: customTerminalWidth,
      isRerender: true,
    });
  }

  // Initial render - render everything
  lastUILineCount = renderPromptUI({
    title,
    content,
    options,
    selectedIndex,
    errorMessage,
    displayInstructions,
    allDisabled,
    instructions,
    borderColor,
    titleColor,
    contentColor,
    contentTypography,
    debug,
    ...(maxItems ? { maxItems } : {}),
    ...(titleVariant ? { titleVariant } : {}),
    titleTypography,
    terminalWidth: customTerminalWidth,
    isRerender: false,
  });

  return new Promise<T>((resolve) => {
    function handleKeypress(_str: string, key: readline.Key): void {
      if (allDisabled) {
        if (key.name === "c" && key.ctrl) {
          void endPrompt(true);
          return;
        }
        return;
      }

      if (key.name === "up" || key.name === "k") {
        moveSelectionUp();
      } else if (key.name === "down" || key.name === "j") {
        moveSelectionDown();
      } else if (key.name === "return") {
        void confirmSelection();
      } else if (key.name === "c" && key.ctrl) {
        void endPrompt(true);
      }
    }

    function moveSelectionUp() {
      const originalPointer = selectedIndex;
      do {
        selectedIndex = (selectedIndex - 1 + options.length) % options.length;
        const option = options[selectedIndex];
        if (option && isSelectOption(option) && !option.disabled) {
          break;
        }
      } while (selectedIndex !== originalPointer);
      renderOptions();
    }

    function moveSelectionDown() {
      const originalPointer = selectedIndex;
      do {
        selectedIndex = (selectedIndex + 1) % options.length;
        const option = options[selectedIndex];
        if (option && isSelectOption(option) && !option.disabled) {
          break;
        }
      } while (selectedIndex !== originalPointer);
      renderOptions();
    }

    async function confirmSelection() {
      const option = options[selectedIndex];
      if (!option || !isSelectOption(option)) {
        errorMessage = "This option is not selectable.";
        renderOptions();
        return;
      }

      if (option.disabled) {
        errorMessage = "This option is disabled";
        renderOptions();
        return;
      }

      if (required && !option.value) {
        errorMessage = "You must select an option.";
        renderOptions();
        return;
      }

      cleanup();
      resolve(option.value);

      deleteLastLine();
      await completePrompt(
        "select",
        false,
        endTitle,
        endTitleColor,
        titleTypography,
        titleVariant ? titleVariant : undefined,
        border,
        borderColor,
        undefined,
        true,
      );
    }

    async function endPrompt(isCtrlC = false) {
      await completePrompt(
        "select",
        isCtrlC,
        endTitle,
        endTitleColor,
        titleTypography,
        titleVariant ? titleVariant : undefined,
        border,
        borderColor,
        undefined,
        false,
      );
      cleanup(isCtrlC);
    }

    function cleanup(isCtrlC = false) {
      if (typeof input.setRawMode === "function") {
        input.setRawMode(false);
      }
      rl.close();
      input.removeListener("keypress", handleKeypress);
      if (isCtrlC) {
        process.exit(0);
      }
    }

    input.on("keypress", handleKeypress);
  });
}
