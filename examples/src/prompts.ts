import { detect } from "detect-package-manager";
import { emojify } from "node-emoji";
import pc from "picocolors";

import { anykeyPrompt } from "~/main.js";
import { multiselectPrompt } from "~/main.js";
import { progressbar } from "~/main.js";
import {
  animateText,
  confirmPrompt,
  datePrompt,
  endPrompt,
  msg,
  numMultiSelectPrompt,
  nextStepsPrompt,
  numberPrompt,
  passwordPrompt,
  startPrompt,
  inputPrompt,
  togglePrompt,
} from "~/main.js";
import { promptsDisplayResults } from "~/main.js";
import { numSelectPrompt } from "~/main.js";
import { selectPrompt } from "~/main.js";
import { spinner } from "~/main.js";

import { basicConfig, experimentalConfig, extendedConfig } from "./configs.js";
import {
  calculateAge,
  createColorChoices,
  displayUserInputs,
  hashPassword,
  validateAge,
} from "./utils.js";

// import packageJson from "../../package.json" with { type: "json" };
// const pkg = packageJson;
const pkg = {
  name: "@reliverse/prompts",
  version: "1.3.13",
  description:
    "@reliverse/prompts is a powerful library that enables seamless, typesafe, and resilient prompts for command-line applications. Crafted with simplicity and elegance, it provides developers with an intuitive and robust way to build interactive CLIs.",
};

const IDs = {
  start: "start",
  username: "username",
  dir: "dir",
  spinner: "spinner",
  password: "password",
  age: "age",
  lang: "lang",
  color: "color",
  birthday: "birthday",
  features: "features",
};

export async function showStartPrompt() {
  await startPrompt({
    ...basicConfig,
    // startPrompt is a special component: if you don't provide
    // a title, it will display the useful technical information
    titleColor: "inverse",
    clearConsole: true,
    packageName: pkg.name,
    packageVersion: pkg.version,
  });
}

export async function showAnykeyPrompt(
  kind: "pm" | "privacy",
  username?: string,
) {
  const pm = await detect();
  let notification = pc.bold("[anykeyPrompt] Press any key to continue...");
  if (kind === "privacy") {
    notification = `Before you continue, please note that you are only testing an example CLI app.\n│  None of your responses will be sent anywhere. No actions, such as installing dependencies, will actually take place;\n│  this is simply a simulation with a sleep timer and spinner. You can always review the source code to learn more.\n│  ============================\n│  ${notification}`;
  }
  if (kind === "pm" && pm === "bun" && username) {
    notification += `\n│  ============================\n│  ${username}, did you know? Bun currently may crash if you press Enter while setTimeout\n│  is running. So please avoid doing that in the prompts after this one! 😅`;
  }
  await anykeyPrompt(notification);
}

export async function showInputPrompt() {
  const username = await inputPrompt({
    title: "We're glad you're testing our interactive prompts library!",
    content: "Let's get to know each other!\nWhat's your username?",
    hint: "Press <Enter> to use the default value.",
    placeholder: "[Default: johnny911]",
    defaultValue: "johnny911",
    ...extendedConfig,
    // hardcoded: { // For testing purposes only
    //   userInput: "JohnDoe", // Predefined user input
    //   errorMessage: "", // No error message
    //   linesRendered: 3, // Number of lines rendered
    //   showPlaceholder: false, // Do not show placeholder since input is provided
    // },
  });
  return username ?? "johnny911";
}

export async function askDir(username: string) {
  const dir = await inputPrompt({
    title: `[inputPrompt] Great! Nice to meet you, ${username}!`,
    content: "Where should we create your project?",
    // Schema is required, because it provides a runtime typesafety validation.
    ...extendedConfig,
    titleVariant: "doubleBox",
    hint: "Default: ./prefilled-default-value",
    defaultValue: "./prefilled-default-value",
  });
  return dir ?? "./prefilled-default-value";
}

export async function showNumberPrompt() {
  const age = await numberPrompt({
    ...extendedConfig,
    title: "[numberPrompt] Enter your age",
    // Adding a hint helps users understand the expected input format.
    hint: "Try: 42 | Default: 36",
    defaultValue: "36",
    // Define a schema to validate the input.
    // Errors are automatically handled and displayed based on the type.
    // Additional validation can be configured using the 'validate' option.
    validate: (value) => {
      const num = Number(value);
      if (num === 42) {
        return "42 is the answer to the ultimate question of life, the universe, and everything. Try a different number.";
      }
      return true;
    },
  });
  return age ?? 34;
}

