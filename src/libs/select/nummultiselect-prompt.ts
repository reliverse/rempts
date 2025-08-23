import { stdin as input, stdout as output } from "node:process";
import readline from "node:readline/promises";
import { re } from "@reliverse/relico";
import type { PromptOptions } from "../../types";
import { bar, fmt, msg } from "../msg-fmt/messages";
import { countLines, deleteLastLine, deleteLastLines } from "../msg-fmt/terminal";

type NumMultiSelectPromptOptions = PromptOptions & {
  defaultValue?: string[];
};

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

      const answer = (await rl.question(`${formattedPrompt}  `)).trim();

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
