import { re } from "@reliverse/relico";
import { isBunRuntime } from "@reliverse/runtime";

import { selectPrompt } from "~/main.js";
import { errorHandler } from "~/main.js";

import { showStartPrompt } from "./e-src/e-main/prompts.js";

async function examplesRunner() {
  await showStartPrompt();

  const exampleToRun = await selectPrompt({
    title: "Choose an example to run",
    displayInstructions: true,
    options: [
      {
        label: "✨ Full-Featured",
        value: "main",
        hint: "recommended",
      },
      {
        label: re.dim("Spinner"),
        value: "spinner",
        hint: re.dim("not finished"),
      },
      {
        label: re.dim("Task"),
        value: "task",
        hint: re.dim("not finished"),
      },
      {
        label: re.dim("Progressbar"),
        value: "progressbar",
        hint: re.dim("not finished"),
      },
      {
        label: re.dim("Simple"),
        value: "simple",
        hint: re.dim("not finished"),
      },
      {
        label: re.dim("with flags 1"),
        value: "cmd-a",
        hint: re.dim("not finished"),
      },
      {
        label: re.dim("with flags 2"),
        value: "cmd-b",
        hint: re.dim("not finished"),
      },
      { label: "🗝️  Exit", value: "exit" },
    ] as const,
    shouldStream: !isBunRuntime(),
    streamDelay: 20,
    defaultValue: "main",
  });

  switch (exampleToRun) {
    case "main":
      await import("./e-main.js");
      break;
    case "spinner":
      await import("./e-src/e-other/spinner.js");
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
