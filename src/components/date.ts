import { Type, type TSchema } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";
import { stdin as input, stdout as output } from "node:process";
import readline from "node:readline/promises";

import type { PromptOptions } from "~/types/prod";

import { colorize } from "~/utils/colorize";

// Define allowed date formats
const dateFormatSchema = Type.Union([
  Type.RegExp(/^(\d{2})\.(\d{2})\.(\d{4})$/, { description: "DD.MM.YYYY" }),
  Type.RegExp(/^(\d{2})\/(\d{2})\/(\d{4})$/, { description: "MM.DD.YYYY" }),
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
    titleColor,
    titleTypography,
  } = options;
  const rl = readline.createInterface({ input, output });

  try {
    const coloredTitle = colorize(title, titleColor, titleTypography);
    const question = `${coloredTitle}${
      hint ? ` (${hint})` : ""
    }${defaultValue ? ` [${defaultValue}]` : ""}: `;

    while (true) {
      const answer =
        (await rl.question(question)) || String(defaultValue || "");
      let isValid = true;
      let errorMessage = "Invalid date format.";

      // Validate against date format schema
      if (!Value.Check(dateFormatSchema, answer)) {
        console.log(`Please enter a valid date in ${dateFormat} format.`);
        continue;
      }

      // Additional check if dateKind is "birthday"
      if (dateKind === "birthday") {
        const parts = answer.split(/[.-/]/);
        let date: Date;

        // Parse according to date format
        if (dateFormat === "DD.MM.YYYY") {
          date = new Date(
            Number(parts[2]),
            Number(parts[1]) - 1,
            Number(parts[0]),
          );
        } else if (dateFormat === "MM.DD.YYYY") {
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

        // Validate if the date is real
        if (
          isNaN(date.getTime()) ||
          date.getFullYear() < 1900 ||
          date > new Date()
        ) {
          console.log("Please enter a valid birthday date (e.g., 14.09.1999).");
          continue;
        }
      }

      // Schema validation if provided
      if (schema) {
        isValid = Value.Check(schema, answer);
        if (!isValid) {
          const errors = [...Value.Errors(schema, answer)];
          if (errors.length > 0) {
            errorMessage = errors[0]?.message ?? "Invalid input.";
          }
        }
      }

      // Custom validation function
      if (validate && isValid) {
        const validation = await validate(answer);
        if (validation !== true) {
          isValid = false;
          errorMessage =
            typeof validation === "string" ? validation : "Invalid input.";
        }
      }

      if (isValid) {
        return answer;
      } else {
        console.log(errorMessage);
      }
    }
  } finally {
    rl.close();
  }
}
