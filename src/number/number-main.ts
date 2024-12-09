import { Value } from "@sinclair/typebox/value";
import { stdin as input, stdout as output } from "node:process";
import readline from "node:readline/promises";

import type { ColorName, PromptOptions } from "~/types/general.js";

import { fmt, msg } from "~/utils/messages.js";
import {
  countLines,
  deleteLastLine,
  deleteLastLines,
} from "~/utils/terminal.js";

type NumberPromptOptions = PromptOptions & {
  endTitle?: string;
  endTitleColor?: ColorName;
  border?: boolean;
  defaultValue?: string | string[] | number;
};

export async function numberPrompt(opts: NumberPromptOptions): Promise<number> {
  const {
    title = "",
    content = "",
    hint = "",
    hintColor = "gray",
    validate,
    defaultValue,
    schema,
    titleColor = "blueBright",
    titleTypography = "bold",
    titleVariant,
    contentColor = "dim",
    contentTypography = "italic",
    contentVariant,
    borderColor = "viceGradient",
    variantOptions,
    endTitle = "",
    endTitleColor = "dim",
    border = true,
  } = opts;

  const rl = readline.createInterface({ input, output });

  // Handle Ctrl+C gracefully:
  rl.on("SIGINT", () => {
    // Clean up and exit process
    rl.close();

    if (endTitle !== "") {
      msg({
        type: "M_END",
        title: endTitle,
        titleColor: endTitleColor,
        titleTypography,
        border,
        borderColor,
        addNewLineBefore: true,
      });
    }

    process.exit(0);
  });

  let linesToDelete = 0;
  let errorMessage = "";

  try {
    while (true) {
      // Delete previous lines
      if (linesToDelete > 0) {
        deleteLastLines(linesToDelete);
        linesToDelete = 0;
      }

      // Format the question prompt
      const question = fmt({
        hintColor,
        type: errorMessage !== "" ? "M_ERROR" : "M_GENERAL",
        title,
        titleColor,
        titleTypography,
        titleVariant,
        content,
        contentColor,
        contentTypography,
        contentVariant,
        borderColor,
        hint,
        variantOptions,
        errorMessage,
      });

      const questionLines = countLines(question);
      linesToDelete = questionLines + 1; // +1 for user's input

      // Display the formatted question
      msg({
        type: errorMessage !== "" ? "M_ERROR" : "M_GENERAL",
        title: question,
        addNewLineAfter: false,
      });

      deleteLastLine();

      // Prompt the user for input
      const answerInput = await rl.question(">  ");

      // Check if user pressed Ctrl+C or input stream closed:
      if (answerInput === null) {
        rl.close();

        if (endTitle !== "") {
          msg({
            type: "M_END",
            title: endTitle,
            titleColor: endTitleColor,
            titleTypography,
            border,
            borderColor,
          });
        }

        process.exit(0);
      }

      let answer = answerInput.trim();

      // Use defaultValue if input is empty and defaultValue is provided
      if (answer === "" && defaultValue !== undefined) {
        answer = Array.isArray(defaultValue)
          ? defaultValue.join(", ")
          : String(defaultValue);
        deleteLastLine();
        const defaultMsg = fmt({
          hintColor,
          type: "M_MIDDLE",
          title: `  ${answer}`,
          borderColor,
        });
        console.log(defaultMsg);
        linesToDelete += countLines(defaultMsg);
      }

      const num = Number(answer);
      if (isNaN(num)) {
        errorMessage = "Please enter a valid number.";
        continue;
      }

      let isValid = true;
      errorMessage = ""; // Reset errorMessage

      // Validate against the provided schema if available
      if (schema) {
        isValid = Value.Check(schema, num);
        if (!isValid) {
          const errors = [...Value.Errors(schema, num)];
          if (errors.length > 0) {
            errorMessage = errors[0]?.message ?? "Invalid input.";
          } else {
            errorMessage = "Invalid input.";
          }
        }
      }

      // Custom validation function
      if (validate && isValid) {
        const validation = await validate(num);
        if (validation !== true) {
          isValid = false;
          errorMessage =
            typeof validation === "string" ? validation : "Invalid input.";
        }
      }

      if (isValid) {
        msg({ type: "M_NEWLINE" });
        rl.close();
        return num;
      } else {
        // Prepare to re-render with error message
        // The loop will handle re-prompting
      }
    }
  } finally {
    rl.close();
  }
}
