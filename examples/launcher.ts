import pc from "picocolors";

import { errorHandler, selectPrompt } from "~/main.js";

import { showStartPrompt } from "./src/prompts.js";

async function examplesRunner() {
  await showStartPrompt();

  const exampleToRun = await selectPrompt({
    title: "Choose an example to run",
    titleColor: "passionGradient",
    options: [
      {
        label: "✨ Full-Featured Example",
        value: "main",
        hint: "recommended",
      },
      {
        label: "Spinner Example",
        value: "spinner",
        hint: "experimental",
      },
      {
        label: pc.dim("Task Example"),
        value: "task",
        hint: pc.dim("not finished"),
      },
      {
        label: pc.dim("Progressbar Example"),
        value: "progressbar",
        hint: pc.dim("not finished"),
      },
      {
        label: pc.dim("Simple Example"),
        value: "simple",
        hint: pc.dim("not finished"),
      },
      {
        label: pc.dim("with flags 1 Example"),
        value: "cmd-a",
        hint: pc.dim("not finished"),
      },
      {
        label: pc.dim("with flags 2 Example"),
        value: "cmd-b",
        hint: pc.dim("not finished"),
      },
      { label: "🗝️  Exit", value: "exit" },
    ] as const,
    defaultValue: "main",
  });

  switch (exampleToRun) {
    case "main":
      await import("./main.js");
      break;
    case "spinner":
      await import("./other/spinner.js");
      break;
    case "task":
      await import("./other/task.js");
      break;
    case "progressbar":
      await import("./other/progress.js");
      break;
    case "simple":
      await import("./other/simple.js");
      break;
    case "cmd-a":
      console.clear();
      console.log(
        "`bun examples/other/args-a.ts Alice --friendly --age 22 --adj cool`",
      );
      console.log("Run without any arguments to see the help message.");
      break;
    case "cmd-b":
      console.clear();
      console.log(
        "1. [BUILD] `bun examples/other/args-b.ts build ./src --workDir ./src`",
      );
      console.log(
        "2. [DEBUG] `bun examples/other/args-b.ts debug --feature database-query`",
      );
      console.log(
        "3. [DEPLOY] `bun examples/other/args-b.ts deploy --include '*.js' --exclude '*.d.ts'`",
      );
      console.log("Run without any arguments to see the help message.");
      break;
    default:
      break;
  }
}

await examplesRunner().catch((error) => errorHandler(error));
