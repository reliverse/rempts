// examples/install-deps.ts: An advanced example of a CLI application that installs dependencies.
// Trying to create a drop-in replacement for @clack/prompts, unjs/consola, @inquirer/prompts, etc.

import figlet from "figlet";

import { prompts } from "~/main";
import { endPrompt } from "~/ui/end";

import { handleAnswer } from "./utils/handleAnswer";

async function main() {
  console.clear();

  await prompts({
    id: "start",
    type: "start",
    title: "create-app",
    titleColor: "bgCyanBright",
    titleTypography: "bold",
  });

  const dir = await prompts({
    id: "dir",
    type: "text",
    title: "Where should we create your project?",
    default: "./sparkling-solid",
  });

  const { answer } = await prompts({
    type: "select",
    id: "answer",
    title: "JavaScript was created in 10 days then released on",
    choices: [
      { title: "May 23rd, 1995", value: "May 23rd, 1995" },
      { title: "Nov 24th, 1995", value: "Nov 24th, 1995" },
      { title: "Dec 4th, 1995", value: "Dec 4th, 1995" },
      { title: "Dec 17, 1996", value: "Dec 17, 1996" },
    ],
  });
  await handleAnswer(
    answer === "Dec 4th, 1995",
    `Nice work ${dir}. That's a legit answer!`,
    `💀💀💀 Game over, you lose ${dir}!`,
  );

  const message = `Congrats , ${dir} !\n $ 1 , 0 0 0 , 0 0 0`;
  const asciiArt = figlet.textSync(message);
  await endPrompt({
    type: "end",
    id: "winner",
    title: asciiArt,
    titleTypography: "gradient",
    message: `
      Programming isn't about what you know; 
      it's about making the command line look cool!
    `,
    msgColor: "green",
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
