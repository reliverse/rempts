import { re } from "@reliverse/relico";
import { stdin as input, stdout as output } from "node:process";
import readline from "node:readline";

import type {
  BorderColorName,
  ColorName,
  SelectOption,
  TypographyName,
  VariantName,
} from "~/libs/core/core-types.js";

import { msg, symbols } from "~/libs/core/core-impl/msg-fmt/messages.js";
import { deleteLastLine } from "~/libs/core/core-impl/msg-fmt/terminal.js";
import { completePrompt } from "~/libs/core/core-impl/utils/prompt-end.js";
import { streamText } from "~/libs/core/core-impl/utils/stream-text.js";

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
  debug?: boolean;
  terminalWidth?: number;
  displayInstructions?: boolean;
  shouldStream?: boolean;
  streamDelay?: number;
};

/**
 * Renders the prompt UI by printing
 * Returns the number of interactive UI lines rendered
 */
async function renderPromptUI<T extends string>(params: {
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
  titleVariant?: VariantName;
  titleTypography?: TypographyName;
  terminalWidth?: number;
  isRerender?: boolean;
  shouldStream?: boolean;
  streamDelay?: number;
}): Promise<number> {
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
    titleVariant,
    titleTypography,
    isRerender = false,
    shouldStream = false,
    streamDelay = 20,
  } = params;

  // Only render title and content on the first render.
  if (!isRerender) {
    if (shouldStream) {
      deleteLastLine();
      msg({ type: "M_BAR", title: "" });
      await streamText({
        text: title,
        delay: streamDelay,
        color: titleColor,
        newline: false,
        clearLine: true,
      });
      process.stdout.write("\r");
      msg({
        type: "M_GENERAL",
        title,
        titleColor,
        titleVariant,
        titleTypography,
      });
      if (content) {
        msg({
          type: "M_NULL",
          content,
          contentColor,
          contentTypography,
        });
      }
    } else {
      msg({ type: "M_GENERAL", title, titleColor });
      if (content) {
        msg({
          type: "M_NULL",
          content,
          contentColor,
          contentTypography,
        });
      }
    }
  }

  let uiLineCount = 0;
  if (errorMessage) {
    msg({
      type: "M_ERROR",
      title: `${re.redBright(symbols.step_error)} ${re.redBright(errorMessage)}`,
    });
    uiLineCount++;
  } else if (allDisabled) {
    msg({ type: "M_ERROR", title: re.redBright("All options are disabled.") });
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
    msg({ type: "M_NULL", title: `${prefix}${labelColor}${hint}` });
    uiLineCount++;
  }

  if (debug) {
    console.log({ optionsCount: options.length });
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
    debug = false,
    terminalWidth: customTerminalWidth = 90,
    displayInstructions = false,
    shouldStream = false,
    streamDelay = 20,
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
  const instructions =
    "Use <↑/↓> or <k/j> to navigate, <Enter> to select, <Ctrl+C> to exit";
  let errorMessage = "";
  const allDisabled = options.every(
    (option) => isSelectOption(option) && option.disabled,
  );
  let lastUILineCount = 0;

  function renderOptions() {
    if (lastUILineCount > 0) {
      for (let i = 0; i < lastUILineCount; i++) {
        process.stdout.write("\x1b[1A\x1b[2K");
      }
    }
    void renderPromptUI({
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
      titleVariant,
      titleTypography,
      terminalWidth: customTerminalWidth,
      isRerender: true,
      shouldStream,
      streamDelay,
    }).then((count) => {
      lastUILineCount = count;
    });
  }

  lastUILineCount = await renderPromptUI({
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
    titleVariant,
    titleTypography,
    terminalWidth: customTerminalWidth,
    isRerender: false,
    shouldStream,
    streamDelay,
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
        if (option && isSelectOption(option) && !option.disabled) break;
      } while (selectedIndex !== originalPointer);
      renderOptions();
    }
    function moveSelectionDown() {
      const originalPointer = selectedIndex;
      do {
        selectedIndex = (selectedIndex + 1) % options.length;
        const option = options[selectedIndex];
        if (option && isSelectOption(option) && !option.disabled) break;
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
        errorMessage = "You must select a valid option.";
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
