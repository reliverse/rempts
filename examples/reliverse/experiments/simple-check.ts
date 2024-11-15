// examples/simple-check.ts: A very basic example to check the library.

import {
  errorHandler,
  installDependencies,
} from "examples/reliverse/detailed-utils";

import { prompts } from "~/components/all-in-one";

async function main() {
  await prompts({
    type: "start",
    id: "setupStart",
    title: "Welcome to the Setup",
    titleColor: "cyan",
    titleVariant: "box",
    titleTypography: "bold",
    content: "Follow the steps to complete the configuration.",
    contentColor: "dim",
    contentVariant: "underline",
    contentTypography: "italic",
    variantOptions: { box: { limit: 50 } },
  });

  await prompts({
    type: "number",
    id: "userNumber",
    title: "Enter a number",
    titleColor: "blue",
    titleVariant: "doubleBox",
    titleTypography: "bold",
    content: "Please provide a number between 1 and 100.",
    contentColor: "dim",
    contentVariant: "underline",
    contentTypography: "italic",
    defaultValue: 50,
  });

  await installDependencies();
}

await main().catch((error) => errorHandler(error));
