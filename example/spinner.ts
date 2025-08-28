import { re } from "@reliverse/relico";
import {
  createBuildSpinner,
  createFileProgressSpinner,
  createMultiStepSpinner,
  createSpinner,
  createSpinnerGroup,
  createTimedSpinner,
  createTransferSpinner,
  formatSpinnerBytes,
  formatSpinnerElapsed,
  formatSpinnerTiming,
  withEnhancedSpinner,
  withSpinner,
  withSpinnerPromise,
} from "~/mod";

// ==============================================================================
// 🎡 @RELIVERSE/REMPTS SPINNER EXAMPLES
// ==============================================================================
// 🚀 Run with: bun example/spinner.ts
//
// This example demonstrates:
// • Basic spinner usage patterns
// • File progress tracking with pretty-bytes formatting
// • Multi-step operations with automatic timing
// • Transfer operations with rate monitoring
// • Build-specific spinner patterns
// • Concurrent spinner groups for parallel operations
// • Enhanced spinners with progress methods
// • Promise integration and utility functions
// ==============================================================================

async function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function simulateFileOperation(bytes: number): Promise<void> {
  // Simulate file processing with random delays
  const chunks = Math.ceil(bytes / (1024 * 1024)); // 1MB chunks
  for (let i = 0; i < chunks; i++) {
    await wait(Math.random() * 200 + 100); // 100-300ms per chunk
  }
}

// ==============================================================================
// 1. BASIC SPINNER EXAMPLES
// ==============================================================================

async function basicSpinnerExamples(): Promise<void> {
  console.log("\n🎡 Basic Spinner Examples\n");

  // Simple spinner with colored text/success/fail
  const spinner1 = createSpinner({
    text: "Processing...",
    textColor: "cyan",
    successColor: "green",
    failColor: "red",
  }).start();
  await wait(1500);
  spinner1.succeed("Processing completed!");

  await wait(500);

  // Timed spinner with automatic timing display
  const { succeedWithTiming } = createTimedSpinner("Building project");
  await wait(2300);
  succeedWithTiming("Build complete"); // Shows "Build complete (2.3s)"

  await wait(500);

  // Using withSpinner helper with colored messages and timing
  await withSpinner(
    { text: "Installing dependencies", showTiming: true, textColor: "cyan", successColor: "green" },
    async (spinner) => {
      spinner.text = "Downloading packages...";
      await wait(1000);
      spinner.text = "Installing packages...";
      await wait(1200);
      return "Dependencies installed";
    },
    (result) => `${result} successfully`, // Shows timing automatically
  );
}

// ==============================================================================
// 2. ENHANCED SPINNER WITH PROGRESS TRACKING
// ==============================================================================

async function enhancedSpinnerExamples(): Promise<void> {
  console.log("\n⚡ Enhanced Spinner Examples\n");

  await withEnhancedSpinner(
    {
      text: "Processing files",
      showTiming: true,
      successText: "All files processed",
      failText: "File processing failed",
      // Demonstrate per-call color styling
      textColor: "cyan",
      successColor: "green",
      failColor: "red",
      // Optional theme using `re` (functions)
      theme: {
        info: re.cyan,
        success: re.green,
        error: re.red,
        dim: re.dim,
        percentage: re.yellow,
        bytes: re.cyan,
        rate: re.cyan,
      },
    },
    async (spinner) => {
      const files = ["config.json", "package.json", "tsconfig.json", "README.md"];

      for (const [index, file] of files.entries()) {
        spinner.setProgress(index + 1, files.length, `Processing ${file}`);
        await wait(800);
      }

      return files.length;
    },
  );
}

// ==============================================================================
// 3. FILE PROGRESS SPINNER WITH PRETTY-BYTES
// ==============================================================================

