// 👉 `bun examples\other\relinka.ts`

import { defineCommand, relinkaAsyncByRemptsDeprecated } from "~/mod.js";

const spinnerFrames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

export default defineCommand({
  run: async () => {
    // 1. Just title with spinner
    await relinkaAsyncByRemptsDeprecated(
      "info",
      "Starting demo...",
      undefined,
      undefined,
      {
        useSpinner: true,
      },
    );
    await new Promise((resolve) => setTimeout(resolve, 500));

    // 2. Title and content with spinner
    await relinkaAsyncByRemptsDeprecated(
      "success",
      "Loading Configuration",
      "Reading system settings...",
      undefined,
      {
        useSpinner: true,
        spinnerFrames,
      },
    );
    await new Promise((resolve) => setTimeout(resolve, 500));

    // 3. Title, content, and hint with spinner
    await relinkaAsyncByRemptsDeprecated(
      "warn",
      "Performance Notice",
      "System is running at high capacity",
      "Consider closing unused applications",
      {
        useSpinner: true,
        spinnerFrames: ["⚠", "!", "⚠", "!"],
        spinnerDelay: 200,
      },
    );
    await new Promise((resolve) => setTimeout(resolve, 500));

    // 4. Just title with streaming (no spinner)
    await relinkaAsyncByRemptsDeprecated(
      "error",
      "Connection Failed",
      undefined,
      undefined,
      {
        delay: 20,
      },
    );
    await new Promise((resolve) => setTimeout(resolve, 500));

    // 5. Title and content with streaming (no spinner)
    await relinkaAsyncByRemptsDeprecated(
      "info-verbose",
      "Debug Information",
      "Detailed system diagnostics",
      undefined,
      { delay: 30 },
    );
    await new Promise((resolve) => setTimeout(resolve, 500));

    // 6. All fields with streaming (no spinner)
    await relinkaAsyncByRemptsDeprecated(
      "log",
      "Processing Complete",
      "All tasks finished successfully",
      "You can now proceed to the next step",
      { delay: 25 },
    );
    await new Promise((resolve) => setTimeout(resolve, 500));

    // 7. Title only without animation
    await relinkaAsyncByRemptsDeprecated("info", "Static Message");
    await new Promise((resolve) => setTimeout(resolve, 500));

    // 8. Title and content without animation
    await relinkaAsyncByRemptsDeprecated(
      "success",
      "Operation Complete",
      "Task finished without animation",
    );
    await new Promise((resolve) => setTimeout(resolve, 500));

    // 9. All fields without animation
    await relinkaAsyncByRemptsDeprecated(
      "warn",
      "Important Notice",
      "This is a static message",
      "No animation or streaming used",
    );
  },
});