export async function showPasswordPrompt() {
  // Initialize `passwordResult` to avoid uninitialized variable errors.
  let password = "silverHand2077";
  // Wrap password prompts with a try-catch block to handle cancellations,
  // which otherwise would terminate the process with an error.
  try {
    password = await passwordPrompt({
      title: "[passwordPrompt] Imagine a password",
      defaultValue: "silverHand2077",
      hint: "Default: silverHand2077",
      validate: (input) => {
        if (!/[A-Z]/.test(input)) {
          return "Password must be latin letters and contain at least one uppercase letter.";
        }
        return true;
      },
    });
  } catch (error) {
    msg({
      type: "M_ERROR",
      title: "Password prompt was aborted or something went wrong.",
    });
  }
  // We can set default values for missing responses, especially
  // for the cases when we allow the user to cancel the prompt.
  return password ?? "silverHand2077";
}

export async function showDatePrompt() {
  const birthdayDate = await datePrompt({
    dateKind: "birthday",
    dateFormat: "DD.MM.YYYY",
    title: "[datePrompt] Enter your birthday",
    hint: "Default: 16.11.1988",
    // You can set a default value for the prompt if desired.
    defaultValue: "16.11.1988",
  });
  return birthdayDate ?? "16.11.1988";
}

// Experimental alternative to showDatePrompt
export async function showDatePromptTwo() {
  const userDate = await datePrompt({
    title: "Enter your birthday",
    dateFormat: "DD.MM.YYYY | MM/DD/YYYY | YYYY.MM.DD",
    dateKind: "birthday",
    hint: "Please use one of the specified date formats.",
    validate: async (input: string) => {
      // Example custom validation: we ensure the year is not before 1900
      const parts = input.split(/[./-]/);
      let year: number;
      if (input.includes(".")) {
        if (input.split(".").length === 3 && input.includes("/")) {
          // Handle multiple separators if necessary
          year = Number(parts[2]);
        } else {
          year = Number(parts[2] || parts[3]);
        }
      } else if (input.includes("/")) {
        year = Number(parts[2]);
      } else {
        year = Number(parts[0]);
      }

      if (year && year < 1900) {
        return "Year must be 1900 or later.";
      }
      return true;
    },
    defaultValue: "01.01.2000",
  });

  console.log(`You entered: ${userDate}`);
}

export async function showSelectPrompt() {
  const lang = await selectPrompt({
    title: "[selectPrompt] Choose your language",
    content:
      "“You can have brilliant ideas, but if you can’t get them across, your ideas won’t get you anywhere.” – Lee Iacocca",
    options: [
      { label: "English", value: "en", hint: "Default" },
      { separator: true, width: 20, symbol: "line" },
      { label: "Ukrainian", value: "uk", hint: "Українська" },
      {
        label: "Dothraki",
        value: "dothraki",
        hint: "Dothraki",
        disabled: true,
      },
      { label: "Polish", value: "pl", hint: "Polski" },
      { label: "French", value: "fr", hint: "Français" },
      { label: "German", value: "de", hint: "Deutsch" },
      { label: "Spanish", value: "es", hint: "Español" },
      { label: "Italian", value: "it", hint: "Italiano" },
      { label: "Other", value: "other", hint: "Other" },
    ],
    defaultValue: "en",
    ...experimentalConfig,
    // @reliverse/prompts is a very young library, so something might break.
    // If you encounter any issues, please report them to the GitHub repository.
    // By using the debug, you can try to manually handle some of your issues.
    debug: false, // selectPrompt
  });

  switch (lang) {
    case "en":
      msg({ type: "M_INFO", title: "You selected English" });
      break;
    case "uk":
      msg({ type: "M_INFO", title: "Ви обрали українську" });
      break;
    case "dothraki":
      msg({
        type: "M_INFO",
        title: "You have unlocked the Dothraki language! Great job! 🎉",
      });
      break;
    case "pl":
      msg({ type: "M_INFO", title: "Wybrałeś język polski" });
      break;
    case "fr":
      msg({ type: "M_INFO", title: "Vous avez choisi le français" });
      break;
    case "de":
      msg({
        type: "M_INFO",
        title: "Sie haben die deutsche Sprache ausgewählt",
      });
      break;
    case "es":
      msg({ type: "M_INFO", title: "Has elegido el español" });
      break;
    case "it":
      msg({ type: "M_INFO", title: "Hai scelto l'italiano" });
      break;
    case "other":
      msg({ type: "M_INFO", title: "You selected Other" });
      break;
  }

  return lang;
}

