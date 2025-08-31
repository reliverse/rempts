import { re } from "@reliverse/relico";
import {
  colorize,
  createSpinner,
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
    name: "hooks",
    description: "hooks example",
  },
  async run() {
    await startPrompt({
      title: "Hooks Examples",
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

    // Example 1: Basic spinner with success/fail states
    const spinner = createSpinner({
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
    }).start();

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const isCorrect = answer === "Dec 4th, 1995";
    if (isCorrect) {
      spinner.succeed();
    } else {
      spinner.fail();
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

    // Example 2: Using the promise wrapper
    try {
      await withSpinnerPromise(
        async () => {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          const isCompanyCorrect = companyAnswer === "Netscape";
          if (!isCompanyCorrect) {
            throw new Error("Wrong answer!");
          }
        },
        {
          text: "Verifying your answer...",
          color: "yellow",
          spinner: "arc",
        },
      );
    } catch {
      process.exit(1);
    }

    // Example 3: Demonstrating different states
    const demoSpinner = createSpinner({
      text: "Preparing your prize...",
      color: "magenta",
      spinner: "bouncingBar",
    }).start();

    await new Promise((resolve) => setTimeout(resolve, 800));
    demoSpinner.warn("This might take a moment...");
    await new Promise((resolve) => setTimeout(resolve, 800));
    demoSpinner.info("Almost there...");
    await new Promise((resolve) => setTimeout(resolve, 800));
    demoSpinner.succeed("Done!");

    const message = "Congrats !\n $ 2 , 0 0 0 , 0 0 0";
    console.log(message);
    // await createAsciiArt({
    //   message,
    //   font: "Standard",
    // });

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