async function fileProgressExamples(): Promise<void> {
  console.log("\n📦 File Progress Examples (with pretty-bytes)\n");

  // Downloading a large file
  const downloadSpinner = createFileProgressSpinner("Downloading Node.js", {
    totalBytes: 50 * 1024 * 1024, // 50MB
    showBytes: true,
    showRate: true,
    color: "blue",
  });

  let downloaded = 0;
  const totalBytes = 50 * 1024 * 1024;
  const chunkSize = 2 * 1024 * 1024; // 2MB chunks

  while (downloaded < totalBytes) {
    downloaded += chunkSize;
    if (downloaded > totalBytes) downloaded = totalBytes;

    downloadSpinner.updateProgress(downloaded, "node-v20.10.0-linux-x64.tar.xz");

    // Simulate download rate
    const rate = 1024 * 1024 * (Math.random() * 3 + 2); // 2-5 MB/s
    downloadSpinner.updateRate(rate);

    await wait(300);
  }

  downloadSpinner.complete("Download completed");

  await wait(1000);

  // Processing files with size tracking
  const processSpinner = createFileProgressSpinner("Processing large dataset", {
    showBytes: true,
    color: "green",
  });

  const fileSizes = [
    { name: "data-2024-01.json", size: 15 * 1024 * 1024 },
    { name: "data-2024-02.json", size: 23 * 1024 * 1024 },
    { name: "data-2024-03.json", size: 18 * 1024 * 1024 },
  ];

  let processed = 0;
  for (const file of fileSizes) {
    processed += file.size;
    processSpinner.updateProgress(processed, file.name);
    await simulateFileOperation(file.size);
  }

  processSpinner.complete(`Processed ${formatSpinnerBytes(processed)} of data`);
}

// ==============================================================================
// 4. MULTI-STEP OPERATIONS
// ==============================================================================

async function multiStepExamples(): Promise<void> {
  console.log("\n🪜 Multi-Step Operation Examples\n");

  const buildSteps = [
    "Cleaning previous build",
    "Compiling TypeScript",
    "Bundling with Rollup",
    "Optimizing bundle size",
    "Generating type definitions",
    "Creating documentation",
  ];

  const multiSpinner = createMultiStepSpinner("Building library", buildSteps, {
    color: "magenta",
  });

  for (let i = 0; i < buildSteps.length; i++) {
    const stepTime = Math.random() * 1500 + 500; // 500-2000ms per step
    await wait(stepTime);

    if (i < buildSteps.length - 1) {
      multiSpinner.nextStep();
    }
  }

  multiSpinner.complete("Library built successfully");
}

// ==============================================================================
// 5. TRANSFER OPERATIONS WITH RATE DISPLAY
// ==============================================================================

async function transferExamples(): Promise<void> {
  console.log("\n🚀 Transfer Operation Examples\n");

  // Uploading to NPM
  const uploadSpinner = createTransferSpinner("Publishing to NPM", {
    totalBytes: 5 * 1024 * 1024, // 5MB package
    showRate: true,
    color: "red",
  });

  let uploaded = 0;
  const packageSize = 5 * 1024 * 1024;
  const uploadChunk = 512 * 1024; // 512KB chunks

  while (uploaded < packageSize) {
    uploaded += uploadChunk;
    if (uploaded > packageSize) uploaded = packageSize;

    uploadSpinner.updateBytes(uploaded, "my-awesome-package.tgz");

    // Simulate upload rate (slower than download)
    const rate = 1024 * 1024 * (Math.random() * 1 + 0.5); // 0.5-1.5 MB/s
    uploadSpinner.updateRate(rate);

    await wait(400);
  }

  uploadSpinner.complete("Package published", packageSize);

  await wait(1000);

  // JSR publishing
  const jsrSpinner = createTransferSpinner("Publishing to JSR", {
    showRate: false, // No rate display for this one
    color: "yellow",
  });

  const jsrFiles = [
    { name: "mod.ts", size: 1024 * 45 },
    { name: "README.md", size: 1024 * 12 },
    { name: "LICENSE", size: 1024 * 2 },
  ];

  let jsrUploaded = 0;
  for (const file of jsrFiles) {
    jsrUploaded += file.size;
    jsrSpinner.updateBytes(jsrUploaded, file.name);
    await wait(600);
  }

  jsrSpinner.complete("Published to JSR", jsrUploaded);
}

// ==============================================================================
// 6. BUILD-SPECIFIC SPINNERS
// ==============================================================================

async function buildSpecificExamples(): Promise<void> {
  console.log("\n🏗️  Build-Specific Spinner Examples\n");

  // Build spinner with progress updates
  const { complete, updateProgress } = createBuildSpinner("Building React app", {
    color: "cyan",
  });

  const buildTasks = [
    "Analyzing dependencies",
    "Compiling TypeScript",
    "Processing CSS",
    "Bundling JavaScript",
    "Optimizing images",
    "Generating service worker",
    "Creating build manifest",
  ];

  for (const task of buildTasks) {
    updateProgress(task);
    await wait(Math.random() * 800 + 400);
  }

  complete("React app built successfully");

  await wait(1000);

  // Error handling example
  const { error: buildError } = createBuildSpinner("Building with error", {
    color: "red",
  });

  await wait(1500);
  buildError(
    new Error("TypeScript compilation failed: Type 'string' is not assignable to type 'number'"),
  );
}

