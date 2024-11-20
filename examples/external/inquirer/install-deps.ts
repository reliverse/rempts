import type { InquirerReadline } from "@/external/inquirer/src/type/inquirer.js";

import { withHooks } from "@/external/inquirer/src/hooks/hook-engine.js";
import { errorHandler } from "~/utils/errors.js";
import readline from "node:readline";

import { prompt } from "~/components/mono.js";
import { colorize } from "~/utils/colorize.js";

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

  await withHooks(rl as unknown as InquirerReadline, async (cycle) => {
    cycle(async () => {
      await prompt({
        id: "start",
        type: "start",
        title: "create-app",
        titleColor: "bgCyanBright",
        titleTypography: "bold",
      });

      await prompt({
        type: "text",
        id: "userInput",
        title: "Please enter your username",
        titleColor: "blue",
        titleTypography: "bold",
        content: "Your username will be used to identify you in the system.\n",
        contentTypography: "bold",
        validate: (input) => input.length > 0 || "Username cannot be empty.",
      });

      const dir = await prompt({
        id: "dir",
        type: "text",
        title: "Where should we create your project?",
        defaultValue: "./sparkling-solid",
      });

      await prompt({
        type: "end",
        id: "end",
        title: `Problems? ${colorize("https://github.com/blefnk/reliverse/prompts", "cyanBright")}`,
      });
    });
  });

  rl.close();
  process.exit(0);
}

await main().catch((error) => errorHandler(error));
