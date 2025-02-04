// 2-mono-example.ts: A fun example of a quiz game. Inspired by CLI-game created by Fireship. The example demonstrates how to use a mono prompt() component.

import { msg } from "~/main.js";
import {
  animateText,
  inputPrompt,
  advancedTaskPrompt,
  endPrompt,
} from "~/main.js";
import { prompt } from "~/mono/mono.js";
import { colorize } from "~/utils/colorize.js";
import { errorHandler } from "~/utils/errors.js";
import { createAsciiArt } from "~/visual/ascii-art/ascii-art.js";

async function main() {
  console.clear();
  await prompt({
    type: "start",
    id: "welcome",
    title: "Mono Component Example",
    titleColor: "passionGradient",
    titleTypography: "bold",
  });

  await animateText({
    title: "Who Wants to Be a JS Mil?",
    anim: "rainbow",
    titleColor: "gradientGradient",
  });

  console.log(`
    ${colorize("HOW TO PLAY", "white", "bold")} 
    I am a process on your computer.
    If you get any question wrong I will be ${colorize("killed", "red", "bold")}
    So get all the questions right...
  `);

  const player_name = await inputPrompt({
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

  /* await advancedTaskPrompt({
    initialMessage: "Checking answer...",
    successMessage: "Answer checked successfully.",
    spinnerSolution: "ora",
    spinnerType: "arc",
    action: async (updateMessage) => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      updateMessage(
        answer === "Dec 4th, 1995"
          ? `Nice work ${playerName}. That's a legit answer!`
          : `🫠  Game over, ${playerName}! You lose!`,
      );
      await new Promise((resolve) => setTimeout(resolve, 1000));
    },
  }); */

  const result = await advancedTaskPrompt(
    "Check answer",
    {
      priority: "normal",
      displayType: "progress",
    },
    async ({ setStatus, setError, setProgress }) => {
      setProgress({
        current: 0,
        total: 5,
        message: "Starting verification...",
      });
      await new Promise((resolve) => setTimeout(resolve, 500));

      for (let i = 0; i < 5; i++) {
        setProgress({
          current: i + 1,
          total: 5,
          message: `Step ${i + 1}: Verifying answer...`,
        });
        await new Promise((resolve) => setTimeout(resolve, 400));
      }

      const isCorrect = answer === "Dec 4th, 1995";

      if (!isCorrect) {
        setError(
          `🫠  Game over, ${playerName}! You lose!\nNo worries, you can try again!`,
        );
        // Wait a bit to ensure the message is displayed
        await new Promise((resolve) => setTimeout(resolve, 100));
        process.exit(1);
      }

      setStatus(`Nice work ${playerName}. That's a legit answer!`);
      return isCorrect;
    },
  );

  if (!result) {
    return;
  }

  const message = "Congrats !\n $ 1 , 0 0 0 , 0 0 0";

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

  msg({ type: "M_BAR" });

  await endPrompt({
    title: "Thanks for playing!\n",
    titleColor: "passionGradient",
    titleTypography: "bold",
  });

  process.exit(0);
}

await main().catch((error) => errorHandler(error));
