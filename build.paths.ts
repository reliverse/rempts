import fs from "fs-extra";
import path from "pathe";

const distDir = path.resolve(__dirname, "dist");

// Function to replace '~' with '.' in import paths
function replaceImportPaths(content: string): string {
  return content.replace(
    /from\s+['"]~(\/[^'"]*)['"]/g,
    (_: string, p1: string) => {
      return `from ".${p1}"`;
    },
  );
}

// Function to process files recursively
async function processFiles(dir: string) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Recursively process nested directories
      await processFiles(filePath);
    } else if (filePath.endsWith(".js")) {
      // Read the file content
      const content = fs.readFileSync(filePath, "utf8");

      // Replace the import paths
      const updatedContent = replaceImportPaths(content);

      // Write back if content changed
      if (content !== updatedContent) {
        fs.writeFileSync(filePath, updatedContent, "utf8");
        console.log(`Updated imports in: ${filePath}`);
      }
    }
  }
}

// Run the script starting from the main file
processFiles(distDir)
  .then(() => {
    console.log("Import paths updated successfully in the dist folder.");
  })
  .catch((error) => {
    console.error("An error occurred:", error);
    process.exit(1);
  });
