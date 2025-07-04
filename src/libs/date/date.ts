import { re } from "@reliverse/relico";
import { stdin as input, stdout as output } from "node:process";
import readline from "node:readline/promises";
import {
  buildRegExp,
  digit,
  endOfString,
  repeat,
  startOfString,
} from "ts-regex-builder";

import type { DatePromptOptions } from "~/types.js";

import { fmt, msg, symbols } from "~/libs/msg-fmt/messages.js";
import {
  countLines,
  deleteLastLine,
  deleteLastLines,
} from "~/libs/msg-fmt/terminal.js";

// Helper constructs
const twoDigits = repeat(digit, 2); // \d{2}
const fourDigits = repeat(digit, 4); // \d{4}
const separatorDot = "."; // Literal dot
const separatorSlash = "/"; // Literal slash

// DD.MM.YYYY
const regexDDMMYYYY = buildRegExp([
  startOfString,
  twoDigits, // DD
  separatorDot,
  twoDigits, // MM
  separatorDot,
  fourDigits, // YYYY
  endOfString,
]);

// MM/DD/YYYY
const regexMMDDYYYY = buildRegExp([
  startOfString,
  twoDigits, // MM
  separatorSlash,
  twoDigits, // DD
  separatorSlash,
  fourDigits, // YYYY
  endOfString,
]);

// YYYY.MM.DD
const regexYYYYMMDD = buildRegExp([
  startOfString,
  fourDigits, // YYYY
  separatorDot,
  twoDigits, // MM
  separatorDot,
  twoDigits, // DD
  endOfString,
]);

export async function datePrompt(opts: DatePromptOptions): Promise<string> {
  const {
    title = "",
    dateFormat,
    dateKind,
    hint,
    hintPlaceholderColor = "blue",
    validate,
    defaultValue = "",
    titleColor = "cyan",
    titleTypography = "none",
    titleVariant,
    content,
    contentColor = "dim",
    contentTypography = "italic",
    contentVariant,
    borderColor = "dim",
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
      });
    }

    process.exit(0);
  });

  let linesToDelete = 0;
  let errorMessage = "";

  try {
    while (true) {
      // Delete previous lines if necessary
      if (linesToDelete > 0) {
        deleteLastLines(linesToDelete);
        linesToDelete = 0;
      }

      // Format the question prompt
      const { text: questionText } = fmt({
        type: errorMessage !== "" ? "M_ERROR_NULL" : "M_GENERAL_NULL",
        title: `${title} [${dateFormat}]`,
        titleColor,
        titleTypography,
        titleVariant,
        content,
        contentColor,
        contentTypography,
        contentVariant,
        borderColor,
        hint: `${hint ? `${hint} ` : ""}${
          defaultValue ? `Default: ${defaultValue}` : ""
        }`,
        hintPlaceholderColor,
        variantOptions,
        errorMessage,
      });

      const questionLines = countLines(questionText);
      linesToDelete = questionLines + 1; // +1 for user's input

      // Display the formatted question
      msg({
        type: errorMessage !== "" ? "M_ERROR" : "M_GENERAL",
        title: questionText,
      });

      // Only delete lines if we're not on the first render
      if (errorMessage !== "") {
        deleteLastLine();
        deleteLastLine();
      }

      // Prompt the user for input
      const answerInput = await rl.question(`${re.dim(symbols.middle)}  `);

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

      const answer = answerInput.trim() || defaultValue;

      // Display the answer (whether it's user input or default)
      if (errorMessage !== "") {
        deleteLastLine();
      }
      deleteLastLine();
      msg({
        type: "M_MIDDLE",
        title: `  ${answer}`,
        titleColor: "none",
      });

      // Validate the answer against the accepted date formats (DD.MM.YYYY, MM/DD/YYYY, YYYY.MM.DD)
      if (
        !(
          regexDDMMYYYY.test(answer) ||
          regexMMDDYYYY.test(answer) ||
          regexYYYYMMDD.test(answer)
        )
      ) {
        if (errorMessage !== "") {
          deleteLastLine();
          deleteLastLine();
        }
        errorMessage = `Please enter a valid date in ${dateFormat} format.`;
        msg({ type: "M_ERROR", title: errorMessage });
        linesToDelete = countLines(errorMessage) + 1;
        continue;
      }

      // Determine which regex matched
      let matchedFormat: string | null = null;
      if (regexDDMMYYYY.test(answer)) {
        matchedFormat = "DD.MM.YYYY";
      } else if (regexMMDDYYYY.test(answer)) {
        matchedFormat = "MM/DD/YYYY";
      } else if (regexYYYYMMDD.test(answer)) {
        matchedFormat = "YYYY.MM.DD";
      }

      // Additional validation for 'birthday' kind
      if (dateKind === "birthday" && matchedFormat) {
        const parts = answer.split(/[./-]/);
        let date: Date;

        if (matchedFormat === "DD.MM.YYYY") {
          date = new Date(
            Number(parts[2]),
            Number(parts[1]) - 1,
            Number(parts[0]),
          );
        } else if (matchedFormat === "MM/DD/YYYY") {
          date = new Date(
            Number(parts[2]),
            Number(parts[0]) - 1,
            Number(parts[1]),
          );
        } else if (matchedFormat === "YYYY.MM.DD") {
          date = new Date(
            Number(parts[0]),
            Number(parts[1]) - 1,
            Number(parts[2]),
          );
        } else {
          date = new Date(answer);
        }

        if (
          Number.isNaN(date.getTime()) ||
          date.getFullYear() < 1900 ||
          date > new Date()
        ) {
          errorMessage =
            "Please enter a valid birthday date (e.g., 14.09.1999).";
          msg({ type: "M_ERROR", title: errorMessage });
          linesToDelete = countLines(errorMessage) + 1;
          continue;
        }
      }

      let isValid = true;
      let gotError = false;
      if (errorMessage !== "") {
        gotError = true;
      }
      errorMessage = ""; // Reset errorMessage

      // Custom validation function
      if (validate && isValid) {
        const validation = await validate(answer);
        if (validation !== true) {
          isValid = false;
          errorMessage =
            typeof validation === "string" ? validation : "Invalid input.";
          msg({ type: "M_ERROR", title: errorMessage });
          gotError = true;
          linesToDelete = countLines(errorMessage) + 1;
          continue;
        }
      }

      // If all validations pass, return the answer
      if (isValid) {
        if (gotError) {
          deleteLastLine();
          deleteLastLine();
          msg({ type: "M_MIDDLE", title: `  ${answer}` });
        }
        msg({
          type: "M_BAR",
          borderColor,
        });
        rl.close();
        return answer;
      }
    }
  } finally {
    rl.close();
  }
}
