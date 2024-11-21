// 2-mono-example.ts: A fun example of a quiz game. Inspired by CLI-game created by Fireship. The example demonstrates how to use a mono prompt() component.

import { createAsciiArt } from "~/unsorted/components/ascii-art";
import { prompt } from "~/unsorted/components/mono";
import { spinnerPrompts } from "~/unsorted/components/spinner";
import { colorize } from "~/unsorted/utils/colorize";
import { errorHandler } from "~/unsorted/utils/errors";

async function main() {
  await prompt({
    type: "start",
    id: "welcome",
    title: "Who Wants to Be a JS Mil?",
    titleColor: "gradientGradient",
    titleTypography: "bold",
    titleVariant: "animated",
  });
  console.log(`
    ${colorize("HOW TO PLAY", "white", "bold")} 
    I am a process on your computer.
    If you get any question wrong I will be ${colorize("killed", "red", "bold")}
    So get all the questions right...
  `);

  const player_name = await prompt({
    type: "text",
    id: "player_name",
    title: "What is your name?",
    defaultValue: "Player",
  });
  // TODO: fix [object object]
  const playerName = player_name ?? "Player";

  const { answer } = await prompt({
    type: "numSelect",
    id: "answer",
    title: "JavaScript was created in 10 days then released on",
    choices: [
      { title: "May 23rd, 1995", id: "May 23rd, 1995" },
      { title: "Nov 24th, 1995", id: "Nov 24th, 1995" },
      { title: "Dec 4th, 1995", id: "Dec 4th, 1995" },
      { title: "Dec 17, 1996", id: "Dec 17, 1996" },
    ],
  });

  await spinnerPrompts({
    initialMessage: "Checking answer...",
    successMessage: "Answer checked successfully.",
    spinnerSolution: "ora",
    spinnerType: "arc",
    action: async (updateMessage) => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      updateMessage(
        answer === "Dec 4th, 1995"
          ? `Nice work ${playerName}. That's a legit answer!`
          : `🫠 Game over, ${playerName}! You lose!`,
      );
      await new Promise((resolve) => setTimeout(resolve, 1000));
    },
  });

  const message = `Congrats !\n $ 1 , 0 0 0 , 0 0 0`;

  await createAsciiArt({
    message,
    font: "Standard",
  });

  await prompt({
    type: "end",
    id: "winner",
    title: `
      Programming isn't about what you know; 
      it's about making the command line look cool!`,
    titleColor: "bgCyanBright",
    titleTypography: "bold",
    border: false,
  });
  process.exit(0);
}

await main().catch((error) => errorHandler(error));
