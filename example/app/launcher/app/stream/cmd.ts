// 👉 `bun examples\other\stream.ts`

import { defineCommand, streamText, streamTextBox, streamTextWithSpinner } from "~/mod";

export default defineCommand({
  run: async () => {
    // Basic text streaming
    await streamText({
      text: "Basic text streaming example...",
      color: "cyan",
      delay: 20,
    });

    // Stream text in a box
    await streamTextBox({
      text: "This text appears in a nice box with animated typing!",
      color: "green",
      delay: 20,
      borderColor: "dim",
    });

    // Stream with a spinner
    await streamTextWithSpinner({
      text: "Loading something important...",
      color: "yellow",
      delay: 40,
      spinnerFrames: ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"],
      spinnerDelay: 80,
    });

    // Multiple lines with different colors
    await streamText({
      text: "First line in blue",
      color: "blue",
      delay: 30,
    });
    await streamText({
      text: "Second line in magenta",
      color: "magenta",
      delay: 30,
    });
    await streamText({
      text: "Third line in green",
      color: "green",
      delay: 30,
    });

    // Clear line example
    await streamText({
      text: "This will be cleared...",
      color: "red",
      delay: 20,
      newline: false,
    });
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await streamText({
      text: "And replaced with this!",
      color: "green",
      delay: 20,
      clearLine: true,
    });
  },
});
