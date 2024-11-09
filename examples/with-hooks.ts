import type { ReadReli } from "experimental/hooks/type";

import { withHooks } from "experimental/hooks/hook-engine";
import readline from "node:readline";

import { prompts } from "~/main";
import { colorize } from "~/utils/colorize";

async function main() {
  console.clear();

  const rl = readline.createInterface(
    {
      // @ts-expect-error TODO: fix ts
      input: process.stdin,
      output: process.stdout,
    },
    {
      output: process.stdout,
      input: process.stdin,
      clearLine: () => {},
    },
  );

  await withHooks(rl as unknown as ReadReli, async (cycle) => {
    cycle(async () => {
      await prompts({
        id: "start",
        type: "start",
        title: "create-app",
        titleColor: "bgCyanBright",
        titleTypography: "bold",
        state: "initial",
      });

      await prompts({
        type: "text",
        id: "userInput",
        title: "Please enter your username",
        titleColor: "blue",
        titleTypography: "bold",
        message: "Your username will be used to identify you in the system.\n",
        msgTypography: "pulse",
        state: "initial",
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
    });
  });

  rl.close();
  process.exit(0);
}

await main().catch((error) => {
  console.error("│  An error occurred:\n", error.message);
  console.error(
    "└  Please report this issue at https://github.com/blefnk/reliverse/issues",
  );
  process.exit(1);
});
