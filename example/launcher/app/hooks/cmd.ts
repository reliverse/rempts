import { useSpinner } from "~/hooks/spinner/spinner-mod.js";
import {
  defineCommand,
  colorize,
  createAsciiArt,
  msg,
  endPrompt,
  inputPrompt,
  selectPrompt,
  startPrompt,
} from "~/mod.js";

export default defineCommand({
  meta: {
    name: "hooks",
    description: "hooks example",
  },
  async run() {
    await startPrompt({
      title: "Hooks Example",
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

    // --- Spinner demo using useSpinner ---
    const spinner = useSpinner({ text: "Checking your answer..." }).start();
    await new Promise((resolve) => setTimeout(resolve, 1200));
    const isCorrect = answer === "Dec 4th, 1995";
    if (isCorrect) {
      spinner.setText(`Nice work ${playerName}. That's a legit answer!`);
      await new Promise((resolve) => setTimeout(resolve, 600));
      spinner.stop();
      msg({
        type: "M_INFO",
        title: `Nice work ${playerName}. That's a legit answer!`,
        titleColor: "cyan",
      });
    } else {
      spinner.setText(`🫠  Game over, ${playerName}! You lose!`);
      await new Promise((resolve) => setTimeout(resolve, 600));
      spinner.stop();
      msg({
        type: "M_ERROR",
        title: `🫠  Game over, ${playerName}! You lose!`,
        titleColor: "red",
      });
      process.exit(1);
    }

    const companyAnswer = await selectPrompt({
      title: "Which company created JavaScript?",
      options: [
        { label: "Microsoft", value: "Microsoft" },
        { label: "Netscape", value: "Netscape" },
        { label: "Mozilla", value: "Mozilla" },
        { label: "Google", value: "Google" },
      ],
    });

    // --- Spinner demo using useSpinner for company question ---
    const spinner2 = useSpinner({
      text: "Which company created JavaScript?",
    }).start();
    await new Promise((resolve) => setTimeout(resolve, 1200));
    const isCompanyCorrect = companyAnswer === "Netscape";
    if (isCompanyCorrect) {
      spinner2.setText("Correct! Netscape created JavaScript.");
      await new Promise((resolve) => setTimeout(resolve, 600));
      spinner2.stop();
      msg({
        type: "M_INFO",
        title: "Correct! Netscape created JavaScript.",
        titleColor: "cyan",
      });
    } else {
      spinner2.setText("Wrong! Netscape created JavaScript.");
      await new Promise((resolve) => setTimeout(resolve, 600));
      spinner2.stop();
      msg({
        type: "M_ERROR",
        title: "Wrong! Netscape created JavaScript.",
        titleColor: "red",
      });
      process.exit(1);
    }

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
