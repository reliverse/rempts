import { stdin as input, stdout as output } from "node:process";
import readline from "node:readline/promises";
import { re } from "@reliverse/relico";
import type { PromptOptions } from "../../types";
import { bar, fmt, msg } from "../msg-fmt/messages";
import { countLines, deleteLastLine, deleteLastLines } from "../msg-fmt/terminal";

type NumMultiSelectPromptOptions = PromptOptions & {
  defaultValue?: string[];
};

/**
 * askForInput()
 *
 * Handles character-by-character input to avoid issues with formatted prompts.
 * @param prompt The text to display before user input.
 * @returns The user input string, or null if canceled (Ctrl+C).
 */
async function askForInput(prompt: string): Promise<string | null> {
  return new Promise((resolve) => {
    let buffer = "";

    // Print the prompt manually:
    process.stdout.write(prompt);

    const onData = (data: Buffer) => {
      const str = data.toString("utf-8");

      for (const char of str) {
        // If user presses Enter or Return, we're done
        if (char === "\n" || char === "\r") {
          process.stdout.write("\n");
          cleanup();
          resolve(buffer);
          return;
        }

        // If user presses Ctrl+C
        if (char === "\u0003") {
          cleanup();
          resolve(null);
          return;
        }

        // If user presses backspace (ASCII DEL or BS)
        if (char === "\u007F" || char === "\b") {
          if (buffer.length > 0) {
            buffer = buffer.slice(0, -1);
          }
          redrawPrompt(buffer, prompt);
          continue;
        }

        // Otherwise, inject this char to the buffer
        buffer += char;
        redrawPrompt(buffer, prompt);
      }
    };

    // Attach our listener
    process.stdin.on("data", onData);

    /**
     * cleanup()
     * Removes event listener once we're finished.
     */
    const cleanup = () => {
      process.stdin.removeListener("data", onData);
    };

    /**
     * redrawPrompt()
     * Clears line and re-renders the prompt with input.
     */
    const redrawPrompt = (inputBuffer: string, textPrompt: string) => {
      process.stdout.clearLine(0);
      process.stdout.cursorTo(0);
      process.stdout.write(textPrompt + inputBuffer);
    };
  });
}

export async function numMultiSelectPrompt(opts: NumMultiSelectPromptOptions) {
  const {
    title = "",
    choices,
    defaultValue,
    titleColor = "cyan",
    titleTypography = "none",
    titleVariant,
    hint,
    hintPlaceholderColor = "blue",
    content,
    contentColor = "dim",
    contentTypography = "italic",
    contentVariant,
    borderColor = "dim",
    variantOptions,
  } = opts;

  if (!choices || choices.length === 0) {
    throw new Error("Choices are required for multiselect prompt.");
  }

  const rl = readline.createInterface({ input, output });

  const formattedBar = bar({ borderColor });

  let linesToDelete = 0;
  let errorMessage = "";

  try {
    while (true) {
      if (linesToDelete > 0) {
        deleteLastLines(linesToDelete);
      }

      const { text: question } = fmt({
        hintPlaceholderColor,
        type: errorMessage !== "" ? "M_ERROR" : "M_GENERAL",
        title: `${title}${defaultValue ? ` [Default: ${Array.isArray(defaultValue) ? defaultValue.join(", ") : defaultValue}]` : ""}`,
        titleColor,
        titleTypography,
        titleVariant: titleVariant ?? "none",
        content: content ?? "",
        contentColor: contentColor ?? "dim",
        contentTypography: contentTypography ?? "none",
        contentVariant: contentVariant ?? "none",
        borderColor,
        hint: hint ?? "",
        variantOptions: variantOptions ?? {},
        errorMessage,
      });

      // Generate choices text with formatted bar
      const choicesText = choices
        .map((choice, index) =>
          re.dim(
            `${formattedBar}  ${index + 1}) ${choice.title}${
              choice.description ? ` - ${choice.description}` : ""
            }`,
          ),
        )
        .join("\n");

      const fullPrompt = `${question}\n${choicesText}\n${formattedBar}  ${re.bold(re.blue(`Enter your choices (comma-separated numbers between 1-${choices.length})`))}:\n${formattedBar}  `;

      const { text: formattedPrompt } = fmt({
        hintPlaceholderColor,
        type: "M_NULL",
        title: fullPrompt,
      });

      const questionLines = countLines(formattedPrompt);
      linesToDelete = questionLines + 1; // +1 for the user's input line

      const answer = (await askForInput(`${formattedPrompt}  `))?.trim() || "";

      // Use defaultValue if no input is provided
      if (!answer && defaultValue !== undefined) {
        deleteLastLine();
        msg({
          type: "M_MIDDLE",
          title: `  ${Array.isArray(defaultValue) ? defaultValue.join(", ") : defaultValue}`,
          titleColor: "none",
        });
        msg({ type: "M_BAR", borderColor });

        return defaultValue;
      }

      // Parse and validate selections
      const selections = answer.split(",").map((s) => s.trim());
      const invalidSelections = selections.filter((s) => {
        const num = Number(s);
        return Number.isNaN(num) || num < 1 || num > choices.length;
      });

      if (invalidSelections.length > 0) {
        errorMessage = `Invalid selections: ${invalidSelections.join(
          ", ",
        )}. Please enter numbers between 1 and ${choices.length}.`;
        continue;
      }

      const selectedValues = selections.map((s) => choices[Number(s) - 1]?.id);

      // Schema validation if provided
      const isValid = true;
      errorMessage = ""; // Reset errorMessage

      if (isValid) {
        rl.close();
        msg({ type: "M_BAR", borderColor });
        return selectedValues;
      }
    }
  } finally {
    rl.close();
  }
}
