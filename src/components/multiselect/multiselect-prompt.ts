import { re } from "@reliverse/relico";
import { relinka } from "@reliverse/relinka";
import { stdin as input, stdout as output } from "node:process";
import readline from "node:readline";

import type {
  ColorName,
  MultiselectPromptParams,
  SelectOption,
  SeparatorOption,
  TypographyName,
  VariantName,
} from "~/types.js";

import { msg, symbols } from "~/components/msg-fmt/messages.js";
import { deleteLastLine } from "~/components/msg-fmt/terminal.js";
import { completePrompt } from "~/components/utils/prompt-end.js";

function isSelectOption<T>(
  option: SelectOption<T> | SeparatorOption,
): option is SelectOption<T> {
  return !("separator" in option);
}

/**
 * Renders the UI for the multiselect prompt
 * Returns the number of interactive UI lines rendered
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
    titleVariant,
    titleTypography,
    isRerender = false,
  } = params;

  if (!isRerender) {
    msg({
      type: "M_NULL",
      title,
      titleColor,
      ...(titleTypography ? { titleTypography } : {}),
      ...(titleVariant ? { titleVariant } : {}),
    });
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
    msg({ type: "M_NULL", title: re.redBright("All options are disabled.") });
    uiLineCount++;
  } else if (displayInstructions && !isRerender) {
    msg({ type: "M_NULL", title: re.blue(instructions) });
    uiLineCount++;
  }

  // Render all options
  for (let index = 0; index < options.length; index++) {
    const option = options[index];
    if (!option) continue;
    if (!isSelectOption(option)) {
      const width = option.width ?? 20;
      const symbolKey = option.symbol ?? "line";
      const lineSymbol = symbolKey in symbols ? symbols[symbolKey] : "─";
      msg({ type: "M_NULL", title: re.dim(lineSymbol.repeat(width)) });
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

  if (debug) {
    relinka("log", "", { optionsCount: options.length });
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
    debug = false,
    terminalWidth: customTerminalWidth = 90,
    displayInstructions = false,
    minSelect = 0,
    maxSelect,
    selectAll = false,
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
    selectAll
      ? options
          .map((opt, index) =>
            opt && isSelectOption(opt) && !opt.disabled ? index : -1,
          )
          .filter((i) => i !== -1)
      : defaultValue
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
    "Use <↑/↓> to navigate, <Space> to toggle, <A> to toggle all";

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
    if (lastUILineCount > 0) {
      for (let i = 0; i < lastUILineCount; i++) {
        process.stdout.write("\x1b[1A\x1b[2K");
      }
    }
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
      borderColor,
      titleVariant,
      titleTypography,
      terminalWidth: customTerminalWidth,
      resized: false,
      isRerender: true,
    });
  }
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
      const selectedCount = selectedOptions.size;
      if (selectedCount < minSelect) {
        deleteLastLine();
        errorMessage = `You must select at least ${minSelect} option${
          minSelect !== 1 ? "s" : ""
        }.`;
        renderOptions();
        return;
      }
      if (maxSelect !== undefined && selectedCount > maxSelect) {
        deleteLastLine();
        errorMessage = `You can select at most ${maxSelect} option${
          maxSelect !== 1 ? "s" : ""
        }.`;
        renderOptions();
        return;
      }
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
