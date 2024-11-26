import relinka from "@reliverse/relinka";
import { command } from "execa";
import mri from "mri";

function showHelp() {
  relinka.info(`Usage: bun build.pub.ts [options]

Options:
  no options      Publish to npm registry
  --jsr           Publish to JSR registry
  --dry-run       Perform a dry run of the publish process
  -h, --help      Show help
`);
}

const argv = mri(process.argv.slice(2), {
  alias: {
    h: "help",
  },
  boolean: ["jsr", "dry-run", "help"],
  default: {
    jsr: false,
    "dry-run": false,
    help: false,
  },
});

// If help flag is present, display help and exit
if (argv.help) {
  showHelp();
  process.exit(0);
}

// Handle flags
const validFlags = ["jsr", "dry-run", "help", "h"];
const unknownFlags = Object.keys(argv).filter(
  (key) => !validFlags.includes(key) && key !== "_",
);

if (unknownFlags.length > 0) {
  relinka.error(`❌ Unknown flag(s): ${unknownFlags.join(", ")}`);
  showHelp();
  process.exit(1);
}

async function publishNpm(dryRun: boolean) {
  try {
    if (dryRun) {
      await command("bun publish --dry-run", { stdio: "inherit" });
    } else {
      await command("bun build:npm", { stdio: "inherit" });
      await command("bun publish", { stdio: "inherit" });
    }
    relinka.success("Published to npm successfully.");
  } catch (error) {
    relinka.error("❌ Failed to publish to npm:", error);
    process.exit(1);
  }
}

async function publishJsr(dryRun: boolean) {
  try {
    if (dryRun) {
      await command(
        "bunx jsr publish --allow-slow-types --allow-dirty --dry-run",
        { stdio: "inherit" },
      );
    } else {
      await command("bun build:jsr", { stdio: "inherit" });
      await command("bunx jsr publish --allow-slow-types --allow-dirty", {
        stdio: "inherit",
      });
    }
    relinka.success("Published to JSR successfully.");
  } catch (error) {
    relinka.error("❌ Failed to publish to JSR:", error);
    process.exit(1);
  }
}

async function main() {
  const { jsr, "dry-run": dryRun } = argv;
  if (jsr) {
    await publishJsr(dryRun);
  } else {
    await publishNpm(dryRun);
  }
}

main().catch((error) => {
  relinka.error("❌ An unexpected error occurred:", error);
  process.exit(1);
});
