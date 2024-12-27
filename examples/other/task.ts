import {
  inputPrompt,
  msg,
  selectPrompt,
  startPrompt,
  advancedTaskPrompt,
  endPrompt,
} from "~/main.js";
import { prompt } from "~/mono/mono.js";
import { colorize } from "~/utils/colorize.js";
import { errorHandler } from "~/utils/errors.js";
import { createAsciiArt } from "~/visual/ascii-art/ascii-art.js";

async function main() {
  console.clear();
  await startPrompt({
    title: "Task Component Example",
    titleColor: "passionGradient",
    titleTypography: "bold",
  });

  msg({
    type: "M_GENERAL",
    title: "Who Wants to Be a JS Mil?",
    titleColor: "gradientGradient",
  });

  msg({
    type: "M_GENERAL",
    symbol: "middle",
    title: `
    ${colorize("HOW TO PLAY", "white", "bold")} 
    I am a process on your computer.
    If you get any question wrong I will be ${colorize("killed", "red", "bold")}
    So get all the questions right...
  `,
  });

  const player_name = await inputPrompt({
    title: "What is your name?",
    defaultValue: "Player",
  });
  const playerName = player_name ?? "Player";

  const answer = await selectPrompt({
    title: "JavaScript was created in 10 days then released on",
    options: [
      { label: "May 23rd, 1995", value: "May 23rd, 1995" },
      { label: "Nov 24th, 1995", value: "Nov 24th, 1995" },
      { label: "Dec 4th, 1995", value: "Dec 4th, 1995" },
      { label: "Dec 17, 1996", value: "Dec 17, 1996" },
    ],
  });

  const firstResult = await advancedTaskPrompt.group(
    { priority: "normal" },
    (create) => [
      create(
        "Check answer",
        {
          priority: "normal",
          displayType: "spinner",
          spinnerType: "arc",
          exitProcessOnError: true,
        },
        async ({ setError }) => {
          const isCorrect = answer === "Dec 4th, 1995";

          if (!isCorrect) {
            setError(new Error(`🫠  Game over, ${playerName}! You lose!`));
            return false;
          }

          return `Nice work ${playerName}. That's a legit answer!`;
        },
      ),
    ],
  );

  if (firstResult[0].result) {
    const answer2 = await selectPrompt({
      title: "Which company created JavaScript?",
      options: [
        { label: "Microsoft", value: "Microsoft" },
        { label: "Netscape", value: "Netscape" },
        { label: "Oracle", value: "Oracle" },
        { label: "Google", value: "Google" },
      ],
    });

    const secondResult = await advancedTaskPrompt.group(
      { priority: "normal" },
      (create) => [
        create(
          "Validate answer",
          {
            priority: "normal",
            displayType: "spinner",
            spinnerType: "arc",
          },
          async ({ setError }) => {
            const isCorrect = answer2 === "Netscape";
            if (!isCorrect) {
              setError(
                new Error(`Wrong! Netscape created JavaScript in 1995.`),
              );
              return false;
            }
            return "Correct! Netscape created JavaScript.";
          },
        ),
      ],
    );

    if (secondResult[0].result === false) {
      msg({
        type: "M_GENERAL",
        title: "Game Over! You got the first one but missed the second.",
      });
      process.exit(1);
    }

    const message = `Congrats !\n $ 2 , 0 0 0 , 0 0 0`;

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
  } else {
    msg({ type: "M_GENERAL", title: "Better luck next time!" });
  }

  msg({ type: "M_BAR" });

  await endPrompt({
    title: "Thanks for playing!\n",
    titleColor: "passionGradient",
    titleTypography: "bold",
  });

  process.exit(0);
}

await main().catch((error) => errorHandler(error));