export async function showMultiselectPrompt() {
  const jokes: Record<string, string> = {
    TypeScript:
      "- Why did TypeScript bring a type-checker to the party? Because it couldn't handle any loose ends!",
    JavaScript:
      "- Why was the JavaScript developer sad? Because he didn't Node how to Express himself.",
    CoffeeScript:
      "- Why do CoffeeScript developers always seem calm? Because they never have to deal with too much Java!",
    Python:
      "- Why do Python programmers prefer dark mode? Because light attracts bugs!",
    Java: "- Why do Java developers wear glasses? Because they don't C#.",
    CSharp:
      "- Why did the C# developer go broke? Because he used up all his cache.",
    Go: "- Why do Go programmers prefer the beach? Because they love to handle their goroutines!",
    Rust: "- Why did the Rust programmer never get lost? Because he always borrowed the right path.",
    Swift:
      "- Why did the Swift developer quit his job? Because he didn't like being optional!",
  };

  const multiselectOptions = await multiselectPrompt({
    title: "[multiselectPrompt] Select your favorite programming languages",
    content:
      "“Code is like humor. When you have to explain it, it’s bad.” – Cory House",
    options: [
      {
        label: "TypeScript",
        value: "TypeScript",
        hint: "💙 Type-safe and scalable",
      },
      {
        label: "JavaScript",
        value: "JavaScript",
        hint: "💛 Versatile and widely-used",
      },
      { separator: true, symbol: "pointer" },
      {
        label: "Pawn",
        value: "Pawn",
        hint: "🎮 Simple and easy to learn",
        disabled: true,
      },
      {
        label: "CoffeeScript",
        value: "CoffeeScript",
        hint: "☕ Elegant and concise",
      },
      {
        label: "Python",
        value: "Python",
        hint: "🐍 Powerful and easy to learn",
      },
      {
        label: "Java",
        value: "Java",
        hint: "🍵 Robust and portable",
      },
      {
        label: "CSharp",
        value: "CSharp",
        hint: "🔢 Modern and object-oriented",
      },
      { label: "Go", value: "Go", hint: "🐋 Simple and efficient" },
      { label: "Rust", value: "Rust", hint: "🦀 Fast and memory-safe" },
      {
        label: "Swift",
        value: "Swift",
        hint: "🐦 Safe and performant",
      },
      {
        label: "Other",
        value: "Other",
        hint: "Other",
      },
    ],
    required: true,
    defaultValue: ["TypeScript", "JavaScript"],
    ...experimentalConfig,
    debug: false, // multiselectPrompt
  });

  if (!Array.isArray(multiselectOptions)) {
    process.exit(0);
  }

  multiselectOptions.forEach((option) => {
    // By using forEach, @reliverse/prompts
    // has Intellisense to each selected option
    switch (option) {
      case "CoffeeScript":
        msg({
          type: "M_INFO",
          title: "CoffeeScript... 🤔",
          titleColor: "dim",
        });
        break;
      default:
        break;
    }
  });

  msg({
    type: "M_INFO",
    title: "Here are some dumb jokes for you:",
    titleTypography: "bold",
    titleColor: "viceGradient",
    addNewLineBefore: false,
    addNewLineAfter: false,
  });

  multiselectOptions.forEach((option) => {
    const joke = jokes[option];
    msg({
      type: "M_INFO_NULL",
      title: joke ? joke : `${option} selected.`,
      addNewLineBefore: false,
      addNewLineAfter: false,
    });
  });

  msg({
    type: "M_NEWLINE",
  });

  return multiselectOptions;
}

export async function showNumSelectPrompt() {
  const choices = createColorChoices();

  const color = await numSelectPrompt({
    title: "[numSelectPrompt] Choose your favorite color",
    content:
      "You are free to customize everything in your prompts using the following color palette.",
    ...extendedConfig,
    choices,
    defaultValue: "17",
    hint: "Default: 17",
  });

  return color.toString() ?? "red";
}

export async function showNumMultiselectPrompt() {
  const features = await numMultiSelectPrompt({
    title: "[numMultiSelectPrompt] What web technologies do you like?",
    defaultValue: ["react", "typescript"],
    choices: [
      {
        id: "react",
        title: "React",
        // Some properties, like 'choices.description', are optional.
        description: "A library for building user interfaces.",
      },
      {
        id: "typescript",
        title: "TypeScript",
        description:
          "A programming language that adds static typing to JavaScript.",
      },
      {
        id: "eslint",
        title: "ESLint",
        description: "A tool for identifying patterns in JavaScript code.",
      },
    ] as const,
  });
  return features ?? ["react", "typescript"];
}

