// examples/win-mln-js.ts: A fun example of a quiz game. Inspired by CLI-game created by Fireship.

import figlet from "figlet";

import { prompts } from "~/main";
import { colorize } from "~/utils/colorize";
import { BAR, BAR_END } from "~/utils/states";

import { handleAnswer } from "./experiments/utils/handleAnswer";

async function main() {
  await prompts({
    type: "start",
    id: "welcome",
    title: "Who Wants To Be A JavaScript Millionaire?",
    titleTypography: "rainbow", // Animated rainbow text
    titleVariant: "animated",
  });
  console.log(`
    ${colorize("HOW TO PLAY", "white", "bold")} 
    I am a process on your computer.
    If you get any question wrong I will be ${colorize("killed", "red", "bold")}
    So get all the questions right...
  `);

  const player_name = await prompts({
    type: "text",
    id: "player_name",
    title: "What is your name?",
    default: "Player",
  });
  // TODO: fix [object object]
  const playerName = String(player_name) ?? "Player";

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
    `Nice work ${playerName}. That's a legit answer!`,
    `💀💀💀 Game over, you lose ${playerName}!`,
  );

  const message = `Congrats , ${playerName} !\n $ 1 , 0 0 0 , 0 0 0`;
  const asciiArt = figlet.textSync(message);
  await prompts({
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
  console.error(`${BAR} An error occurred:\n`, error.message);
  console.error(
    `${BAR_END} Please report this issue at https://github.com/blefnk/reliverse/issues`,
  );
  process.exit(1);
});
