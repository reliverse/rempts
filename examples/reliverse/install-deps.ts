// examples/install-deps.ts: An advanced example of a CLI application that installs dependencies.
// Trying to create a drop-in replacement for @clack/prompts, unjs/consola, @inquirer/prompts, withastro/astro, etc.

import { prompts } from "~/main";
import { colorize } from "~/utils/colorize";

async function main() {
  console.log();

  await prompts({
    id: "start",
    type: "start",
    title: "create-app",
    titleColor: "bgCyanBright",
    titleTypography: "bold",
  });

  const userInput = await prompts({
    id: "userInput",
    type: "text",
    title: "Please enter your username",
    titleColor: "blue",
    titleTypography: "bold",
    message: "Your username will be used to identify you in the system.\n",
    msgTypography: "pulse",
    validate: (input) => input.length > 0 || "Username cannot be empty.",
  });

  const dir = await prompts({
    id: "dir",
    type: "text",
    title: "Where should we create your project?",
    default: "./sparkling-solid",
  });

  await prompts({
    type: "end",
    id: "end",
    title: `Problems? ${colorize("https://github.com/blefnk/reliverse/prompts", "cyanBright")}`,
  });

  process.exit(0);
}

await main().catch((error) => {
  console.error("│  An error occurred:\n", error.message);
  console.error(
    "└  Please report this issue at https://github.com/blefnk/reliverse/issues",
  );
  process.exit(1);
});
