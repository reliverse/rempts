import fs from "fs-extra";
import path from "pathe";

import { createSpinner } from "~/main";

const distDir = path.resolve(__dirname, "dist");

const filesToDelete = [path.join(distDir, "utils/charmap.d.ts")];

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
        distDir,
      );

      if (content !== updatedContent) {
        await fs.writeFile(filePath, updatedContent, "utf8");
      }
    }
  }
}

async function optimizeBuildForProduction(dir: string) {
  const spinner = createSpinner({
    initialMessage: "Creating an optimized production build...",
    solution: "ora",
    spinnerType: "bouncingBar",
  });
  spinner.start();

  try {
    await processFiles(dir);
    spinner.updateMessage("Cleaning up unnecessary files...");
    await deleteFiles(filesToDelete);
    spinner.stop("Optimized production build created successfully.");
  } catch (error) {
    spinner.stop("Build process failed.");
    console.error("An error occurred during build optimization:", error);
    process.exit(1);
  }
}

await optimizeBuildForProduction(distDir).catch((error) => {
  console.error("An error occurred:", error);
  process.exit(1);
});
