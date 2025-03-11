// 👉 `bun examples\other\relinka.ts`

import { relinkaAsync } from "~/main.js";

const spinnerFrames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

async function main() {
  // 1. Just title with spinner
  await relinkaAsync("info", "Starting demo...", undefined, undefined, {
    useSpinner: true,
  });
  await new Promise((resolve) => setTimeout(resolve, 500));

  // 2. Title and content with spinner
  await relinkaAsync(
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
  await relinkaAsync(
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
  await relinkaAsync("error", "Connection Failed", undefined, undefined, {
    delay: 20,
  });
  await new Promise((resolve) => setTimeout(resolve, 500));

  // 5. Title and content with streaming (no spinner)
  await relinkaAsync(
    "info-verbose",
    "Debug Information",
    "Detailed system diagnostics",
    undefined,
    { delay: 30 },
  );
  await new Promise((resolve) => setTimeout(resolve, 500));

  // 6. All fields with streaming (no spinner)
  await relinkaAsync(
    "log",
    "Processing Complete",
    "All tasks finished successfully",
    "You can now proceed to the next step",
    { delay: 25 },
  );
  await new Promise((resolve) => setTimeout(resolve, 500));

  // 7. Title only without animation
  await relinkaAsync("info", "Static Message");
  await new Promise((resolve) => setTimeout(resolve, 500));

  // 8. Title and content without animation
  await relinkaAsync(
    "success",
    "Operation Complete",
    "Task finished without animation",
  );
  await new Promise((resolve) => setTimeout(resolve, 500));

  // 9. All fields without animation
  await relinkaAsync(
    "warn",
    "Important Notice",
    "This is a static message",
    "No animation or streaming used",
  );
}

await main().catch(console.error);