// ==============================================================================
// 7. SPINNER GROUPS FOR PARALLEL OPERATIONS
// ==============================================================================

async function spinnerGroupExamples(): Promise<void> {
  console.log("\n👥 Spinner Group Examples\n");

  // Concurrent operations
  const group = createSpinnerGroup({
    items: ["Building main package", "Building documentation", "Running tests", "Type checking"],
    concurrent: true,
    color: "green",
    // Apply a subtle group-level style
    textColor: "cyan",
    successColor: "green",
    failColor: "red",
  });

  // Start all spinners
  for (const spinner of group.spinners) {
    spinner.start();
  }

  // Simulate different completion times
  await wait(1200);
  group.spinners[2]?.succeed("Tests passed");

  await wait(800);
  group.spinners[3]?.succeed("Types are valid");

  await wait(1000);
  group.spinners[0]?.succeed("Main package built");

  await wait(600);
  group.spinners[1]?.succeed("Documentation generated");

  console.log("✅ All parallel operations completed!\n");
}

// ==============================================================================
// 8. UTILITY FUNCTION EXAMPLES
// ==============================================================================

async function utilityExamples(): Promise<void> {
  console.log("\n🛠️  Utility Function Examples\n");

  const startTime = Date.now();
  await wait(2345);

  // Format timing
  console.log(`⏱️  Elapsed time: ${formatSpinnerTiming(startTime)}`);
  console.log(`⏱️  Elapsed time (verbose): ${formatSpinnerTiming(startTime, { verbose: true })}`);

  // Format bytes
  const sizes = [1024, 1024 * 1024 * 1.5, 1024 * 1024 * 1024 * 2.3];
  for (const size of sizes) {
    console.log(`📦 Size: ${formatSpinnerBytes(size)}`);
  }

  // Format elapsed milliseconds directly
  console.log(`⚡ Operation took: ${formatSpinnerElapsed(2345)}`);
  console.log(`⚡ Operation took (verbose): ${formatSpinnerElapsed(2345, { verbose: true })}`);
}

// ==============================================================================
// 9. PROMISE INTEGRATION
// ==============================================================================

async function promiseIntegrationExamples(): Promise<void> {
  console.log("\n🤝 Promise Integration Examples\n");

  // Using withSpinnerPromise for existing promises
  const longRunningTask = new Promise<string>((resolve) => {
    setTimeout(() => resolve("Task completed successfully"), 2000);
  });

  await withSpinnerPromise(longRunningTask, {
    text: "Running long task",
    successText: "Long task finished",
    color: "blue",
  });

  // Using withSpinnerPromise with action function
  await withSpinnerPromise(
    async (spinner) => {
      spinner.text = "Phase 1: Initializing";
      await wait(800);
      spinner.text = "Phase 2: Processing";
      await wait(1200);
      spinner.text = "Phase 3: Finalizing";
      await wait(600);
      return "Multi-phase operation complete";
    },
    {
      text: "Multi-phase operation",
      successText: "All phases completed",
      color: "magenta",
    },
  );
}

// ==============================================================================
// MAIN FUNCTION - RUN ALL EXAMPLES
// ==============================================================================

async function main(): Promise<void> {
  console.log("🎡 DLER Spinner Examples with pretty-ms & pretty-bytes");
  console.log("=".repeat(60));

  try {
    await basicSpinnerExamples();
    await enhancedSpinnerExamples();
    await fileProgressExamples();
    await multiStepExamples();
    await transferExamples();
    await buildSpecificExamples();
    await spinnerGroupExamples();
    await utilityExamples();
    await promiseIntegrationExamples();

    console.log("\n💡 Key Features Demonstrated:");
    console.log("   • Pretty-ms integration for human-readable timing");
    console.log("   • Pretty-bytes integration for file size display");
    console.log("   • Progress tracking with percentages and rates");
    console.log("   • Multi-step operations with automatic progression");
    console.log("   • File transfer progress with rate monitoring");
    console.log("   • Concurrent spinner groups for parallel operations");
    console.log("   • Build-specific patterns with error handling");
    console.log("   • Enhanced spinners with custom methods");
    console.log("   • Promise integration for existing async operations");
  } catch (error) {
    console.error("❌ Error running spinner examples:", error);
    process.exit(1);
  }
}

// Run examples if this file is executed directly
if (import.meta.main) {
  await main();
}
