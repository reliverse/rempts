import pc from "picocolors";
import { stdin as input, stdout as output } from "process";
import readline from "readline";

import type {
  ColorName,
  TypographyName,
  VariantName,
} from "~/types/general.js";

import { deleteLastLine } from "~/main.js";
import { bar, fmt, msg, symbols } from "~/utils/messages.js";

export async function togglePrompt<T extends string>(params: {
  title: string;
  content?: string;
  options?: [T, T];
  defaultValue?: T;
  borderColor?: ColorName;
  titleColor?: ColorName;
  titleTypography?: TypographyName;
  titleVariant?: VariantName;
  contentColor?: ColorName;
  contentTypography?: TypographyName;
  border?: boolean;
  endTitle?: string;
  endTitleColor?: ColorName;
}): Promise<boolean> {
  const {
    title = "",
    content = "",
    options = ["Yes", "No"],
    defaultValue = "Yes",
    borderColor = "viceGradient",
    titleColor = "blueBright",
    titleTypography = "bold",
    titleVariant,
    contentColor = "dim",
    contentTypography = "bold",
    border = true,
    endTitle = "",
    endTitleColor = "dim",
  } = params;

  // Validate options length
  if (options.length !== 2) {
    throw new Error("togglePrompt requires exactly two options.");
  }

  let selectedIndex = options.findIndex((option) => option === defaultValue);
  if (selectedIndex === -1) {
    selectedIndex = 0; // Default to first option if defaultValue not found
  }

  const rl = readline.createInterface({ input, output });
  readline.emitKeypressEvents(input, rl);
  if (typeof input.setRawMode === "function") {
    input.setRawMode(true);
  }

  const formattedBar = bar({ borderColor });

  let linesRendered = 0;
  const instructions = `Use <←/→> or <h/l> to navigate, <Enter> to select, <Ctrl+C> to exit`;
  let errorMessage = ""; // Initialize error message

  function renderOption() {
    if (linesRendered > 0) {
      process.stdout.write(`\x1B[${linesRendered}A`);
    }

    let outputStr = `${pc.greenBright(symbols.step_active)}  ${fmt({
      hintColor: "gray",
      type: "M_NULL",
      title: title,
      titleColor,
      titleTypography,
      titleVariant,
    })}\n`;

    // Render content if provided
    if (content) {
      outputStr += `${fmt({
        type: "M_NULL",
        content,
        contentColor,
        contentTypography,
      })}\n`;
    }

    // Display error message if present; otherwise, show instructions
    if (errorMessage) {
      outputStr += `${pc.redBright(symbols.step_error)}  ${errorMessage}\n`;
    } else {
      outputStr += `${formattedBar}  ${pc.dim(instructions)}\n`;
    }

    // Display options with the selected option highlighted
    const displayOptions = options.map((option, index) => {
      return index === selectedIndex ? pc.cyanBright(option) : option;
    });

    const displayString = displayOptions.join(" / ");
    outputStr += `${formattedBar}  ${displayString}\n`;

    process.stdout.write(outputStr);
    linesRendered = 4; // 1 for step symbol + title, 1 for content, 1 for instructions/error, 1 for options
  }

  renderOption();

  return new Promise<boolean>((resolve) => {
    function onKeyPress(_str: string, key: readline.Key) {
      if (key.name === "left" || key.name === "h") {
        // Move selection to the left option
        selectedIndex = (selectedIndex - 1 + options.length) % options.length;
        errorMessage = "";
        renderOption();
      } else if (key.name === "right" || key.name === "l") {
        // Move selection to the right option
        selectedIndex = (selectedIndex + 1) % options.length;
        errorMessage = "";
        renderOption();
      } else if (key.name === "return") {
        // Confirm selection
        const selectedOption = options[selectedIndex];
        if (!selectedOption) {
          errorMessage = "You must select an option.";
          renderOption();
        } else {
          cleanup();
          // Return boolean: first option = true, second option = false
          const booleanValue = selectedIndex === 0;
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
          resolve(booleanValue);
          deleteLastLine();
          msg({
            type: "M_MIDDLE",
            title: "",
          });
        }
      } else if (key.name === "c" && key.ctrl) {
        // Ctrl+C
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
