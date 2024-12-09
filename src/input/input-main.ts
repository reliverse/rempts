import type { TSchema } from "@sinclair/typebox";

import { Value } from "@sinclair/typebox/value";
import { stdin as input, stdout as output } from "node:process";
import readline from "node:readline/promises";

import type {
  ColorName,
  TypographyName,
  VariantName,
} from "~/types/general.js";

import { fmt, msg } from "~/utils/messages.js";
import {
  countLines,
  deleteLastLine,
  deleteLastLines,
} from "~/utils/terminal.js";

type InputPromptOptions = {
  title: string;
  hint?: string;
  hintColor?: ColorName;
  validate?: (value: string) => string | void | Promise<string | void>;
  defaultValue?: string;
  schema?: TSchema;
  titleColor?: ColorName;
  titleTypography?: TypographyName;
  titleVariant?: VariantName;
  content?: string;
  contentColor?: ColorName;
  contentTypography?: TypographyName;
  contentVariant?: VariantName;
  borderColor?: ColorName;
  variantOptions?: any;
  placeholder?: string;
  endTitle?: string;
  endTitleColor?: ColorName;
  border?: boolean;
  hardcoded?: {
    userInput?: string;
    errorMessage?: string;
    linesRendered?: number;
    showPlaceholder?: boolean;
  };
};

export async function inputPrompt(
  options: InputPromptOptions,
): Promise<string> {
  const {
    title = "",
    hint,
    hintColor = "gray",
    validate,
    defaultValue = "",
    schema,
    titleColor = "blueBright",
    titleTypography = "bold",
    titleVariant,
    content,
    contentColor = "dim",
    contentTypography = "italic",
    contentVariant,
    borderColor = "viceGradient",
    variantOptions,
    placeholder,
    hardcoded,
    endTitle = "",
    endTitleColor = "dim",
    border = true,
  } = options;

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
  let errorMessage = hardcoded?.errorMessage || "";
  let currentInput = hardcoded?.userInput || "";
  let showPlaceholder = hardcoded?.showPlaceholder ?? true;

  // If hardcoded user input is provided, skip the interactive prompt
  if (hardcoded?.userInput !== undefined) {
    // Simulate the rendering of the prompt with hardcoded input
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
      placeholder: showPlaceholder ? placeholder : undefined,
      variantOptions,
      errorMessage,
    });

    const questionLines = countLines(question);
    process.stdout.write(question + "\n");
    linesToDelete += questionLines + 1;

    // Simulate user input
    currentInput = hardcoded.userInput.trim();

    if (showPlaceholder && currentInput !== "") {
      showPlaceholder = false;
      deleteLastLine();
      deleteLastLine();
      msg({ type: "M_MIDDLE", title: `  ${currentInput}` });
    }

    linesToDelete += countLines(currentInput) + 1;

    const answer = currentInput || defaultValue;

    if (currentInput === "" && defaultValue !== "") {
      deleteLastLine();
      deleteLastLine();
      const defaultMsg = fmt({
        hintColor,
        type: "M_MIDDLE",
        title: `  ${defaultValue}`,
        borderColor,
      });
      console.log(defaultMsg);
      linesToDelete += countLines(defaultMsg);
    }

    let isValid = true;
    errorMessage = "";
    if (schema) {
      isValid = Value.Check(schema, answer);
      if (!isValid) {
        const errors = [...Value.Errors(schema, answer)];
        if (errors.length > 0) {
          errorMessage = errors[0]?.message ?? "Invalid input.";
        } else {
          errorMessage = "Invalid input.";
        }
      }
    }

    if (validate && isValid) {
      const validationResult = await validate(answer);
      if (typeof validationResult === "string") {
        isValid = false;
        errorMessage = validationResult;
      }
    }

    if (isValid) {
      deleteLastLine();
      msg({ type: "M_MIDDLE", title: `  ${answer}` });
      msg({ type: "M_NEWLINE" });
      rl.close();
      return answer;
    } else {
      // If hardcoded input is invalid, and an error message is provided, return the error
      rl.close();
      throw new Error(errorMessage || "Invalid input.");
    }
  }

  while (true) {
    if (linesToDelete > 0) {
      deleteLastLines(linesToDelete);
      linesToDelete = 0;
    }

    const question = fmt({
      hintColor,
      type: errorMessage !== "" ? "M_ERROR" : "M_GENERAL",
      title,
      titleColor,
      titleTypography,
      titleVariant,
      content,
      contentColor: "dim",
      contentTypography,
      contentVariant,
      borderColor,
      hint,
      placeholder: showPlaceholder ? placeholder : undefined,
      variantOptions,
      errorMessage,
    });

    const questionLines = countLines(question);
    const prompt = await rl.question(question);

    // Check if user pressed Ctrl+C or input stream closed:
    if (prompt === null) {
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

    currentInput = prompt.trim();

    if (showPlaceholder && currentInput !== "") {
      showPlaceholder = false;
      deleteLastLine();
      if (placeholder !== undefined) {
        deleteLastLine();
      }
      msg({ type: "M_MIDDLE", title: `  ${currentInput}` });
    }

    linesToDelete += questionLines + 1;

    const answer = currentInput || defaultValue;

    if (currentInput === "" && defaultValue !== "") {
      deleteLastLine();
      if (placeholder !== undefined) {
        deleteLastLine();
      }
      const defaultMsg = fmt({
        hintColor,
        type: "M_MIDDLE",
        title: `  ${defaultValue}`,
        borderColor,
      });
      console.log(defaultMsg);
      linesToDelete += countLines(defaultMsg);
    }

    let isValid = true;
    errorMessage = "";
    if (schema) {
      isValid = Value.Check(schema, answer);
      if (!isValid) {
        const errors = [...Value.Errors(schema, answer)];
        if (errors.length > 0) {
          errorMessage = errors[0]?.message ?? "Invalid input.";
        } else {
          errorMessage = "Invalid input.";
        }
      }
    }

    if (validate && isValid) {
      const validationResult = await validate(answer);
      if (typeof validationResult === "string") {
        isValid = false;
        errorMessage = validationResult;
      }
    }

    if (isValid) {
      msg({ type: "M_NEWLINE" });
      rl.close();
      return answer;
    } else {
      // Prepare to re-render with error message
      linesToDelete += 0;
    }
  }
}
