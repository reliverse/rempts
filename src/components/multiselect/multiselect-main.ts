import { stdin as input, stdout as output } from "node:process";
import readline from "node:readline";
import pc from "picocolors";
import terminalSize from "terminal-size";

import type {
  ColorName,
  TypographyName,
  VariantName,
} from "~/types/general.js";

import { colorize, deleteLastLine } from "~/main.js";
import { bar, symbols, msg, fmt } from "~/utils/messages.js";

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

export async function multiselectPrompt<T extends string>(params: {
  title: string;
  content?: string;
  options: (SelectOption<T> | SeparatorOption)[];
  required?: boolean;
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
}): Promise<T[]> {
  const {
    title = "",
    content = "",
    options,
    required = false,
    defaultValue = [],
    borderColor = "viceGradient",
    titleColor = "blueBright",
    titleTypography = "bold",
    titleVariant,
    contentColor = "dim",
    contentTypography = "bold",
    border = true,
    endTitle = "",
    endTitleColor = "dim",
    maxItems,
    debug = false,
  } = params;

  // Initialize pointer
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

  // Initialize selected options based on defaultValue
  const selectedOptions = new Set<number>(
    defaultValue
      .map((opt) =>
        options.findIndex((o) => isSelectOption(o) && o.value === opt),
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

  const formattedBar = bar({ borderColor });
  let currentLinesRendered = 0;
  const instructions = `Use <↑/↓> or <k/j> to navigate, <Space> to toggle, <A> to select/deselect all, <Enter> to confirm, <Ctrl+C> to exit`;
  let errorMessage = "";

  // Check if all selectable options are disabled

  const allDisabled = options
    .filter(isSelectOption)
    .every((option) => option.disabled);

  function renderOptions() {
    // Move cursor up to the start of the previous block if not first render
    if (currentLinesRendered > 0) {
      process.stdout.write(`\x1B[${currentLinesRendered}A`);
    }

    let outputStr = `${pc.greenBright(symbols.step_active)}  ${colorize(
      title,
      titleColor,
      titleTypography,
    )}\n`;

    // content line
    if (content) {
      outputStr += `${fmt({
        type: "M_NULL",
        content,
        contentColor,
        contentTypography,
      })}\n`;
    }

    if (errorMessage) {
      outputStr += `${pc.redBright(symbols.step_error)}  ${pc.redBright(errorMessage)}\n`;
    } else if (allDisabled) {
      outputStr += `${formattedBar}  ${pc.dim("All options are disabled.")}\n`;
    } else {
      outputStr += `${formattedBar}  ${pc.dim(instructions)}\n`;
    }

    // Compute terminal and display properties internally
    const size = terminalSize();
    const effectiveTerminalHeight = size.rows ?? 24;
    const availableHeight = effectiveTerminalHeight - 4;

    const effectiveMaxItems = maxItems
      ? Math.min(maxItems, options.length)
      : options.length;

    const minItems = 3;
    const displayItems = maxItems
      ? Math.max(effectiveMaxItems, minItems)
      : options.length;

    // Determine visible indices
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

    const shouldRenderTopEllipsis = maxItems ? startIdx > 0 : false;
    const shouldRenderBottomEllipsis = maxItems
      ? endIdx < options.length - 1
      : false;

    if (shouldRenderTopEllipsis) {
      outputStr += `${formattedBar}  ${pc.dim("...")}\n`;
    }

    for (let index = startIdx; index <= endIdx; index++) {
      const option = options[index];

      if (!isSelectOption(option)) {
        // Separator
        const width = option.width ?? 20;
        const symbol = option.symbol ?? "line";
        const lineSymbol = symbol in symbols ? symbols[symbol] : "─";
        outputStr += `${formattedBar}  ${pc.dim(lineSymbol.repeat(width))}\n`;
        continue;
      }

      const isSelected = selectedOptions.has(index);
      const isHighlighted = index === pointer;
      const isDisabled = option.disabled;
      const checkbox = isSelected ? "[x]" : "[ ]";
      const prefix = isHighlighted ? "> " : "  ";

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

    if (shouldRenderBottomEllipsis) {
      outputStr += `${formattedBar}  ${pc.dim("...")}\n`;
    }

    currentLinesRendered =
      1 + // Title line
      (content ? 1 : 0) + // Content line if present
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

  function toggleSelectAll() {
    const selectableIndexes = options
      .map((opt, i) => (isSelectOption(opt) && !opt.disabled ? i : -1))
      .filter((i) => i !== -1);

    const allSelected = selectableIndexes.every((i) => selectedOptions.has(i));

    if (allSelected) {
      // Deselect all
      for (const i of selectableIndexes) {
        selectedOptions.delete(i);
      }
    } else {
      // Select all
      for (const i of selectableIndexes) {
        selectedOptions.add(i);
      }
    }
  }

  renderOptions();

  return new Promise<T[]>((resolve) => {
    function onKeyPress(_str: string, key: readline.Key) {
      if (allDisabled) {
        if (key.name === "c" && key.ctrl) {
          // Ctrl+C: exit
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
        // Move up
        const originalPointer = pointer;
        do {
          pointer = (pointer - 1 + options.length) % options.length;
          const currentOption = options[pointer];
          if (isSelectOption(currentOption) && !currentOption.disabled) {
            break;
          }
        } while (pointer !== originalPointer);
        errorMessage = "";
        renderOptions();
      } else if (key.name === "down" || key.name === "j") {
        // Move down
        const originalPointer = pointer;
        do {
          pointer = (pointer + 1) % options.length;
          const currentOption = options[pointer];
          if (isSelectOption(currentOption) && !currentOption.disabled) {
            break;
          }
        } while (pointer !== originalPointer);
        errorMessage = "";
        renderOptions();
      } else if (key.name === "space") {
        // Toggle selection
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
      } else if (key.name === "return") {
        // Confirm selection
        if (!required || selectedOptions.size > 0) {
          const selectedValues = Array.from(selectedOptions)
            .filter(
              (index) =>
                isSelectOption(options[index]) && !options[index].disabled,
            )
            .map((index) =>
              isSelectOption(options[index]) ? options[index].value : null,
            );
          cleanup();
          resolve(selectedValues);
          deleteLastLine();
          msg({
            type: "M_MIDDLE",
          });
        } else {
          // Required but none selected
          deleteLastLine();
          errorMessage = "You must select at least one option.\x1B[K";
          renderOptions();
        }
      } else if (key.name === "c" && key.ctrl) {
        // Ctrl+C exit
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
      } else if (key.name === "a") {
        // Toggle select all
        toggleSelectAll();
        errorMessage = "";
        renderOptions();
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
