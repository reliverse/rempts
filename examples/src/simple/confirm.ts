import relinka from "@reliverse/relinka";
import * as url from "node:url";

import { confirm } from "~/components/prompts/index.js";

const demo = async () => {
  relinka.log(
    "Answer:",
    await confirm({
      message: "Confirm?",
    }),
  );

  relinka.log(
    "Answer:",
    await confirm({
      message: "Confirm with default to no?",
      default: false,
    }),
  );

  relinka.log(
    "Answer:",
    await confirm({
      message: "Confirm with your custom transformer function?",
      transformer: (answer) => (answer ? "👍" : "👎"),
    }),
  );

  relinka.log("This next prompt will be cleared on exit");
  relinka.log(
    "Cleared prompt answer:",
    await confirm({ message: "Confirm?" }, { clearPromptOnDone: true }),
  );
};

if (import.meta.url.startsWith("file:")) {
  const modulePath = url.fileURLToPath(import.meta.url);
  if (process.argv[1] === modulePath) {
    await demo();
  }
}

export default demo;
