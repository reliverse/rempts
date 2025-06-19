import type { Interface } from "node:readline/promises";

import { re } from "@reliverse/relico";
import { isUnicodeSupported } from "@reliverse/runtime";
import readline from "node:readline/promises";

import type { InputPromptOptions, MsgType, RenderParams } from "~/types.js";

import { bar, msg, msgUndoAll } from "~/libs/msg-fmt/messages.js";
import { deleteLastLine } from "~/libs/msg-fmt/terminal.js";
import { completePrompt } from "~/libs/utils/prompt-end.js";
import { streamText } from "~/libs/utils/stream-text.js";

const unicode = isUnicodeSupported();
const S_MASK = unicode ? "▋" : "*";

/**
 * getMaskChar()
 * Returns the appropriate mask character based on Unicode support.
 * Falls back to "*" if Unicode is not supported, regardless of custom mask.
 */
function getMaskChar(customMask?: string): string {
  if (!unicode) return "*";
  return customMask ?? S_MASK;
}

/**
 * ask()
 *
 * Prompt the user for input.
 * - If 'mode' is 'password', handle character-by-character masking.
 * - Otherwise, use readline's .question().
 *
 * @param terminal The readline interface.
 * @param prompt   The text to display before user input.
 * @param mode     The type of input prompt ("plain" or "password").
 * @param endPrompt Callback to handle Ctrl+C or closing the prompt.
 * @returns The user input in plain text, or null if canceled (Ctrl+C).
 */
async function ask(
  terminal: Interface,
  prompt: string,
  mode: "plain" | "password",
  mask?: string,
): Promise<string | null> {
  if (mode === "password") {
    // Manual character-by-character reading for masking:
    return new Promise((resolve) => {
      let buffer = "";
      const maskChar = getMaskChar(mask);

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
       * Clears line and re-renders the prompt with masked input.
       */
      const redrawPrompt = (maskedBuffer: string, textPrompt: string) => {
        process.stdout.clearLine(0);
        process.stdout.cursorTo(0);
        process.stdout.write(textPrompt + maskChar.repeat(maskedBuffer.length));
      };
    });
  }

  // "plain" mode uses the normal question flow:
  return terminal.question(prompt);
}

/**
 * renderPromptUI()
 *
 * Renders the text prompt UI, including optional hint, placeholder,
 * or error messages. Uses msg() for rendering.
 *
 * @param params RenderParams containing display options, user input, etc.
 */
function renderPromptUI(
  params: RenderParams & { shouldStream?: boolean; streamDelay?: number },
): Promise<void> {
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
    shouldStream = false,
    streamDelay = 30,
  } = params;

  // Decide message type based on error state
  const type: MsgType = errorMessage !== "" ? "M_ERROR" : "M_GENERAL";

  if (shouldStream) {
    return new Promise((resolve) => {
      // Initial empty message
      msg({
        type,
        title: "",
        titleColor,
        titleTypography,
        titleVariant,
        content: "",
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
      });

      // Stream title first
      void streamText({
        text: title || "",
        delay: streamDelay,
        color: titleColor,
        newline: false,
      }).then(async () => {
        // Clear and show intermediate state with title
        msgUndoAll();
        msg({
          type,
          title,
          titleColor,
          titleTypography,
          titleVariant,
          content: "",
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
        });

        // Then stream content
        if (content) {
          await streamText({
            text: content,
            delay: streamDelay,
            color: contentColor,
            newline: false,
          });
        }

        // Finally show complete message
        msgUndoAll();
        deleteLastLine();
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
          placeholder: userInput === "" ? placeholder : "",
          errorMessage,
          symbol,
          customSymbol,
          symbolColor,
        });
        resolve();
      });
    });
  }

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
    placeholder: userInput === "" ? placeholder : "",
    errorMessage,
    symbol,
    customSymbol,
    symbolColor,
  });

  // If user already typed something, show it
  if (userInput !== "") {
    msg({ type: "M_MIDDLE", title: `  ${userInput}` });
  }

  return Promise.resolve();
}

/**
 * validateInput()
 *
 * Validates the user input against:
 * - An optional TypeBox schema
 * - An optional custom validate function
 *
 * @param input  The user input string to validate.
 * @param schema Optional TypeBox schema for structural validation.
 * @param validate Optional custom validator function.
 * @returns Object with .isValid and .errorMessage
 */
async function validateInput(
  input: string,
  validate?: (
    value: string,
  ) => string | boolean | undefined | Promise<string | boolean | undefined>,
): Promise<{ isValid: boolean; errorMessage: string }> {
  let isValid = true;
  let errorMessage = "";

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
    // If validationResult is undefined, validation passes (isValid remains true)
  }

  return { isValid, errorMessage };
}

/**
 * inputPrompt()
 *
 * Main entry point to prompt the user for input.
 * - Renders a text prompt with optional hint, placeholder, and content.
 * - Waits for user input (supporting "plain" or "password" modes).
 * - Validates input with an optional TypeBox schema or custom validate() fn.
 * - Shows errors if invalid, re-prompts if necessary.
 * - Handles Ctrl+C gracefully, optionally printing an endTitle.
 * - Returns the user's validated input, or a default value if empty.
 *
 * @param options InputPromptOptions to customize the prompt.
 * @returns A Promise resolving to the validated user input (string).
 */
