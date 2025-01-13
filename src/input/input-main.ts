import type {
  ColorName,
  MsgType,
  SymbolName,
  TypographyName,
  VariantName,
} from "@reliverse/relinka";
import type { TSchema } from "@sinclair/typebox";

import { bar, deleteLastLine, msg, msgUndoAll } from "@reliverse/relinka";
import { Value } from "@sinclair/typebox/value";
import { stdin as input, stdout as output } from "node:process";
import readline from "node:readline/promises";
import pc from "picocolors";

import type { PromptOptions } from "~/main.js";

import { completePrompt } from "~/utils/prompt-end.js";

export type InputPromptOptions = {
  title: string;
  hint?: string;
  hintPlaceholderColor?: ColorName;
  validate?: (
    value: string,
  ) => string | boolean | void | Promise<string | boolean | void>;
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
  userInput: string;
  errorMessage: string;
  border: boolean;
  hint?: string | undefined;
  hintPlaceholderColor?: ColorName | undefined;
  content?: string | undefined;
  contentColor?: ColorName | undefined;
  contentTypography?: TypographyName | undefined;
  contentVariant?: VariantName | undefined;
  titleColor?: ColorName | undefined;
  titleTypography?: TypographyName | undefined;
  titleVariant?: VariantName | undefined;
  borderColor?: ColorName | undefined;
  placeholder?: string | undefined;
  symbol?: SymbolName | undefined;
  customSymbol?: string | undefined;
  symbolColor?: ColorName | undefined;
};

/**
 * Renders the prompt UI.
 * Uses `msg()` for all printing, so we can easily undo and re-render.
 * Returns nothing (the line counting is handled internally by `msg()` and `msgUndoAll()`).
 */
function renderPromptUI(params: RenderParams & { isRerender?: boolean }) {
  const {
    title,
    hint = "",
    hintPlaceholderColor = "blue",
    content = "",
    contentColor = "dim",
    contentTypography = "italic",
    contentVariant = "none",
    titleColor = "cyan",
    titleTypography = "none",
    titleVariant = "none",
    borderColor = "dim",
    placeholder = "",
    userInput,
    errorMessage,
    symbol = "step_active",
    customSymbol = "",
    symbolColor = "cyan",
  } = params;

  // Decide message type based on error state
  const type: MsgType = errorMessage !== "" ? "M_ERROR" : "M_GENERAL";

  // Main prompt line
  const msgParams = {
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
    placeholder: userInput === "" ? placeholder : "",
    errorMessage,
    symbol,
    customSymbol,
    symbolColor,
  };

  msg(
    msgParams as {
      type: MsgType;
      title: string;
      titleColor: ColorName;
      titleTypography: TypographyName;
      titleVariant: VariantName;
      content: string;
      contentColor: ColorName;
      contentTypography: TypographyName;
      contentVariant: VariantName;
      borderColor: ColorName;
      hint: string;
      hintPlaceholderColor: ColorName;
      placeholder: string;
      errorMessage: string;
      symbol: SymbolName;
      customSymbol: string;
      symbolColor: ColorName;
    },
  );

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
    hintPlaceholderColor = "blue",
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
  async function endPrompt(isCtrlC: boolean) {
    await completePrompt(
      isCtrlC,
      endTitle,
      endTitleColor,
      titleTypography,
      titleVariant ? titleVariant : undefined,
      border,
      borderColor,
      undefined,
      false,
    );
    rl.close();
    if (isCtrlC) {
      process.exit(0);
    }
  }

  rl.on("SIGINT", () => {
    void endPrompt(true);
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
      void endPrompt(true);
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
        msg({ type: "M_MIDDLE", title: `  ${pc.reset(defaultValue)}` });
      } else if (currentInput) {
        msg({ type: "M_MIDDLE", title: `  ${pc.reset(currentInput)}` });
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
  validate?: (
    value: string,
  ) => string | boolean | void | Promise<string | boolean | void>,
): Promise<{ isValid: boolean; errorMessage: string }> {
  let isValid = true;
  let errorMessage = "";

  // Schema validation
  if (schema) {
    isValid = Value.Check(schema, input);
    if (!isValid) {
      const errors = [...Value.Errors(schema, input)];
      errorMessage =
        errors.length > 0 && errors[0]?.message
          ? errors[0].message
          : "Invalid input.";
    }
  }

  // Custom validation function
  if (validate && isValid) {
    const validationResult = await validate(input);
    if (typeof validationResult === "string") {
      isValid = false;
      errorMessage = validationResult;
    } else if (validationResult === false) {
      isValid = false;
      errorMessage = "Invalid input.";
    }
  }

  return { isValid, errorMessage };
}
