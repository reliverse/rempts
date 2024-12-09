import pc from "picocolors";

import { errorHandler, selectPrompt } from "~/main.js";
import { preventWrongTerminalSize } from "~/utils/prevent.js";

async function examplesRunner() {
  console.clear();
  await preventWrongTerminalSize({});

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
        label: pc.dim("Simple Example"),
        value: "3-simple",
        hint: pc.dim("not finished"),
      },
      {
        label: pc.dim("with flags 1 Example"),
        value: "4-cmd-a",
        hint: pc.dim("not finished"),
      },
      {
        label: pc.dim("with flags 2 Example"),
        value: "5-cmd-b",
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
    case "3-simple":
      await import("./3-simple.js");
      break;
    case "4-cmd-a":
      console.clear();
      console.log(
        "`bun examples/4-args-a.ts Alice --friendly --age 22 --adj cool`",
      );
      console.log("Run without any arguments to see the help message.");
      break;
    case "5-cmd-b":
      console.clear();
      console.log(
        "1. [BUILD] `bun examples/5-args-b.ts build ./src --workDir ./src`",
      );
      console.log(
        "2. [DEBUG] `bun examples/5-args-b.ts debug --feature database-query`",
      );
      console.log(
        "3. [DEPLOY] `bun examples/5-args-b.ts deploy --include '*.js' --exclude '*.d.ts'`",
      );
      console.log("Run without any arguments to see the help message.");
      break;
    default:
      break;
  }
}

await examplesRunner().catch((error) => errorHandler(error));
