import glob from "fast-glob";
import fs from "fs-extra";
import path from "pathe";

import { spinner } from "~/components/spinner/index.js";

const outputDir = path.resolve(__dirname, "output");

const filesToDelete = [
  "**/*.test.js",
  "**/*.test.d.ts",
  "unsorted/types/internal.js",
  "unsorted/types/internal.d.ts",
];

const debug = false;

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

async function optimizeBuildForProduction(dir: string) {
  await spinner({
    initialMessage: "Creating an optimized production build...",
    successMessage: "Optimized production build created successfully.",
    spinnerSolution: "ora",
    spinnerType: "arc",
    action: async (updateMessage: (arg0: string) => void) => {
      await processFiles(dir);
      updateMessage("Cleaning up unnecessary files...");
      await deleteFiles(filesToDelete, dir);
    },
  });
}

optimizeBuildForProduction(outputDir).catch((error) => {
  console.error("An error occurred:", error);
  process.exit(1);
});
