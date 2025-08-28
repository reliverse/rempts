import { re } from "@reliverse/relico";
import { relinka } from "@reliverse/relinka";

import {
  colorize,
  createAsciiArt,
  defineCommand,
  endPrompt,
  inputPrompt,
  msg,
  selectPrompt,
  startPrompt,
  withSpinnerPromise,
} from "~/mod";

export default defineCommand({
  meta: {
    name: "spinner",
    description: "spinner example",
  },
  async run() {
    relinka("clear", "");

    await startPrompt({
      title: "Spinner Component Example",
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

    await withSpinnerPromise(
      async () => {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const isCorrect = answer === "Dec 4th, 1995";
        if (!isCorrect) {
          throw new Error(`🫠  Game over, ${playerName}! You lose!`);
        }
      },
      {
        text: `Checking your answer, ${playerName}...`,
        color: "cyan",
        spinner: "dots",
        successColor: "green",
        failColor: "red",
        theme: {
          info: re.cyan,
          success: re.green,
          error: re.red,
        },
      },
    );

    const companyAnswer = await selectPrompt({
      title: "Which company created JavaScript?",
      options: [
        { label: "Microsoft", value: "Microsoft" },
        { label: "Netscape", value: "Netscape" },
        { label: "Mozilla", value: "Mozilla" },
        { label: "Google", value: "Google" },
      ],
    });

    await withSpinnerPromise(
      async () => {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const isCorrect = companyAnswer === "Netscape";
        if (!isCorrect) {
          throw new Error("Wrong answer!");
        }
      },
      {
        text: "Which company created JavaScript?",
        color: "cyan",
        spinner: "dots",
        successColor: "green",
        failColor: "red",
        theme: {
          info: re.cyan,
          success: re.green,
          error: re.red,
        },
      },
    );

    const message = "Congrats !\n $ 2 , 0 0 0 , 0 0 0";

    await createAsciiArt({
      message,
      font: "Standard",
    });

    await endPrompt({
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
  },
});
