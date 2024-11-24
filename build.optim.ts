import glob from "fast-glob";
import fs from "fs-extra";
import path from "pathe";

import { spinner } from "~/mod.js";

// Parse command-line arguments to check for '--jsr' flag
const args = process.argv.slice(2);
const isJSR = args.includes("--jsr");

// Define directories based on the presence of '--jsr' flag
const sourceDir = path.resolve(__dirname, "src");
const outputDir = path.resolve(__dirname, isJSR ? "dist-jsr" : "dist-npm");

// Separate patterns for files to delete in different modes
const npmFilesToDelete = [
  "**/*.test.js",
  "**/*.test.d.ts",
  "types/internal.js",
  "types/internal.d.ts",
];

const jsrFilesToDelete = ["**/*.test.ts", "types/internal.ts"];

// Toggle debug mode
const debug = false;

/**
 * Deletes files matching the provided patterns within the base directory.
 * @param patterns Array of glob patterns to match files for deletion.
 * @param baseDir The base directory to search for files.
 */
async function deleteFiles(patterns: string[], baseDir: string) {
  try {
    const files = await glob(patterns, { cwd: baseDir, absolute: true });

    if (files.length === 0) {
      console.log("No files matched the deletion patterns.");
      return;
    }

    for (const filePath of files) {
      try {
        await fs.remove(filePath);
        debug && console.log(`Deleted: ${filePath}`);
      } catch (error) {
        console.error(`Error deleting file ${filePath}:`, error);
      }
    }
  } catch (error) {
    console.error("Error processing deletion patterns:", error);
  }
}

/**
 * Replaces import paths that use '~/' with relative paths.
 * @param content The file content.
 * @param fileDir The directory of the current file.
 * @param rootDir The root directory to resolve relative paths.
 * @returns The updated file content with modified import paths.
 */
function replaceImportPaths(
  content: string,
  fileDir: string,
  rootDir: string,
): string {
  return content.replace(
    // Matches both static and dynamic imports
    /(from\s+['"]|import\s*\(\s*['"])(~\/?[^'"]*)(['"]\s*\)?)/g,
    (match, prefix, importPath, suffix) => {
      const relativePathToRoot = path.relative(fileDir, rootDir) || ".";
      // Remove leading '~/' or '~' from importPath
      importPath = importPath.replace(/^~\/?/, "");
      let newPath = path.join(relativePathToRoot, importPath);
      // Replace backslashes with forward slashes
      newPath = newPath.replace(/\\/g, "/");
      // Ensure the path starts with './' or '../'
      if (!newPath.startsWith(".")) {
        newPath = `./${newPath}`;
      }
      return `${prefix}${newPath}${suffix}`;
    },
  );
}

/**
 * Processes all relevant files in the given directory by replacing import paths.
 * @param dir The directory to process.
 */
async function processFiles(dir: string) {
  const files = await fs.readdir(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = await fs.stat(filePath);

    if (stat.isDirectory()) {
      await processFiles(filePath);
    } else if (
      filePath.endsWith(".ts") ||
      filePath.endsWith(".tsx") ||
      filePath.endsWith(".d.ts") ||
      filePath.endsWith(".js") ||
      filePath.endsWith(".jsx") ||
      filePath.endsWith(".mjs") ||
      filePath.endsWith(".cjs") ||
      filePath.endsWith(".mts") ||
      filePath.endsWith(".cts")
    ) {
      try {
        const content = await fs.readFile(filePath, "utf8");

        const updatedContent = replaceImportPaths(
          content,
          path.dirname(filePath),
          outputDir,
        );

        if (content !== updatedContent) {
          await fs.writeFile(filePath, updatedContent, "utf8");
          debug && console.log(`Updated import paths in: ${filePath}`);
        }
      } catch (error) {
        console.error(`Error processing file ${filePath}:`, error);
      }
    }
  }
}

/**
 * Removes the 'dist' directory if it exists.
 */
async function removeDistDirectory() {
  try {
    const exists = await fs.pathExists(outputDir);
    if (exists) {
      await fs.remove(outputDir);
      debug && console.log(`Removed existing '${outputDir}' directory.`);
    }
  } catch (error) {
    console.error(`Error removing '${outputDir}' directory:`, error);
    throw error;
  }
}

/**
 * Copies the 'src' directory to 'dist-jsr' when '--jsr' flag is provided.
 */
async function copySrcToDist() {
  try {
    await fs.copy(sourceDir, outputDir, {
      overwrite: true,
      errorOnExist: false,
    });
    debug && console.log(`Copied 'src' to '${outputDir}'`);
  } catch (error) {
    console.error(`Error copying 'src' to 'dist-jsr':`, error);
    throw error;
  }
}

/**
 * Optimizes the build for production by processing files and deleting unnecessary ones.
 * @param dir The directory to optimize.
 */
async function optimizeBuildForProduction(dir: string) {
  await spinner({
    initialMessage: isJSR
      ? "Preparing JSR build by removing existing 'dist' directory..."
      : "Creating an optimized production build...",
    successMessage: isJSR
      ? "JSR build prepared successfully."
      : "Optimized production build created successfully.",
    spinnerSolution: "ora",
    spinnerType: "arc",
    action: async (updateMessage: (arg0: string) => void) => {
      if (isJSR) {
        updateMessage("Removing existing 'dist-jsr' directory...");
        await removeDistDirectory(); // Remove 'dist-jsr' before copying
        updateMessage("Copying 'src' to 'dist-jsr'...");
        await copySrcToDist();
      }
      updateMessage("Processing files...");
      await processFiles(dir);
      updateMessage("Cleaning up unnecessary files...");
      // Choose the appropriate files to delete based on the mode
      const filesToDelete = isJSR ? jsrFilesToDelete : npmFilesToDelete;
      await deleteFiles(filesToDelete, dir);
    },
  });
}

optimizeBuildForProduction(outputDir).catch((error) => {
  console.error("An error occurred:", error);
  process.exit(1);
});
