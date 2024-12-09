import cliTruncate from "cli-truncate";
import { stdin as input, stdout as output } from "node:process";
import readline from "node:readline";
import pc from "picocolors";
import terminalSize from "terminal-size";
import wrapAnsi from "wrap-ansi";

import type {
  ColorName,
  TypographyName,
  VariantName,
} from "~/types/general.js";

import { colorize, deleteLastLine, terminalColumns } from "~/main.js";
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
  linesHandler?: "wrap" | "truncate" | "columns" | "clear";
  terminalWidth?: number;
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
    linesHandler = "wrap", 
    terminalWidth: customTerminalWidth = 90,
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

  const allDisabled = options
    .filter(isSelectOption)
    .every((option) => option.disabled);

  let resized = false;
  process.stdout.on("resize", () => {
    resized = true;
  });

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

  function renderOptions() {
    const effectiveTerminalWidth =
      customTerminalWidth ?? process.stdout.columns ?? 80;

    if (resized) {
      process.stdout.write("\x1Bc");
      resized = false;
      currentLinesRendered = 0;
    } else {
      if (currentLinesRendered > 0) {
        process.stdout.write(`\x1B[${currentLinesRendered}A`);
      }
    }

    const linesToPrint: string[] = [];
    linesToPrint.push(
      `${pc.greenBright(symbols.step_active)}  ${colorize(
        title,
        titleColor,
        titleTypography,
      )}`,
    );

    if (content) {
      linesToPrint.push(
        fmt({
          type: "M_NULL",
          content,
          contentColor,
          contentTypography,
        }),
      );
    }

    if (errorMessage) {
      linesToPrint.push(
        `${pc.redBright(symbols.step_error)}  ${pc.redBright(errorMessage)}`,
      );
    } else if (allDisabled) {
      linesToPrint.push(
        `${formattedBar}  ${pc.dim("All options are disabled.")}`,
      );
    } else {
      linesToPrint.push(`${formattedBar}  ${pc.dim(instructions)}`);
    }

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
      linesToPrint.push(`${formattedBar}  ${pc.dim("...")}`);
    }

    for (let index = startIdx; index <= endIdx; index++) {
      const option = options[index];

      if (!isSelectOption(option)) {
        const width = option.width ?? 20;
        const symbol = option.symbol ?? "line";
        const lineSymbol = symbol in symbols ? symbols[symbol] : "─";
        linesToPrint.push(
          `${formattedBar}  ${pc.dim(lineSymbol.repeat(width))}`,
        );
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

      linesToPrint.push(
        `${formattedBar} ${prefix}${checkbox} ${optionLabel}${pc.dim(hint)}`,
      );
    }

    if (shouldRenderBottomEllipsis) {
      linesToPrint.push(`${formattedBar}  ${pc.dim("...")}`);
    }

    let totalPrintedLines = 0;
    switch (linesHandler) {
      case "clear":
        // Clear the screen and print fresh
        process.stdout.write("\x1Bc");
        // Print the lines as-is (wrapped)
        for (const line of linesToPrint) {
          const wrapped = wrapAnsi(line, effectiveTerminalWidth, {
            hard: false,
            trim: false,
          });
          const wrappedLines = wrapped.split("\n");

          if (wrappedLines.length === 1) {
            process.stdout.write(`${wrappedLines[0]}\n`);
            totalPrintedLines += 1;
          } else {
            process.stdout.write(`${wrappedLines[0]}\n`);
            totalPrintedLines += 1;
            for (let i = 1; i < wrappedLines.length; i++) {
              process.stdout.write(`${formattedBar}  ${wrappedLines[i]}\n`);
              totalPrintedLines += 1;
            }
          }
        }
        break;

      case "truncate":
        for (const line of linesToPrint) {
          const truncated = cliTruncate(line, effectiveTerminalWidth, {
            position: "middle",
            truncationCharacter: "…",
            space: false,
            preferTruncationOnSpace: false,
          });
          process.stdout.write(`${truncated}\n`);
          totalPrintedLines += 1;
        }
        break;

      case "columns":
        // Convert linesToPrint into tableData for columns mode
        const tableData = linesToPrint.map((l) => [l]);
        const tableString = terminalColumns(tableData, {
          stdoutColumns: effectiveTerminalWidth,
        });
        process.stdout.write(tableString + "\n");
        totalPrintedLines = tableString.split("\n").length;
        break;

      default:
        // wrap mode
        for (const line of linesToPrint) {
          const wrapped = wrapAnsi(line, effectiveTerminalWidth, {
            hard: false,
            trim: false,
          });
          const wrappedLines = wrapped.split("\n");

          if (wrappedLines.length === 1) {
            // No wrapping occurred; print line as-is
            process.stdout.write(`${wrappedLines[0]}\n`);
            totalPrintedLines += 1;
          } else {
            // Multiple wrapped lines:
            // Print the first line as-is
            process.stdout.write(`${wrappedLines[0]}\n`);
            totalPrintedLines += 1;

            // For subsequent wrapped lines, add `formattedBar`
            for (let i = 1; i < wrappedLines.length; i++) {
              process.stdout.write(`${formattedBar}  ${wrappedLines[i]}\n`);
              totalPrintedLines += 1;
            }
          }
        }
        break;
    }

    currentLinesRendered = totalPrintedLines;

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
  }

  renderOptions();

  return new Promise<T[]>((resolve) => {
    function onKeyPress(_str: string, key: readline.Key) {
      if (allDisabled) {
        if (key.name === "c" && key.ctrl) {
          msg({ type: "M_MIDDLE" });
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
          msg({ type: "M_MIDDLE" });
        } else {
          deleteLastLine();
          errorMessage = "You must select at least one option.";
          renderOptions();
        }
      } else if (key.name === "c" && key.ctrl) {
        msg({ type: "M_MIDDLE" });
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
