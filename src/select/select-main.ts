import cliTruncate from "cli-truncate";
import { stdin as input, stdout as output } from "node:process";
import readline from "node:readline";
import pc from "picocolors";
import terminalSize from "terminal-size";
import wrapAnsi from "wrap-ansi";

import type {
  ColorName,
  VariantName,
  TypographyName,
} from "~/types/general.js";

import { deleteLastLine, terminalColumns } from "~/main.js";
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
  content?: string;
  options: (SelectOption<T> | SeparatorOption)[];
  defaultValue?: T;
  required?: boolean;
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
}): Promise<T> {
  const {
    title = "",
    content = "",
    options,
    defaultValue,
    required = false,
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

  let selectedIndex = defaultValue
    ? options.findIndex(
        (option) =>
          "value" in option &&
          option.value === defaultValue &&
          !option.disabled,
      )
    : -1;

  if (selectedIndex === -1) {
    selectedIndex = options.findIndex(
      (option) => "disabled" in option && !option.disabled,
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

  const formattedBar = bar({ borderColor });

  let currentLinesRendered = 0;
  const instructions = `Use <↑/↓> or <k/j> to navigate, <Enter> to select, <Ctrl+C> to exit`;
  let errorMessage = "";

  const allDisabled = options.every(
    (option) => "disabled" in option && option.disabled,
  );

  function renderOptions() {
    const effectiveTerminalWidth =
      customTerminalWidth ?? process.stdout.columns ?? 80;

    if (currentLinesRendered > 0) {
      process.stdout.write(`\x1B[${currentLinesRendered}A`);
    }

    const linesToPrint: string[] = [];

    linesToPrint.push(
      `${pc.greenBright(symbols.step_active)}  ${fmt({
        hintColor: "gray",
        type: "M_NULL",
        title,
        titleColor,
      })}`,
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
      linesToPrint.push(`${pc.redBright(symbols.step_error)}  ${errorMessage}`);
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
      linesToPrint.push(`${formattedBar}  ${pc.dim("...")}`);
    }

    for (let index = startIdx; index <= endIdx; index++) {
      const option = options[index];
      if ("separator" in option) {
        const width = option.width ?? 20;
        const symbol = option.symbol ?? "line";
        const lineSymbol = symbol in symbols ? symbols[symbol] : "─";
        linesToPrint.push(
          `${formattedBar}  ${pc.dim(lineSymbol.repeat(width))}`,
        );
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
      linesToPrint.push(`${formattedBar} ${prefix}${optionLabel}${hint}`);
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

  return new Promise<T>((resolve) => {
    function onKeyPress(str: string, key: readline.Key) {
      if (allDisabled) {
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
