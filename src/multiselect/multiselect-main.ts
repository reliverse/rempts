import { stdin as input, stdout as output } from "node:process";
import readline from "node:readline";
import pc from "picocolors";
import terminalSize from "terminal-size";

import type {
  ColorName,
  TypographyName,
  VariantName,
} from "~/types/general.js";

import { deleteLastLine } from "~/main.js";
import { msg, msgUndoAll, bar, symbols } from "~/utils/messages.js";

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

type MultiselectPromptParams<T extends string> = {
  title: string;
  content?: string;
  options: (SelectOption<T> | SeparatorOption)[];
  defaultValue?: T[];
  borderColor?: ColorName;
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
  allowAllUnselected?: boolean;
};

/**
 * Renders the UI for the multiselect prompt using `msg()` for each line.
 * Returns the number of interactive UI lines rendered (for clearing during re-renders).
 */
function renderPromptUI<T extends string>(params: {
  title: string;
  content: string;
  options: (SelectOption<T> | SeparatorOption)[];
  pointer: number;
  selectedOptions: Set<number>;
  errorMessage: string;
  displayInstructions: boolean;
  instructions: string;
  allDisabled: boolean;
  titleColor: ColorName;
  contentColor: ColorName;
  contentTypography: TypographyName;
  debug: boolean;
  maxItems?: number;
  borderColor: ColorName;
  titleVariant?: VariantName;
  titleTypography?: TypographyName;
  terminalWidth?: number;
  resized: boolean;
  isRerender?: boolean;
}): number {
  const {
    title,
    content,
    options,
    pointer,
    selectedOptions,
    errorMessage,
    displayInstructions,
    instructions,
    allDisabled,
    titleColor,
    contentColor,
    contentTypography,
    debug,
    maxItems,
    borderColor,
    titleVariant,
    titleTypography,
    terminalWidth,
    isRerender = false,
  } = params;

  const size = terminalSize();
  const effectiveTerminalHeight = size.rows ?? 24;

  // Only render title and content on first render
  if (!isRerender) {
    // Title
    msg({
      type: "M_NULL",
      title,
      titleColor,
      titleTypography,
      titleVariant,
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

  if (errorMessage) {
    msg({
      type: "M_NULL",
      title: `${pc.redBright(symbols.step_error)} ${pc.redBright(errorMessage)}`,
    });
    uiLineCount++;
  } else if (allDisabled) {
    msg({
      type: "M_NULL",
      title: pc.redBright("All options are disabled."),
    });
    uiLineCount++;
  } else if (displayInstructions && !isRerender) {
    msg({
      type: "M_NULL",
      title: pc.blue(instructions),
    });
    uiLineCount++;
  }

  const effectiveMaxItems = maxItems
    ? Math.min(maxItems, options.length)
    : options.length;
  const minItems = 3;
  const displayItems = maxItems
    ? Math.max(effectiveMaxItems, minItems)
    : options.length;

  let startIdx = 0;
  let endIdx = options.length - 1;
  if (maxItems && options.length > displayItems) {
    const half = Math.floor(displayItems / 2);
    startIdx = pointer - half;
    endIdx = pointer + (displayItems - half - 1);

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
    msg({ type: "M_NULL", title: pc.dim("...") });
    uiLineCount++;
  }

  // Render options
  for (let index = startIdx; index <= endIdx; index++) {
    const option = options[index];

    if (!isSelectOption(option)) {
      const width = option.width ?? 20;
      const symbolKey = option.symbol ?? "line";
      const lineSymbol = symbolKey in symbols ? symbols[symbolKey] : "─";
      msg({
        type: "M_NULL",
        title: pc.dim(lineSymbol.repeat(width)),
      });
      uiLineCount++;
      continue;
    }

    const isSelected = selectedOptions.has(index);
    const isHighlighted = index === pointer;
    const isDisabled = option.disabled;
    const checkbox = isSelected ? "[x]" : "[ ]";
    const prefix = isHighlighted ? pc.yellow(pc.reset("> ")) : "  ";
    const labelColor = isDisabled
      ? pc.dim(pc.reset(option.label))
      : isHighlighted
        ? pc.reset(pc.yellow(option.label))
        : pc.reset(option.label);

    const hint = option.hint
      ? pc.reset(
          ` (${isDisabled ? pc.dim(option.hint) : pc.gray(option.hint)})`,
        )
      : "";

    const formattedCheckbox = isHighlighted ? pc.yellow(checkbox) : checkbox;

    msg({
      type: "M_NULL",
      title: `${prefix}${formattedCheckbox} ${labelColor}${hint}`,
    });
    uiLineCount++;
  }

  if (shouldRenderBottomEllipsis) {
    msg({ type: "M_NULL", title: pc.dim("...") });
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

export async function multiselectPrompt<T extends string>(
  params: MultiselectPromptParams<T>,
): Promise<T[]> {
  const {
    title = "",
    content = "",
    options,
    defaultValue = [],
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
    allowAllUnselected = true,
  } = params;

  let pointer =
    defaultValue.length > 0
      ? options.findIndex(
          (opt) =>
            isSelectOption(opt) &&
            defaultValue.includes(opt.value) &&
            !opt.disabled,
        )
      : 0;

  if (pointer === -1) {
    pointer = options.findIndex((opt) => isSelectOption(opt) && !opt.disabled);
    if (pointer === -1) {
      pointer = 0;
    }
  }

  const selectedOptions = new Set<number>(
    defaultValue
      .map((val) =>
        options.findIndex((o) => isSelectOption(o) && o.value === val),
      )
      .filter(
        (i) => i >= 0 && isSelectOption(options[i]) && !options[i].disabled,
      ),
  );

  const rl = readline.createInterface({ input, output });
  readline.emitKeypressEvents(input, rl);
  if (typeof input.setRawMode === "function") {
    input.setRawMode(true);
  }

  let errorMessage = "";
  const allDisabled = options
    .filter(isSelectOption)
    .every((option) => option.disabled);

  const instructions = `Use <↑/↓> to navigate, <Space> to toggle, <A> to select/deselect all`;

  function toggleSelectAll() {
    const selectableIndexes = options
      .map((opt, i) => (isSelectOption(opt) && !opt.disabled ? i : -1))
      .filter((i) => i !== -1);

    const allSelected = selectableIndexes.every((i) => selectedOptions.has(i));
    if (allSelected) {
      for (const i of selectableIndexes) {
        selectedOptions.delete(i);
      }
    } else {
      for (const i of selectableIndexes) {
        selectedOptions.add(i);
      }
    }
  }

  function movePointerUp() {
    const originalPointer = pointer;
    do {
      pointer = (pointer - 1 + options.length) % options.length;
      const currentOption = options[pointer];
      if (isSelectOption(currentOption) && !currentOption.disabled) {
        break;
      }
    } while (pointer !== originalPointer);
    errorMessage = "";
  }

  function movePointerDown() {
    const originalPointer = pointer;
    do {
      pointer = (pointer + 1) % options.length;
      const currentOption = options[pointer];
      if (isSelectOption(currentOption) && !currentOption.disabled) {
        break;
      }
    } while (pointer !== originalPointer);
    errorMessage = "";
  }

  let lastUILineCount = 0;

  function renderOptions() {
    // Clear only the previous UI lines
    if (lastUILineCount > 0) {
      for (let i = 0; i < lastUILineCount; i++) {
        process.stdout.write("\x1b[1A\x1b[2K");
      }
    }
    // Render new lines and track their count
    lastUILineCount = renderPromptUI({
      title,
      content,
      options,
      pointer,
      selectedOptions,
      errorMessage,
      displayInstructions,
      instructions,
      allDisabled,
      titleColor,
      contentColor,
      contentTypography,
      debug,
      maxItems,
      borderColor,
      titleVariant,
      titleTypography,
      terminalWidth: customTerminalWidth,
      resized: false,
      isRerender: true,
    });
  }

  // Initial render - render everything
  lastUILineCount = renderPromptUI({
    title,
    content,
    options,
    pointer,
    selectedOptions,
    errorMessage,
    displayInstructions,
    instructions,
    allDisabled,
    titleColor,
    contentColor,
    contentTypography,
    debug,
    maxItems,
    borderColor,
    titleVariant,
    titleTypography,
    terminalWidth: customTerminalWidth,
    resized: false,
    isRerender: false,
  });

  return new Promise<T[]>((resolve) => {
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

    function confirmSelection() {
      if (allowAllUnselected || selectedOptions.size > 0) {
        const selectedValues = Array.from(selectedOptions)
          .filter(
            (idx) => isSelectOption(options[idx]) && !options[idx].disabled,
          )
          .map((idx) =>
            isSelectOption(options[idx]) ? options[idx].value : null,
          )
          .filter((val): val is T => val !== null);

        cleanup();
        resolve(selectedValues);

        deleteLastLine();
        msg({ type: "M_BAR", titleColor });

        // Don't clear the final state
      } else {
        errorMessage = "You must select at least one option.";
        renderOptions();
      }
    }

    function endPrompt(isCtrlC = false) {
      // Don't clear anything unless there's an end title
      if (endTitle !== "") {
        msgUndoAll();
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
      cleanup(isCtrlC);
    }

    function onKeyPress(_str: string, key: readline.Key) {
      if (allDisabled) {
        if (key.name === "c" && key.ctrl) {
          endPrompt(true);
        }
        return;
      }

      switch (key.name) {
        case "up":
        case "k":
          movePointerUp();
          renderOptions();
          break;

        case "down":
        case "j":
          movePointerDown();
          renderOptions();
          break;

        case "space": {
          const currentOption = options[pointer];
          if (!isSelectOption(currentOption) || currentOption.disabled) {
            errorMessage = "This option is disabled";
          } else {
            if (selectedOptions.has(pointer)) {
              selectedOptions.delete(pointer);
            } else {
              selectedOptions.add(pointer);
            }
            errorMessage = "";
          }
          renderOptions();
          break;
        }

        case "return":
          confirmSelection();
          break;

        case "c":
          if (key.ctrl) {
            endPrompt(true);
          }
          break;

        case "a":
          toggleSelectAll();
          errorMessage = "";
          renderOptions();
          break;
      }
    }

    input.on("keypress", onKeyPress);
  });
}
