import fs from "fs-extra";

import type { EditorExitResult } from "~/types.js";

import { startEditor } from "~/main.js";

async function editConfig() {
  console.log("Opening editor for config...");
  const configPath = "./rempts.config";
  let initialContent = "";
  try {
    initialContent = await fs.readFile(configPath, "utf-8");
  } catch (readError: any) {
    if (readError?.code === "ENOENT") {
      console.log("Config file not found, creating new one.");
    } else {
      console.warn(
        `Warning: Could not read existing config file '${configPath}': ${readError.message || readError}`,
      );
    }
    initialContent = ""; // Start with empty content if not found or unreadable
  }

  try {
    // Explicitly type the result using the imported interface
    const result: EditorExitResult = await startEditor({
      filename: configPath,
      initialContent: initialContent,
      // Restrictive mode: cannot open other files or save as something else
      allowOpen: false,
      allowSaveAs: false,
      // Example hook: Validate JSON before saving
      async onSave(
        content: string,
        filename: string | null,
      ): Promise<boolean | string> {
        try {
          JSON.parse(content);
          console.log(`\n${filename || "Buffer"} is valid JSON. Saving...`);
          // Return true or content unmodified to proceed with save
          return true; // or return content;
        } catch (err: unknown) {
          // Check if err is an Error object before accessing message
          const errorMessage = err instanceof Error ? err.message : String(err);
          console.error(
            `\nInvalid JSON in ${filename || "Buffer"}: ${errorMessage}`,
          );
          // Add a delay so user can see the error before editor redraws
          await new Promise((resolve) => setTimeout(resolve, 2000));
          // Return false to prevent saving invalid JSON
          return false;
        }
      },
      // Use underscore for unused 'content' parameter
      onExit(_content: string | null, saved: boolean, filename: string | null) {
        console.log(
          `\nEditor closed for ${filename || "buffer"}. Saved: ${saved}`,
        );
      },
    });

    // startEditor resolves when the editor exits
    // Access properties from the typed 'result' object
    console.log(`\nEditor finished. Saved status: ${result.saved}`);
    if (result.saved && result.content !== null) {
      // Check content is not null
      console.log("Config updated successfully.");
      // You could use result.content directly here if needed
      // console.log("New content:", result.content);
    } else if (!result.saved) {
      console.log("Changes were discarded.");
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("\nEditor encountered an error:", errorMessage);
    if (error instanceof Error && error.stack) {
      console.error(error.stack);
    }
  }
}

// Handle potential promise rejection from editConfig()
editConfig().catch((error) => {
  console.error("Unhandled error during configuration editing:", error);
  process.exit(1); // Exit with error code if the main function fails
});
