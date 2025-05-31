import {
  defineCommand,
  colorize,
  createAsciiArt,
  msg,
  useSpinner,
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
    const spinner = useSpinner({
      text: "Checking your answer...",
      color: "cyan",
      spinner: "dots",
      successText: `Nice work ${playerName}. That's a legit answer!`,
      failText: `🫠  Game over, ${playerName}! You lose!`,
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
      await useSpinner.promise(
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
          successText: "Correct! Netscape created JavaScript.",
          failText: "Wrong! Netscape created JavaScript.",
        },
      );
    } catch {
      process.exit(1);
    }

    // Example 3: Demonstrating different states
    const demoSpinner = useSpinner({
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
