import { execaCommand } from "execa";

import { version } from "./package.json";

let didPublish = false;

async function main() {
  const args = process.argv.slice(2);
  const isBuildOnly = args.includes("--build-only");

  if (isBuildOnly) {
    await build();
    return;
  }

  try {
    await build();
    await publishPackage();
    postPublish();
  } catch (error) {
    console.error("An error occurred during execution:", error);
    process.exit(1);
  }
}

async function build() {
  try {
    await execaCommand("bun unbuild && bun build.paths.ts", {
      stdio: "inherit",
    });
    console.log("✅ Build completed\n");
  } catch (error) {
    console.error("❌ Error during build:", error);
    throw error;
  }
}

async function publishPackage() {
  try {
    const proc = Bun.spawn(["bun", "publish", "--access", "public"], {
      stdout: "inherit",
      stderr: "pipe",
    });

    const stderr = await new Response(proc.stderr).text();

    await proc.exited;

    if (proc.exitCode !== 0) {
      if (
        stderr.includes("403 Forbidden") &&
        stderr.includes(
          "You cannot publish over the previously published versions",
        )
      ) {
        console.log(
          `${"⚠️".padEnd(3)} Version ${version} already exists on npm. Skipping publishing.`,
        );
      } else {
        console.error("❌ Error during publishing:", stderr);
        throw new Error("Publishing failed");
      }
    } else {
      didPublish = true;
    }
  } catch (error) {
    console.error("❌ An error occurred during publishing:", error);
    throw error;
  }
}

function postPublish() {
  if (didPublish) {
    console.log("\n│ https://npmjs.com/package/@reliverse/prompts");
  }
}

main().catch((error) => {
  console.error("❌ An error occurred:", error);
  process.exit(1);
});
