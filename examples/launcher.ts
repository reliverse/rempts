import { dim } from "picocolors";

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
        label: dim("Mono Component Example"),
        value: "2-mono",
        hint: dim("not finished"),
      },
      {
        label: dim("@reliverse/relinka Example"),
        value: "3-relinka",
        hint: dim("not finished"),
      },
      {
        label: dim("Simple Example"),
        value: "4-simple",
        hint: dim("not finished"),
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
    default:
      break;
  }
}

await examplesRunner().catch((error) => errorHandler(error));
