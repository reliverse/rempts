import { relinka } from "@reliverse/relinka";

import {
  defineCommand,
  colorize,
  createAsciiArt,
  msg,
  taskSpinPrompt,
  endPrompt,
  inputPrompt,
  selectPrompt,
  startPrompt,
} from "~/mod.js";

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

    await taskSpinPrompt({
      initialMessage: "Checking your answer...",
      successMessage: `Nice work ${playerName}. That's a legit answer!`,
      errorMessage: `🫠  Game over, ${playerName}! You lose!`,
      delay: 100,
      spinnerSolution: "ora",
      spinnerType: "arc",
      action: async (updateMessage) => {
        const isCorrect = answer === "Dec 4th, 1995";
        if (!isCorrect) {
          updateMessage(`🫠  Game over, ${playerName}! You lose!`);
          process.exit(1);
        }
      },
    });

    const companyAnswer = await selectPrompt({
      title: "Which company created JavaScript?",
      options: [
        { label: "Microsoft", value: "Microsoft" },
        { label: "Netscape", value: "Netscape" },
        { label: "Mozilla", value: "Mozilla" },
        { label: "Google", value: "Google" },
      ],
    });

    await taskSpinPrompt({
      initialMessage: "Which company created JavaScript?",
      successMessage: "Correct! Netscape created JavaScript.",
      errorMessage: "Wrong! Netscape created JavaScript.",
      delay: 100,
      spinnerSolution: "ora",
      spinnerType: "arc",
      action: async (updateMessage) => {
        const isCorrect = companyAnswer === "Netscape";
        if (!isCorrect) {
          updateMessage("Wrong answer!");
          process.exit(1);
        }
      },
    });

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
