import fs from "fs-extra";
import path from "pathe";

import { spinnerPrompts } from "~/main";

const outputDir = path.resolve(__dirname, "output");

const filesToDelete = [
  path.join(outputDir, "types/dev.d.ts"),
  path.join(outputDir, "types/dev.js"),
];

async function deleteFiles(paths: string[]) {
  for (const filePath of paths) {
    try {
      if (await fs.pathExists(filePath)) {
        await fs.remove(filePath);
      } else {
        console.log(`File not found: ${filePath}`);
      }
    } catch (error) {
      console.error(`Error deleting file ${filePath}:`, error);
    }
  }
}

function replaceImportPaths(
  content: string,
  fileDir: string,
  rootDir: string,
): string {
  return content.replace(
    /(from\s+['"])~(\/[^'"]*)(['"])/g,
    (match, prefix, importPath, suffix) => {
      const relativePathToRoot = path.relative(fileDir, rootDir) || ".";
      let newPath = path.join(relativePathToRoot, importPath);
      newPath = newPath.replace(/\\/g, "/");
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
    } else if (filePath.endsWith(".js") || filePath.endsWith(".d.ts")) {
      const content = await fs.readFile(filePath, "utf8");

      const updatedContent = replaceImportPaths(
        content,
        path.dirname(filePath),
        outputDir,
      );

      if (content !== updatedContent) {
        await fs.writeFile(filePath, updatedContent, "utf8");
      }
    }
  }
}

async function optimizeBuildForProduction(dir: string) {
  await spinnerPrompts({
    initialMessage: "Creating an optimized production build...",
    successMessage: "Optimized production build created successfully.",
    spinnerSolution: "ora",
    spinnerType: "arc",
    action: async (updateMessage) => {
      await processFiles(dir);
      updateMessage("Cleaning up unnecessary files...");
      await deleteFiles(filesToDelete);
    },
  });
}

await optimizeBuildForProduction(outputDir).catch((error) => {
  console.error("An error occurred:", error);
  process.exit(1);
});
