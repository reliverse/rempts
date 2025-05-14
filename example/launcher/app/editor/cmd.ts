import { relinka } from "@reliverse/relinka";
import fs from "fs-extra";

import type { EditorExitResult } from "~/types.js";

import { defineCommand, startEditor } from "~/mod.js";

export default defineCommand({
  run: async () => {
    relinka("info", "Opening editor for config...");
    const configPath = "./rempts.config";
    let initialContent = "";
    try {
      initialContent = await fs.readFile(configPath, "utf-8");
    } catch (readError: any) {
      if (readError?.code === "ENOENT") {
        relinka("info", "Config file not found, creating new one.");
      } else {
        relinka(
          "warn",
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
            relinka(
              "info",
              `\n${filename || "Buffer"} is valid JSON. Saving...`,
            );
            // Return true or content unmodified to proceed with save
            return true; // or return content;
          } catch (err: unknown) {
            // Check if err is an Error object before accessing message
            const errorMessage =
              err instanceof Error ? err.message : String(err);
            relinka(
              "error",
              `\nInvalid JSON in ${filename || "Buffer"}: ${errorMessage}`,
            );
            // Delay so user can see the error before editor redraws
            await new Promise((resolve) => setTimeout(resolve, 2000));
            // Return false to prevent saving invalid JSON
            return false;
          }
        },
        // Use underscore for unused 'content' parameter
        onExit(
          _content: string | null,
          saved: boolean,
          filename: string | null,
        ) {
          relinka(
            "info",
            `\nEditor closed for ${filename || "buffer"}. Saved: ${saved}`,
          );
        },
      });

      // startEditor resolves when the editor exits
      // Access properties from the typed 'result' object
      relinka("info", `\nEditor finished. Saved status: ${result.saved}`);
      if (result.saved && result.content !== null) {
        // Check content is not null
        relinka("info", "Config updated successfully.");
        // You could use result.content directly here if needed
        // relinka("info", "New content:", result.content);
      } else if (!result.saved) {
        relinka("info", "Changes were discarded.");
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      relinka("error", "\nEditor encountered an error:", errorMessage);
      if (error instanceof Error && error.stack) {
        relinka("error", error.stack);
      }
    }
  },
});
