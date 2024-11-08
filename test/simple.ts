import { numberPrompt } from "~/components/number";
import { startPrompt } from "~/components/start";

import { installDependencies } from "./utils/installDependencies";

async function main() {
  await startPrompt({
    type: "start",
    id: "setupStart",
    title: "Welcome to the Setup",
    titleColor: "cyan",
    titleVariant: "box",
    titleTypography: "bold",
    message: "Follow the steps to complete the configuration.",
    msgColor: "dim",
    msgVariant: "underline",
    msgTypography: "italic",
    variantOptions: { box: { limit: 50 } },
  });

  await numberPrompt({
    type: "number",
    id: "userNumber",
    title: "Enter a number",
    titleColor: "blue",
    titleVariant: "doubleBox",
    titleTypography: "bold",
    message: "Please provide a number between 1 and 100.",
    msgColor: "dim",
    msgVariant: "underline",
    msgTypography: "italic",
    default: 50,
  });

  await installDependencies();
}

await main().catch((error) => {
  console.error("│  An error occurred:\n", error.message);
  console.error(
    "└  Please report this issue at https://github.com/blefnk/reliverse/issues",
  );
  process.exit(1);
});
