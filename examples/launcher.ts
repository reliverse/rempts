import relinka from "@reliverse/relinka";
import pc from "picocolors";

import { errorHandler, selectPrompt } from "~/main.js";

async function examplesRunner() {
  console.clear();
  const exampleToRun = await selectPrompt({
    title: "Choose an example to run",
    options: [
      {
        label: "✨ The Most Full-Featured Example",
        value: "1-main",
        hint: "recommended",
      },
      {
        label: pc.dim("Mono Component Example"),
        value: "2-mono",
        hint: pc.dim("not finished"),
      },
      {
        label: pc.dim("@reliverse/relinka Example"),
        value: "3-relinka",
        hint: pc.dim("not finished"),
      },
      {
        label: pc.dim("Simple Example"),
        value: "4-simple",
        hint: pc.dim("not finished"),
      },
      {
        label: pc.dim("with flags 1 Example"),
        value: "5-cmd-a",
        hint: pc.dim("not finished"),
      },
      {
        label: pc.dim("with flags 2 Example"),
        value: "6-cmd-b",
        hint: pc.dim("not finished"),
      },
      { label: "🗝️  Exit", value: "exit" },
    ] as const,
    defaultValue: "1-main",
  });

  switch (exampleToRun) {
    case "1-main":
      await import("./1-main.js");
      break;
    case "2-mono":
      await import("./2-mono.js");
      break;
    case "3-relinka":
      await import("./3-relinka.js");
      break;
    case "4-simple":
      await import("./4-simple.js");
      break;
    case "5-cmd-a":
      console.clear();
      relinka.info(
        "`bun examples/5-args-a.ts Alice --friendly --age 22 --adj cool`",
      );
      relinka.info("Run without any arguments to see the help message.");
      break;
    case "6-cmd-b":
      console.clear();
      relinka.info(
        "1. [BUILD] `bun examples/6-args-b.ts build ./src --workDir ./src`",
      );
      relinka.info(
        "2. [DEBUG] `bun examples/6-args-b.ts debug --feature database-query`",
      );
      relinka.info(
        "3. [DEPLOY] `bun examples/6-args-b.ts deploy --include '*.js' --exclude '*.d.ts'`",
      );
      relinka.info("Run without any arguments to see the help message.");
      break;
    default:
      break;
  }
}

await examplesRunner().catch((error) => errorHandler(error));
