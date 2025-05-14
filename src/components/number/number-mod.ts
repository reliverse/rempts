import { stdin as input, stdout as output } from "node:process";
import readline from "node:readline/promises";

import type {
  BorderColorName,
  ColorName,
  FmtMsgOptions,
  TypographyName,
} from "~/types.js";

import { bar, msg } from "~/components/msg-fmt/messages.js";
import {
  deleteLastLine,
  deleteLastLines,
} from "~/components/msg-fmt/terminal.js";

type VariantName = FmtMsgOptions["titleVariant"];

type NumberPromptOptions = {
  title: string;
  hint?: string;
  hintPlaceholderColor?: ColorName;
  validate?: (
    value: number,
  ) => string | undefined | boolean | Promise<string | undefined | boolean>;
  defaultValue?: string | number;
  schema?: any;
  titleColor?: ColorName;
  titleTypography?: TypographyName;
  titleVariant?: VariantName;
  content?: string;
  contentColor?: ColorName;
  contentTypography?: TypographyName;
  contentVariant?: VariantName;
  borderColor?: BorderColorName;
  variantOptions?: any;
  endTitle?: string;
  endTitleColor?: ColorName;
  border?: boolean;
  hardcoded?: {
    userInput?: string;
    errorMessage?: string;
  };
};

type RenderParams = {
  title: string;
  userInput: string;
  errorMessage: string;
  border: boolean;
  hint: string | undefined;
  hintPlaceholderColor: ColorName | undefined;
  content: string | undefined;
  contentColor: ColorName | undefined;
  contentTypography: TypographyName | undefined;
  contentVariant: VariantName | undefined;
  titleColor: ColorName | undefined;
  titleTypography: TypographyName | undefined;
  titleVariant: VariantName | undefined;
  borderColor: ColorName | undefined;
};

/**
 * Renders the prompt UI.
 * Uses `msg()` for all printing, so we can easily undo and re-render.
 * Returns the number of lines rendered.
 */
function renderPromptUI(
  params: RenderParams & { isRerender?: boolean },
): number {
  const {
    title,
    hint,
    content,
    contentColor = "dim",
    contentTypography = "italic",
    contentVariant,
    titleColor = "cyan",
    titleTypography = "none",
    titleVariant,
    borderColor = "dim",
    userInput,
    errorMessage,
  } = params;

  let lineCount = 0;

  // Decide message type based on error state
  const type = errorMessage !== "" ? "M_ERROR" : "M_GENERAL";

  // Main prompt line
  const msgParams: FmtMsgOptions = {
    type,
    title,
    titleColor,
    titleTypography,
    titleVariant: titleVariant ?? "none",
    content: content ?? "",
    contentColor,
    contentTypography,
    contentVariant: contentVariant ?? "none",
    borderColor,
    hint: hint ?? "",
    errorMessage,
  };

  msg(msgParams);
  lineCount++;

  // If user already typed something, show it
  if (userInput !== "") {
    msg({ type: "M_MIDDLE", title: `  ${userInput}` });
    lineCount++;
  }

  return lineCount;
}

export async function numberPrompt(opts: NumberPromptOptions): Promise<number> {
  const {
    title = "",
    hint,
    hintPlaceholderColor = "blue",
    validate,
    defaultValue,
    titleColor = "cyan",
    titleTypography = "none",
    titleVariant,
    content,
    contentColor = "dim",
    contentTypography = "italic",
    contentVariant,
    borderColor = "dim",
    hardcoded,
    endTitle = "",
    endTitleColor = "dim",
    border = true,
  } = opts;

  const rl = readline.createInterface({ input, output });

  // Graceful Ctrl+C handling:
  rl.on("SIGINT", () => {
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
    rl.close();
    process.exit(0);
  });

  let currentInput = hardcoded?.userInput || "";
  let errorMessage = hardcoded?.errorMessage || "";
  let isRerender = false;
  let lastLineCount = 0;

  // Convert defaultValue to number if it's a string
  const effectiveDefault =
    typeof defaultValue === "string" ? Number(defaultValue) : defaultValue;

  // If we have a hardcoded user input, skip interactive input and just validate
  if (hardcoded?.userInput !== undefined) {
    // Render once
    renderPromptUI({
      title,
      hint,
      hintPlaceholderColor,
      content,
      contentColor,
      contentTypography,
      contentVariant,
      titleColor,
      titleTypography,
      titleVariant,
      borderColor,
      userInput: currentInput,
      errorMessage,
      border,
      isRerender,
    });

    const num = Number(currentInput);
    if (Number.isNaN(num)) {
      throw new Error("Please enter a valid number.");
    }

    const validated = await validateInput(num, validate);
    if (validated.isValid) {
      msg({ type: "M_MIDDLE", title: `  ${num}` });
      msg({ type: "M_BAR", borderColor });
      rl.close();
      return num;
    }
    rl.close();
    throw new Error(validated.errorMessage || "Invalid input.");
  }

  // Interactive loop
  while (true) {
    if (isRerender) {
      // Only delete the lines from our last render
      deleteLastLines(lastLineCount + 1); // +1 for the input line
    }

    lastLineCount = renderPromptUI({
      title,
      hint,
      hintPlaceholderColor,
      content,
      contentColor,
      contentTypography,
      contentVariant,
      titleColor,
      titleTypography,
      titleVariant,
      borderColor,
      userInput: currentInput,
      errorMessage,
      border,
      isRerender,
    });

    const formattedBar = bar({ borderColor });
    const answerInput = await rl.question(`${formattedBar}  `);

    isRerender = true; // Set to true after first render

    // Check for Ctrl+C or stream closed
    if (answerInput === null) {
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
      rl.close();
      process.exit(0);
    }

    currentInput = answerInput.trim();

    // Use defaultValue if input is empty
    if (!currentInput && effectiveDefault !== undefined) {
      deleteLastLine();
      msg({ type: "M_MIDDLE", title: `  ${effectiveDefault}` });
      msg({ type: "M_BAR", borderColor });
      rl.close();
      return effectiveDefault;
    }

    // Parse number input
    const num = Number(currentInput);
    if (Number.isNaN(num)) {
      errorMessage = "Please enter a valid number.";
      continue;
    }

    const validated = await validateInput(num, validate);

    if (validated.isValid) {
      // Delete the last line with user input since it's already displayed
      deleteLastLine();
      msg({ type: "M_MIDDLE", title: `  ${num}` });
      msg({ type: "M_BAR", borderColor });
      rl.close();
      return num;
    }
    // Show error and re-render
    errorMessage = validated.errorMessage;
  }
}

/**
 * Validates the number input against the schema and validate function.
 */
async function validateInput(
  input: number,
  validate?: (
    value: number,
  ) => string | undefined | boolean | Promise<string | undefined | boolean>,
): Promise<{ isValid: boolean; errorMessage: string }> {
  let isValid = true;
  let errorMessage = "";

  // Custom validation function
  if (validate && isValid) {
    const validationResult = await validate(input);
    if (validationResult === true || validationResult === undefined) {
      isValid = true;
    } else if (typeof validationResult === "string") {
      isValid = false;
      errorMessage = validationResult;
    } else {
      isValid = false;
      errorMessage = "Invalid input.";
    }
  }

  return { isValid, errorMessage };
}
