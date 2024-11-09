import type { InquirerReadline } from "examples/inquirer/src/type/inquirer";

import { withHooks } from "examples/inquirer/src/hooks/hook-engine";
import readline from "node:readline";

import { prompts } from "~/main";
import { colorize } from "~/utils/colorize";

async function main() {
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

  // eslint-disable-next-line @typescript-eslint/require-await
  await withHooks(rl as unknown as InquirerReadline, async (cycle) => {
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
