import { re } from "@reliverse/relico";
import { stdin as input, stdout as output } from "node:process";
import readline from "node:readline";
import terminalSize from "terminal-size";

import type { BorderColorName, SelectOption, VariantName } from "~/main.js";

import {
  deleteLastLine,
  msg,
  symbols,
  type ColorName,
  type TypographyName,
} from "~/main.js";
import { completePrompt } from "~/utils/prompt-end.js";

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
    titleVariant,
    titleTypography,
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
      ...(titleTypography ? { titleTypography } : {}),
      ...(titleVariant ? { titleVariant } : {}),
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
      title: `${re.redBright(symbols.step_error)} ${re.redBright(errorMessage)}`,
    });
    uiLineCount++;
  } else if (allDisabled) {
    msg({
      type: "M_NULL",
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

    const isSelected = selectedOptions.has(index);
    const isHighlighted = index === pointer;
    const isDisabled = option.disabled;
    const checkbox = isSelected ? "[x]" : "[ ]";
    const prefix = isHighlighted ? re.yellow(re.reset("> ")) : "  ";
    const labelColor = isDisabled
      ? re.dim(re.reset(option.label))
      : isHighlighted
        ? re.reset(re.yellow(option.label))
        : re.reset(option.label);

    const hint = option.hint
      ? re.reset(
          ` (${isDisabled ? re.dim(option.hint) : re.gray(option.hint)})`,
        )
      : "";

    const formattedCheckbox = isHighlighted ? re.yellow(checkbox) : checkbox;

    msg({
      type: "M_NULL",
      title: `${prefix}${formattedCheckbox} ${labelColor}${hint}`,
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
    allowAllUnselected = false,
  } = params;

  let pointer =
    defaultValue.length > 0
      ? options.findIndex(
          (opt) =>
            opt &&
            isSelectOption(opt) &&
            defaultValue.includes(opt.value) &&
            !opt.disabled,
        )
      : 0;

  if (pointer === -1) {
    pointer = options.findIndex(
      (opt) => opt && isSelectOption(opt) && !opt.disabled,
    );
    if (pointer === -1) {
      pointer = 0;
    }
  }

  const selectedOptions = new Set<number>(
    defaultValue
      .map((val) =>
        options.findIndex((o) => o && isSelectOption(o) && o.value === val),
      )
      .filter(
        (i) =>
          i >= 0 &&
          options[i] &&
          isSelectOption(options[i]) &&
          !options[i].disabled,
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

  const instructions =
    "Use <↑/↓> to navigate, <Space> to toggle, <A> to select/deselect all";

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
      if (
        currentOption &&
        isSelectOption(currentOption) &&
        !currentOption.disabled
      ) {
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
      if (
        currentOption &&
        isSelectOption(currentOption) &&
        !currentOption.disabled
      ) {
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
      ...(maxItems ? { maxItems } : {}),
      borderColor,
      ...(titleVariant ? { titleVariant } : {}),
      ...(titleTypography ? { titleTypography } : {}),
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
    ...(maxItems ? { maxItems } : {}),
    borderColor,
    ...(titleVariant ? { titleVariant } : {}),
    ...(titleTypography ? { titleTypography } : {}),
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
      input.removeListener("keypress", handleKeypress);
      if (isCtrlC) {
        process.exit(0);
      }
    }

    async function endPrompt(isCtrlC = false) {
      await completePrompt(
        "multiselect",
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

    async function confirmSelection() {
      if (allowAllUnselected || selectedOptions.size > 0) {
        const selectedValues = Array.from(selectedOptions)
          .filter((idx) => {
            const opt = options[idx];
            return opt && isSelectOption(opt) && !opt.disabled;
          })
          .map((idx) => {
            const opt = options[idx];
            return opt && isSelectOption(opt) ? opt.value : null;
          })
          .filter((val): val is T => val !== null && val !== undefined);

        cleanup();
        resolve(selectedValues);

        deleteLastLine();
        await completePrompt(
          "multiselect",
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
      } else {
        deleteLastLine();
        errorMessage = "You must select at least one option.";
        renderOptions();
      }
    }

    function handleKeypress(_str: string, key: readline.Key): void {
      if (allDisabled) {
        if (key.name === "c" && key.ctrl) {
          void endPrompt(true);
          return;
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
          if (
            !currentOption ||
            !isSelectOption(currentOption) ||
            currentOption.disabled
          ) {
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
          void confirmSelection();
          break;

        case "c":
          if (key.ctrl) {
            void endPrompt(true);
          }
          break;

        case "a":
          toggleSelectAll();
          errorMessage = "";
          renderOptions();
          break;
      }
    }

    input.on("keypress", handleKeypress);
  });
}
