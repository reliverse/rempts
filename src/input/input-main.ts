import type { TSchema } from "@sinclair/typebox";

import { Value } from "@sinclair/typebox/value";
import { stdin as input, stdout as output } from "node:process";
import readline from "node:readline/promises";

import type {
  ColorName,
  PromptOptions,
  TypographyName,
  VariantName,
} from "~/types/general.js";
import type { SymbolName } from "~/utils/messages.js";

import { msg, msgUndoAll, bar } from "~/utils/messages.js";
import { deleteLastLine } from "~/utils/terminal.js";

export type InputPromptOptions = {
  title: string;
  hint?: string;
  hintPlaceholderColor?: ColorName;
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
    showPlaceholder?: boolean;
  };
  symbol?: SymbolName;
  customSymbol?: string;
  symbolColor?: ColorName;
} & PromptOptions;

type RenderParams = {
  title: string;
  hint?: string;
  hintPlaceholderColor?: ColorName;
  content?: string;
  contentColor?: ColorName;
  contentTypography?: TypographyName;
  contentVariant?: VariantName;
  titleColor?: ColorName;
  titleTypography?: TypographyName;
  titleVariant?: VariantName;
  borderColor?: ColorName;
  placeholder?: string;
  userInput: string;
  errorMessage: string;
  border: boolean;
  symbol?: SymbolName;
  customSymbol?: string;
  symbolColor?: ColorName;
};

/**
 * Renders the prompt UI.
 * Uses `msg()` for all printing, so we can easily undo and re-render.
 * Returns nothing (the line counting is handled internally by `msg()` and `msgUndoAll()`).
 */
function renderPromptUI(params: RenderParams & { isRerender?: boolean }) {
  const {
    title,
    hint,
    hintPlaceholderColor = "blue",
    content,
    contentColor = "dim",
    contentTypography = "italic",
    contentVariant,
    titleColor = "cyan",
    titleTypography = "none",
    titleVariant,
    borderColor = "dim",
    placeholder,
    userInput,
    errorMessage,
    border,
    isRerender = false,
    symbol,
    customSymbol,
    symbolColor,
  } = params;

  // Decide message type based on error state
  const type = errorMessage !== "" ? "M_ERROR" : "M_GENERAL";

  // Main prompt line
  msg({
    type,
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
    hintPlaceholderColor,
    placeholder: userInput === "" ? placeholder : undefined,
    errorMessage,
    symbol,
    customSymbol,
    symbolColor,
  });

  // If user already typed something, show it
  if (userInput !== "") {
    msg({ type: "M_MIDDLE", title: `  ${userInput}` });
  }
}

/**
 * The inputPrompt function:
 * - Renders a text prompt, possibly with a hint, placeholder, and content.
 * - Waits for user input.
 * - Validates input using an optional schema or validate function.
 * - If invalid, shows an error and re-prompts.
 * - Exits on Ctrl+C, optionally printing an endTitle.
 * - Returns the user's validated input (or default value if none provided).
 */
export async function inputPrompt(
  options: InputPromptOptions,
): Promise<string> {
  const {
    title = "",
    hint,
    hintPlaceholderColor = "viceGradient",
    validate,
    defaultValue = "",
    schema,
    titleColor = "cyan",
    titleTypography = "none",
    titleVariant,
    content,
    contentColor = "dim",
    contentTypography = "italic",
    contentVariant,
    borderColor = "dim",
    variantOptions,
    placeholder,
    hardcoded,
    endTitle = "",
    endTitleColor = "dim",
    border = true,
    symbol,
    customSymbol,
    symbolColor,
  } = options;

  const rl = readline.createInterface({ input, output });

  // Graceful Ctrl+C handling:
  rl.on("SIGINT", () => {
    if (endTitle !== "") {
      msgUndoAll();
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
  let showPlaceholder = hardcoded?.showPlaceholder ?? true;
  let isRerender = false;

  // If we have a hardcoded user input, skip interactive input and just validate
  if (hardcoded?.userInput !== undefined) {
    // Render once
    msgUndoAll();
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
      placeholder: showPlaceholder ? placeholder : undefined,
      userInput: currentInput,
      errorMessage,
      border,
      isRerender,
      symbol,
      customSymbol,
      symbolColor,
    });

    const answer = currentInput || defaultValue;
    const validated = await validateInput(answer, schema, validate);

    if (validated.isValid) {
      msg({ type: "M_MIDDLE", title: `  ${answer}` });
      msg({ type: "M_BAR", borderColor });
      rl.close();
      return answer;
    } else {
      rl.close();
      throw new Error(validated.errorMessage || "Invalid input.");
    }
  }

  // Interactive loop
  while (true) {
    if (isRerender) {
      msgUndoAll();
    }
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
      placeholder: showPlaceholder ? placeholder : undefined,
      userInput: currentInput,
      errorMessage,
      border,
      isRerender,
      symbol,
      customSymbol,
      symbolColor,
    });

    const formattedBar = bar({ borderColor });
    const answerInput = await rl.question(`${formattedBar}  `);

    isRerender = true; // Set to true after first render

    // Check for Ctrl+C or stream closed
    if (answerInput === null) {
      if (endTitle !== "") {
        msgUndoAll();
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

    if (showPlaceholder && currentInput !== "") {
      showPlaceholder = false;
    }

    const answer = currentInput || defaultValue;
    const validated = await validateInput(answer, schema, validate);

    if (validated.isValid) {
      // Delete the last line with user input since it's already displayed
      deleteLastLine();

      // Show either default value or user input
      if (!currentInput && defaultValue) {
        msg({ type: "M_MIDDLE", title: `  ${defaultValue}` });
      } else if (currentInput) {
        msg({ type: "M_MIDDLE", title: `  ${currentInput}` });
      }
      // Add a bar after the answer
      msg({ type: "M_BAR", borderColor });
      rl.close();
      return answer;
    } else {
      // Show error and re-render
      errorMessage = validated.errorMessage;
    }
  }
}

/**
 * Validates the user input against the schema and validate function.
 */
async function validateInput(
  input: string,
  schema?: TSchema,
  validate?: (value: string) => string | void | Promise<string | void>,
): Promise<{ isValid: boolean; errorMessage: string }> {
  let isValid = true;
  let errorMessage = "";

  // Schema validation
  if (schema) {
    isValid = Value.Check(schema, input);
    if (!isValid) {
      const errors = [...Value.Errors(schema, input)];
      errorMessage = errors.length > 0 ? errors[0].message : "Invalid input.";
    }
  }

  // Custom validation function
  if (validate && isValid) {
    const validationResult = await validate(input);
    if (typeof validationResult === "string") {
      isValid = false;
      errorMessage = validationResult;
    }
  }

  return { isValid, errorMessage };
}
