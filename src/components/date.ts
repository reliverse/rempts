import { Type, type TSchema } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";
import { stdin as input, stdout as output } from "node:process";
import readline from "node:readline/promises";

import type { PromptOptions } from "~/types/prod";

import { fmt, msg } from "~/utils/messages";
import { countLines, deleteLastLine, deleteLastLines } from "~/utils/terminal";

// Define allowed date formats
const dateFormatSchema = Type.Union([
  Type.RegExp(/^(\d{2})\.(\d{2})\.(\d{4})$/, { description: "DD.MM.YYYY" }),
  Type.RegExp(/^(\d{2})\/(\d{2})\/(\d{4})$/, { description: "MM/DD/YYYY" }),
  Type.RegExp(/^(\d{4})\.(\d{2})\.(\d{2})$/, { description: "YYYY.MM.DD" }),
]);

export async function datePrompt<T extends TSchema>(
  options: PromptOptions<T> & {
    dateFormat: string;
    dateKind: "birthday" | "other";
  },
): Promise<string> {
  const {
    title,
    dateFormat,
    dateKind,
    hint,
    validate,
    defaultValue,
    schema,
    titleColor = "cyanBright",
    answerColor = "none",
    titleTypography = "bold",
    titleVariant,
    content,
    contentColor,
    contentTypography,
    contentVariant,
    borderColor = "viceGradient",
    variantOptions,
  } = options;

  const rl = readline.createInterface({ input, output });

  let linesToDelete = 0;
  let errorMessage = "";

  try {
    while (true) {
      if (linesToDelete > 0) {
        deleteLastLines(linesToDelete);
      }

      const question = fmt({
        type: errorMessage !== "" ? "M_ERROR" : "M_GENERAL",
        title: `${title} [Format: ${dateFormat}]`,
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
        addNewLineBefore: false,
      });

      const questionLines = countLines(question);
      linesToDelete = questionLines + 1; // +1 for user's input

      const answer = (await rl.question(question)).trim() || defaultValue;

      // Display defaultValue if it is used
      if (answer === defaultValue && defaultValue) {
        deleteLastLine();
        msg({
          type: "M_MIDDLE",
          title: `  ${defaultValue}`,
          titleColor: answerColor,
        });
      }

      if (!Value.Check(dateFormatSchema, answer)) {
        errorMessage = `Please enter a valid date in ${dateFormat} format.`;
        continue;
      }

      if (dateKind === "birthday") {
        const parts = answer.split(/[./-]/);
        let date: Date;

        if (dateFormat === "DD.MM.YYYY") {
          date = new Date(
            Number(parts[2]),
            Number(parts[1]) - 1,
            Number(parts[0]),
          );
        } else if (dateFormat === "MM/DD/YYYY") {
          date = new Date(
            Number(parts[2]),
            Number(parts[0]) - 1,
            Number(parts[1]),
          );
        } else if (dateFormat === "YYYY.MM.DD") {
          date = new Date(
            Number(parts[0]),
            Number(parts[1]) - 1,
            Number(parts[2]),
          );
        } else {
          date = new Date(answer);
        }

        if (
          isNaN(date.getTime()) ||
          date.getFullYear() < 1900 ||
          date > new Date()
        ) {
          errorMessage =
            "Please enter a valid birthday date (e.g., 14.09.1999).";
          continue;
        }
      }

      let isValid = true;
      errorMessage = ""; // Reset errorMessage

      if (schema) {
        isValid = Value.Check(schema, answer);
        if (!isValid) {
          const errors = [...Value.Errors(schema, answer)];
          errorMessage = errors[0]?.message ?? "Invalid input.";
        }
      }

      if (validate && isValid) {
        const validation = await validate(answer);
        if (validation !== true) {
          isValid = false;
          errorMessage =
            typeof validation === "string" ? validation : "Invalid input.";
        }
      }

      if (isValid) {
        msg({ type: "M_NEWLINE" });
        rl.close();
        return answer;
      }
    }
  } finally {
    rl.close();
  }
}
