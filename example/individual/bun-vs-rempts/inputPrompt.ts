/**
 * Interactive input prompt with password mode and placeholders
 */

export interface InputPromptOptions {
  message: string;
  placeholder?: string;
  mode?: "text" | "password";
  default?: string;
}

export async function inputPrompt(options: InputPromptOptions): Promise<string> {
  const { message, placeholder, mode = "text", default: defaultValue = "" } = options;

  // Set up raw mode for stdin to capture individual key presses
  if (process.stdin.isTTY) {
    process.stdin.setRawMode(true);
  }

  let input = defaultValue;
  let cursorPosition = input.length;
  let isExiting = false;

  const render = () => {
    // Clear current line and move cursor to beginning
    process.stdout.write("\r\x1b[K");

    // Show the prompt on a new line
    process.stdout.write(`${message}\n`);

    if (placeholder && input.length === 0) {
      // Show placeholder in dim text
      process.stdout.write(`\x1b[2m${placeholder}\x1b[0m`);
    } else {
      // Show actual input (masked if password mode)
      const displayText = mode === "password" ? "*".repeat(input.length) : input;
      process.stdout.write(displayText);
    }

    // Position cursor correctly
    const displayLength = input.length === 0 && placeholder ? placeholder.length : input.length;
    const targetPosition = input.length === 0 && placeholder ? 0 : cursorPosition;

    if (targetPosition < displayLength) {
      process.stdout.write(`\x1b[${displayLength - targetPosition}D`);
    }
  };

  const updateInput = () => {
    // Clear current line and move cursor to beginning
    process.stdout.write("\r\x1b[K");

    if (placeholder && input.length === 0) {
      // Show placeholder in dim text
      process.stdout.write(`\x1b[2m${placeholder}\x1b[0m`);
    } else {
      // Show actual input (masked if password mode)
      const displayText = mode === "password" ? "*".repeat(input.length) : input;
      process.stdout.write(displayText);
    }

    // Position cursor correctly
    const displayLength = input.length === 0 && placeholder ? placeholder.length : input.length;
    const targetPosition = input.length === 0 && placeholder ? 0 : cursorPosition;

    if (targetPosition < displayLength) {
      process.stdout.write(`\x1b[${displayLength - targetPosition}D`);
    }
  };

  // Initial render
  render();

  return new Promise((resolve) => {
    const cleanup = () => {
      if (process.stdin.isTTY) {
        process.stdin.setRawMode(false);
      }
      process.stdin.removeAllListeners("data");
      process.stdin.removeAllListeners("SIGINT");
    };

    const handleKey = (key: Buffer) => {
      if (isExiting) return;

      const keyStr = key.toString();

      // Handle Enter key
      if (keyStr === "\r" || keyStr === "\n") {
        isExiting = true;
        cleanup();
        process.stdout.write("\n");
        resolve(input);
        return;
      }

      // Handle Escape key
      if (keyStr === "\u001b") {
        isExiting = true;
        cleanup();
        process.stdout.write("\n");
        resolve(defaultValue);
        return;
      }

      // Handle Ctrl+C
      if (keyStr === "\u0003") {
        isExiting = true;
        cleanup();
        process.stdout.write("\n");
        process.exit(0);
      }

      // Handle backspace
      if (keyStr === "\b" || keyStr === "\u007f") {
        if (cursorPosition > 0) {
          input = input.slice(0, cursorPosition - 1) + input.slice(cursorPosition);
          cursorPosition--;
          updateInput();
        }
        return;
      }

      // Handle delete
      if (keyStr === "\u001b[3~") {
        if (cursorPosition < input.length) {
          input = input.slice(0, cursorPosition) + input.slice(cursorPosition + 1);
          updateInput();
        }
        return;
      }

      // Handle arrow keys
      if (keyStr === "\u001b[D") {
        // Left arrow
        if (cursorPosition > 0) {
          cursorPosition--;
          updateInput();
        }
        return;
      }

      if (keyStr === "\u001b[C") {
        // Right arrow
        if (cursorPosition < input.length) {
          cursorPosition++;
          updateInput();
        }
        return;
      }

      // Handle home key
      if (keyStr === "\u001b[H") {
        cursorPosition = 0;
        updateInput();
        return;
      }

      // Handle end key
      if (keyStr === "\u001b[F") {
        cursorPosition = input.length;
        updateInput();
        return;
      }

      // Handle printable characters
      if (keyStr.length === 1 && keyStr >= " ") {
        input = input.slice(0, cursorPosition) + keyStr + input.slice(cursorPosition);
        cursorPosition++;
        updateInput();
        return;
      }
    };

    // Set up event listeners
    process.stdin.on("data", handleKey);

    // Handle Ctrl+C gracefully
    process.stdin.on("SIGINT", () => {
      isExiting = true;
      cleanup();
      process.stdout.write("\n");
      process.exit(0);
    });
  });
}