export async function inputPrompt(
  options: InputPromptOptions,
): Promise<string> {
  const {
    title,
    message, // Alias for title
    hint,
    hintPlaceholderColor = "blue",
    validate,
    defaultValue = "",
    initialValue, // Alias for defaultValue
    titleColor = "cyan",
    titleTypography = "none",
    titleVariant = "none",
    content,
    contentColor = "dim",
    contentTypography = "italic",
    contentVariant = "none",
    borderColor = "dim",
    placeholder,
    hardcoded,
    endTitle = "",
    endTitleColor = "dim",
    border = true,
    symbol,
    customSymbol,
    symbolColor,
    mode = "plain",
    mask,
    shouldStream = false,
    streamDelay = 20,
  } = options;

  // Use message as alias for title, concatenating both if provided
  const finalTitle =
    message && title ? `${title}: ${message}` : (message ?? title ?? "Input");

  // Use initialValue as alias for defaultValue, prioritizing defaultValue if both are provided
  const finalDefaultValue = defaultValue ?? initialValue;

  // Create a new readline interface
  const terminal = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  /**
   * endPrompt()
   *
   * Handles the final actions if the user hits Ctrl+C or the prompt completes.
   * Closes the terminal interface and optionally exits the process.
   */
  async function endPrompt(isCtrlC: boolean): Promise<void> {
    await completePrompt(
      "input",
      isCtrlC,
      endTitle,
      endTitleColor,
      titleTypography,
      titleVariant,
      border,
      borderColor,
      undefined,
      false,
    );
    terminal.close();
    if (isCtrlC) {
      process.exit(0);
    }
  }

  // Handle SIGINT manually for readline
  terminal.on("SIGINT", () => {
    void endPrompt(true);
  });

  let currentInput = hardcoded?.userInput ?? "";
  let errorMessage = hardcoded?.errorMessage ?? "";
  let showPlaceholder = hardcoded?.showPlaceholder ?? true;
  let isRerender = false;

  /**
   * handleHardcodedInput()
   *
   * If user input is pre-supplied in 'hardcoded', validate it immediately
   * without interactive input. Throws if invalid.
   */
  async function handleHardcodedInput(): Promise<string> {
    msgUndoAll();
    await renderPromptUI({
      title: finalTitle,
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
      placeholder: showPlaceholder ? placeholder : "",
      userInput: currentInput,
      errorMessage,
      border,
      symbol,
      customSymbol,
      symbolColor,
      mask,
      shouldStream,
      streamDelay,
    });

    const finalAnswer = currentInput || finalDefaultValue;
    const validated = await validateInput(finalAnswer, validate);

    if (!validated.isValid) {
      terminal.close();
      throw new Error(validated.errorMessage || "Invalid input.");
    }
    // If valid, display final input, close, and return
    msg({ type: "M_MIDDLE", title: `  ${finalAnswer}` });
    msg({ type: "M_BAR", borderColor });
    terminal.close();
    return finalAnswer;
  }

  // If we have a hardcoded user input, skip interactive input
  if (hardcoded?.userInput !== undefined) {
    return handleHardcodedInput();
  }

  /**
   * Interactive loop: repeatedly prompt user for input until validated
   */
  while (true) {
    if (isRerender) {
      // Clear all lines previously rendered by msg()
      msgUndoAll();
    }

    // Mask the displayed userInput if mode === 'password'
    const displayedUserInput =
      mode === "password"
        ? getMaskChar(mask).repeat(currentInput.length)
        : currentInput;

    if (errorMessage) {
      deleteLastLine();
      deleteLastLine();
    }

    await renderPromptUI({
      title: finalTitle,
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
      placeholder: showPlaceholder ? placeholder : "",
      userInput: displayedUserInput,
      errorMessage,
      border,
      symbol,
      customSymbol,
      symbolColor,
      mask,
      shouldStream,
      streamDelay,
    });

    if (errorMessage) {
      deleteLastLine();
    }

    // Format the 'bar' for the question prompt
    const formattedBar = bar({ borderColor });

    // Use our custom ask() helper
    const userInputRaw = await ask(terminal, `${formattedBar}  `, mode, mask);
    isRerender = true;

    // If ask() returns null, the user pressed Ctrl+C (endPrompt called).
    if (userInputRaw === null) {
      return ""; // or never, depending on your design
    }

    currentInput = userInputRaw.trim();

    // Once the user provides any input, disable the placeholder
    if (showPlaceholder && currentInput !== "") {
      showPlaceholder = false;
    }

    // Use finalDefaultValue if nothing is entered
    const finalAnswer = currentInput || finalDefaultValue;
    const validated = await validateInput(finalAnswer, validate);

    if (validated.isValid) {
      // Show user what was accepted if input was empty but default is used
      if (!currentInput && finalDefaultValue) {
        if (mode === "password") {
          deleteLastLine();
          deleteLastLine();
          // Mask the default
          msg({
            type: "M_MIDDLE",
            title: `  ${getMaskChar(mask).repeat(finalDefaultValue.length)}`,
          });
        } else {
          deleteLastLine();
          msg({ type: "M_MIDDLE", title: `  ${re.reset(finalDefaultValue)}` });
        }
      }
      if (errorMessage) {
        deleteLastLine();
      }
      msg({ type: "M_BAR", borderColor });
      terminal.close();
      return finalAnswer;
    }

    // Input was invalid; store error and re-render
    errorMessage = validated.errorMessage;
  }
}
