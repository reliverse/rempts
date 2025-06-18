import { re } from "@reliverse/relico";
import { relinka } from "@reliverse/relinka";
import { stdin as input, stdout as output } from "node:process";
import readline from "node:readline";

import type {
  ColorName,
  TogglePromptParams,
  TypographyName,
  VariantName,
} from "~/types.js";

import { msg } from "~/components/msg-fmt/messages.js";
import { deleteLastLine } from "~/components/msg-fmt/terminal.js";
import { completePrompt } from "~/components/utils/prompt-end.js";

/**
 * Renders the toggle prompt using msg() calls.
 * Returns the number of interactive UI lines rendered (for clearing during re-renders).
 */
function renderTogglePrompt<T extends string>(params: {
  title: string;
  content: string;
  options: [T, T];
  selectedIndex: number;
  errorMessage: string;
  instructions: string;
  borderColor: ColorName;
  titleColor: ColorName;
  titleTypography: TypographyName;
  titleVariant?: VariantName;
  contentColor: ColorName;
  contentTypography: TypographyName;
  border: boolean;
  displayInstructions: boolean;
  debug: boolean;
  isRerender?: boolean;
}): number {
  const {
    title,
    content,
    options,
    selectedIndex,
    errorMessage,
    instructions,
    titleColor,
    titleTypography,
    titleVariant,
    contentColor,
    contentTypography,
    displayInstructions,
    debug,
    isRerender = false,
  } = params;

  // Only render title and content on first render
  if (!isRerender) {
    // Title
    msg({
      type: "M_GENERAL",
      title,
      titleColor,
      titleTypography,
      ...(titleVariant ? { titleVariant } : {}),
    });

    // Content - use string content directly without bar
    if (content) {
      msg({
        type: "M_NULL",
        content: content
          .split("\n")
          .map((line) => line.trim())
          .join("\n"),
        contentColor,
        contentTypography,
      });
    }
  }

  let uiLineCount = 0;

  if (errorMessage) {
    msg({
      type: "M_NULL",
      title: re.redBright(errorMessage),
    });
    uiLineCount++;
  } else if (displayInstructions && !isRerender) {
    msg({
      type: "M_NULL",
      title: re.yellow(instructions),
    });
    uiLineCount++;
  }

  const displayString = options
    .map((option, index) =>
      index === selectedIndex ? re.yellow(option) : re.reset(option),
    )
    .join(re.dim(re.reset(" / ")));

  msg({ type: "M_NULL", title: displayString });
  uiLineCount++;

  if (debug) {
    relinka("log", "", {
      selectedIndex,
      displayOptions: options,
    });
  }

  return uiLineCount;
}

/**
 * A toggle prompt that lets the user choose between two options (Yes/No style).
 */
export async function togglePrompt<T extends string>(
  params: TogglePromptParams<T>,
): Promise<boolean> {
  const {
    title = "",
    content = "",
    options = ["Yes", "No"] as [T, T],
    defaultValue = "Yes" as T,
    borderColor = "dim",
    titleColor = "cyan",
    titleTypography = "none",
    titleVariant,
    contentColor = "dim",
    contentTypography = "italic",
    border = true,
    endTitle = "",
    endTitleColor = "dim",
    displayInstructions = false,
    debug = false,
  } = params;

  if (options.length !== 2) {
    throw new Error("togglePrompt requires exactly two options.");
  }

  let selectedIndex = options.findIndex((option) => option === defaultValue);
  if (selectedIndex === -1) {
    selectedIndex = 0;
  }

  const rl = readline.createInterface({ input, output });
  readline.emitKeypressEvents(input, rl);
  if (typeof input.setRawMode === "function") {
    input.setRawMode(true);
  }

  const instructions =
    "Use <←/→> or <h/l> to navigate, <Enter> to select, <Ctrl+C> to exit";
  let errorMessage = "";

  let lastUILineCount = 0;

  function renderOptions() {
    // Clear only the previous UI lines
    if (lastUILineCount > 0) {
      for (let i = 0; i < lastUILineCount; i++) {
        process.stdout.write("\x1b[1A\x1b[2K");
      }
    }
    // Render new lines and track their count
    lastUILineCount = renderTogglePrompt({
      title,
      content,
      options,
      selectedIndex,
      errorMessage,
      instructions,
      borderColor,
      titleColor,
      titleTypography,
      ...(titleVariant ? { titleVariant } : {}),
      contentColor,
      contentTypography,
      border,
      displayInstructions,
      debug,
      isRerender: true,
    });
  }

  // Initial render - render everything
  lastUILineCount = renderTogglePrompt({
    title,
    content,
    options,
    selectedIndex,
    errorMessage,
    instructions,
    borderColor,
    titleColor,
    titleTypography,
    ...(titleVariant ? { titleVariant } : {}),
    contentColor,
    contentTypography,
    border,
    displayInstructions,
    debug,
    isRerender: false,
  });

  return new Promise<boolean>((resolve) => {
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

    function endPrompt(isCtrlC = false) {
      if (endTitle !== "") {
        msg({
          type: "M_END",
          title: endTitle,
          titleColor: endTitleColor,
          titleTypography,
          ...(titleVariant ? { titleVariant } : {}),
          border,
          borderColor,
        });
      }
      cleanup(isCtrlC);
    }

    function handleKeypress(_str: string, key: readline.Key): void {
      if (key.name === "left" || key.name === "h") {
        selectedIndex = (selectedIndex - 1 + options.length) % options.length;
        errorMessage = "";
        renderOptions();
      } else if (key.name === "right" || key.name === "l") {
        selectedIndex = (selectedIndex + 1) % options.length;
        errorMessage = "";
        renderOptions();
      } else if (key.name === "return") {
        const selectedOption = options[selectedIndex];
        if (!selectedOption) {
          errorMessage = "You must select an option.";
          renderOptions();
        } else {
          cleanup();
          // Return boolean: first option = true, second option = false
          const booleanValue = selectedIndex === 0;
          void completePrompt(
            "toggle",
            false,
            endTitle,
            endTitleColor,
            titleTypography,
            titleVariant ? titleVariant : undefined,
            border,
            borderColor,
            undefined,
            booleanValue,
          );
          resolve(booleanValue);
          deleteLastLine();
          msg({ type: "M_BAR", borderColor });
        }
      } else if (key.name === "c" && key.ctrl) {
        endPrompt(true);
      }
    }

    input.on("keypress", handleKeypress);
  });
}
