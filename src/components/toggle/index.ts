import pc from "picocolors";
import { stdin as input, stdout as output } from "process";
import readline from "readline";

import type {
  ColorName,
  TypographyName,
  VariantName,
} from "~/types/general.js";

import { bar, fmt, msg, symbols } from "~/utils/messages.js";

export async function togglePrompt<T extends string>(params: {
  title: string;
  options: [T, T];
  defaultValue?: T;
  borderColor?: ColorName;
  titleColor?: ColorName;
  titleTypography?: TypographyName;
  titleVariant?: VariantName;
  border?: boolean;
  endTitle?: string;
  endTitleColor?: ColorName;
}): Promise<boolean> {
  const {
    title = "",
    options,
    defaultValue,
    borderColor = "viceGradient",
    titleColor = "blueBright",
    titleTypography = "bold",
    titleVariant,
    border = true,
    endTitle = "",
    endTitleColor = "dim",
  } = params;

  let selectedIndex = defaultValue
    ? options.findIndex((option) => option === defaultValue)
    : 0;
  if (selectedIndex === -1) {
    selectedIndex = 0;
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

    // Display error message if present; otherwise, show instructions
    if (errorMessage) {
      outputStr += `${pc.redBright(symbols.step_error)}  ${errorMessage}\n`;
    } else {
      outputStr += `${formattedBar}  ${pc.dim(instructions)}\n`;
    }

    const displayOptions = options.map((option, index) => {
      return index === selectedIndex ? pc.cyanBright(option) : option;
    });

    const displayString = displayOptions.join(" / ");
    outputStr += `${formattedBar}  ${displayString}\n`;

    process.stdout.write(outputStr);
    linesRendered = 3; // 1 for title line, 1 for instructions/error line, 1 for options line
  }

  renderOption();

  return new Promise<boolean>((resolve) => {
    function onKeyPress(_str: string, key: readline.Key) {
      if (key.name === "left" || key.name === "h") {
        selectedIndex = (selectedIndex - 1 + options.length) % options.length;
        errorMessage = "";
        renderOption();
      } else if (key.name === "right" || key.name === "l") {
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