export async function showTogglePrompt() {
  const result = await togglePrompt({
    title: "[togglePrompt] Do you like @reliverse/prompts library?",
    content:
      "You can share your thoughts with us here:\n- https://github.com/reliverse/prompts/issues \n- https://discord.gg/Pb8uKbwpsJ",
  });

  msg({
    type: "M_INFO",
    title: "Your response:",
    titleColor: "bgCyan",
    content: result ? "You like it! 🥰" : "You don't like it... 😔",
    contentColor: result ? "greenBright" : "redBright",
  });

  return result;
}

export async function showConfirmPrompt(username: string) {
  await showAnykeyPrompt("pm", username);

  const spinner = await confirmPrompt({
    title: "[confirmPrompt] Do you want to see spinner in action?",
    // Intellisense will show you all available colors thanks to the enum.
    titleColor: "red",
    titleVariant: "doubleBox",
    // Schema is not required for confirm prompts,
    // because of boolean nature of the value.
    // @reliverse/prompts includes styled prompts, with the `title` color defaulting
    // to "cyanBright". Setting the color to "none" removes the default styling.
    content: "Spinners are helpful for long-running tasks.",
    ...extendedConfig,
    // Default value can be set both by the `defaultValue` property,
    // or by returning the value in your own function like this one.
    defaultValue: true,
  });

  if (spinner) {
    await showSpinner();
  }

  // A return value is unnecessary for prompts when the result is not needed later.
  return spinner ?? false;
}

// Prompt ID is not required for the following
// components, as they don't return any values.

export async function showSpinner() {
  await spinner({
    initialMessage: "Some long-running task is in progress...",
    successMessage: "Hooray! The long-running task was a success!",
    errorMessage: "An error occurred while the long-running task!",
    spinnerSolution: "ora",
    spinnerType: "arc",
    action: async (updateMessage) => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      updateMessage("This is just an example, nothing really happens...");
      await new Promise((resolve) => setTimeout(resolve, 1000));
    },
  });
}

export async function showProgressBar() {
  await progressbar({
    total: 100,
    width: 10,
    format:
      "[progressbar] [:bar] :percent% | Elapsed: :elapsed s | ETA: :eta s",
    completeChar: "#",
    incompleteChar: "-",
    colorize: true, // Enable colorization
    increment: 5, // Increment by 5
    desiredTotalTime: 3000, // 3 seconds
  });
}

export async function showResults(userInput) {
  await promptsDisplayResults({
    // Display all user input values, e.g.:
    // ┌────────────────────────────────┐
    // │ Here is your input result:     │
    // │ {                              │
    // │   "deps": true,                │
    // │   "username": "GeraltOfRivia", │
    // │   "password": "21ytrewq",      │
    // │   "age": 98,                   │
    // │   "color": "blue",             │
    // │   "features": [                │
    // │      "typescript", "eslint"    │
    // │   ]                            │
    // │ }                              │
    // └────────────────────────────────┘
    results: userInput,
    inline: true,
  });
}

export async function doSomeFunStuff(userInput) {
  // Just for fun, let's create an age calculator
  // based on the birthday to verify age accuracy.
  const calculatedAge = calculateAge(userInput.birthday);
  validateAge(calculatedAge, userInput.age, userInput.birthday);

  // Hash the password and update the user input object
  userInput.password = hashPassword(userInput.password);

  // Display user registration information
  displayUserInputs(userInput);
}

export async function showNextStepsPrompt() {
  await nextStepsPrompt({
    title: "[nextStepsPrompt] Next Steps",
    content: "- Set up your profile\n- Review your dashboard\n- Add tasks",
    ...extendedConfig,
  });
}

export async function showAnimatedText() {
  await animateText({
    title: emojify(
      "ℹ  :exploding_head: Our library even supports animated messages and emojis!",
    ),
    anim: "neon",
    delay: 2000,
    ...basicConfig,
    titleColor: "passionGradient",
    titleTypography: "bold",
  });
}

export async function showEndPrompt() {
  await endPrompt({
    title: emojify(
      "ℹ  :books: Learn the docs here: https://docs.reliverse.org/relinka",
    ),
    titleAnimation: "glitch",
    ...basicConfig,
    titleColor: "retroGradient",
    titleTypography: "bold",
    titleAnimationDelay: 2000,
  });
}
