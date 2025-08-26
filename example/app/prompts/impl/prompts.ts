import { relinka } from "@reliverse/relinka";
import { isBunRuntime } from "@reliverse/runtime";
import packageJson from "~/../package.json" with { type: "json" };
import {
  animateText,
  anykeyPrompt,
  confirmPrompt,
  datePrompt,
  endPrompt,
  inputPrompt,
  msg,
  multiselectPrompt,
  nextStepsPrompt,
  numberPrompt,
  numMultiSelectPrompt,
  numSelectPrompt,
  resultPrompt,
  selectPrompt,
  startPrompt,
  taskProgressPrompt,
  taskSpinPrompt,
  togglePrompt,
} from "~/mod";
import type { ColorName } from "~/types";

import { basicConfig, extendedConfig } from "./cfg";
import {
  calculateAge,
  createColorChoices,
  displayUserInputs,
  hashPassword,
  validateAge,
} from "./utils";

const pkg = packageJson;

export async function showStartPrompt() {
  await startPrompt({
    ...basicConfig,
    isDev: true,
    titleColor: "inverse",
    clearConsole: true,
    packageName: pkg.name,
    packageVersion: pkg.version,
    terminalSizeOptions: {
      sizeErrorDescription: "Please increase the terminal size to run this prompts example.",
    },
  });
}

export async function showAnykeyPrompt(kind: "pm" | "privacy", username?: string) {
  const pm = "bun";
  let notification = "[anykeyPrompt] Press any key to continue...";
  if (kind === "privacy") {
    notification = `Before you continue, please note that you are only testing an example CLI app. None of your responses will be sent anywhere. No actions, such as installing dependencies, will actually take place; this is simply a simulation with a sleep timer and spinner. You can always review the source code to learn more.\n============================\n${notification}`;
  }
  if (kind === "pm" && pm === "bun" && username) {
    notification += `\n============================\n${username}, did you know? Bun currently may crash if you press Enter while setTimeout is running. So please avoid doing that in the prompts after this one! 😅`;
  }
  await anykeyPrompt(notification, {
    shouldStream: !isBunRuntime(),
    streamDelay: 5,
  });
}

export async function showInputPrompt() {
  const username = await inputPrompt({
    title: "We're glad you're testing our interactive prompts library!",
    content: "Let's get to know each other!\nWhat's your username?",
    hint: "Just press <Enter> to use the default value: johnny911",
    defaultValue: "johnny911",
    ...extendedConfig,
    symbol: "pointer",
    customSymbol: "👋",
    shouldStream: false,
  });
  return username ?? "johnny911";
}

export async function askDir(username: string) {
  const dir = await inputPrompt({
    title: `[inputPrompt] Great! Nice to meet you, ${username}!`,
    content: "Where should we create your project?",
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
    content: "“It matters not how long we live but how we live.“ – Philip James Bailey",
    hint: "Try: 42 | Default: 36",
    defaultValue: "36",
    validate: (value) => {
      const num = Number(value);
      if (num === 42) {
        return "Try a different number... “42 is the answer to the ultimate question of life, the universe, and everything.“ – Douglas Adams";
      }
      return true;
    },
  });
  return age ?? 34;
}

export async function showInputPromptMasked() {
  let password = "silverHand2077";
  try {
    password = await inputPrompt({
      title: "[inputPrompt, mode: password] Imagine a password",
      mode: "password",
      mask: "🟢",
      defaultValue: "silverHand2077",
      hint: "Default: silverHand2077",
      validate: (input) => {
        if (!/[A-Z]/.test(input)) {
          return "Password must be latin letters and contain at least one uppercase letter.";
        }
        return true;
      },
    });
  } catch (_error) {
    relinka("error", "Input prompt masked cancelled. Returning default password.");
    return "silverHand2077";
  }
  return password ?? "silverHand2077";
}

export async function showDatePrompt() {
  const birthdayDate = await datePrompt({
    dateKind: "birthday",
    dateFormat: "DD.MM.YYYY",
    title: "[datePrompt] Enter your birthday",
    defaultValue: "16.11.1988",
  });
  return birthdayDate ?? "16.11.1988";
}

export async function showSelectPrompt() {
  const lang = await selectPrompt({
    title: "[selectPrompt] Choose your language",
    displayInstructions: true,
    content:
      "“You can have brilliant ideas, but if you can't get them across, your ideas won't get you anywhere.” - Lee Iacocca",
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
    ...extendedConfig,
    debug: false,
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
  const langs = await multiselectPrompt({
    title: "[multiselectPrompt] Select your favorite programming languages",
    displayInstructions: true,
    content: '"Code is like humor. When you have to explain it, it\'s bad." – Cory House',
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
    defaultValue: ["TypeScript", "JavaScript"],
    ...extendedConfig,
    debug: false,
  });
  return (langs ?? []).filter(
    (
      lang,
    ): lang is
      | "TypeScript"
      | "JavaScript"
      | "Pawn"
      | "CoffeeScript"
      | "Python"
      | "Java"
      | "CSharp"
      | "Go"
      | "Rust"
      | "Swift"
      | "Other" => lang !== undefined,
  );
}

export async function showNumSelectPrompt(): Promise<ColorName> {
  const choices = createColorChoices();

  const color = await numSelectPrompt({
    title: "[numSelectPrompt] Choose your favorite color",
    content: "You are free to customize everything in your prompts!",
    ...extendedConfig,
    choices,
    defaultValue: "17",
    hint: "Default: 17",
  });

  return (color.toString() as ColorName) ?? "blue";
}

export async function showNumMultiselectPrompt() {
  const features = await numMultiSelectPrompt({
    title: "[numMultiSelectPrompt] What web technologies do you like?",
    defaultValue: ["react", "typescript"],
    choices: [
      {
        id: "react",
        title: "React",
        description: "A library for building user interfaces.",
      },
      {
        id: "typescript",
        title: "TypeScript",
        description: "A programming language that adds static typing to JavaScript.",
      },
      {
        id: "eslint",
        title: "ESLint",
        description: "A tool for identifying patterns in JavaScript code.",
      },
    ] as const,
  });
  return features ?? [];
}

export async function showTogglePrompt() {
  const result = await togglePrompt({
    title: "[togglePrompt] Do you like @reliverse/rempts library?",
    content:
      "You can share your thoughts with us here:\n- https://github.com/reliverse/rempts/issues \n- https://discord.gg/Pb8uKbwpsJ",
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
    title: "[confirmPrompt] Do you want to see spinner and progressbar in action?",
    ...extendedConfig,
    titleColor: "red",
    titleVariant: "doubleBox",
    content: "Spinners are helpful for long-running tasks.",
    defaultValue: true,
  });

  if (spinner) {
    await showSpinner();
    await showProgressbar();
  }

  return spinner ?? false;
}

async function showSpinner() {
  await taskSpinPrompt({
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

async function showProgressbar() {
  await taskProgressPrompt({
    total: 100,
    width: 10,
    format: "[progressbar] [:bar] :percent% | Elapsed: :elapsed s | ETA: :eta s",
    completeChar: "#",
    incompleteChar: "-",
    colorize: true,
    increment: 5,
    desiredTotalTime: 2000,
  });
}

export async function showResults(userInput: any) {
  await resultPrompt({
    results: userInput,
    inline: true,
  });
}

export async function doSomeFunStuff(userInput: any) {
  const calculatedAge = calculateAge(userInput.birthday);
  validateAge(calculatedAge, userInput.age, userInput.birthday);

  userInput.password = hashPassword(userInput.password);

  displayUserInputs(userInput);
}

export async function showNextStepsPrompt() {
  await nextStepsPrompt({
    title: "[nextStepsPrompt] Next Steps",
    content: ["- Set up your profile", "- Review your dashboard", "- Create tasks"],
    ...extendedConfig,
  });
}

export async function showAnimatedText() {
  await animateText({
    title: "Our library even supports animated messages!",
    anim: "neon",
    delay: 1000,
    ...basicConfig,
    titleColor: "cyan",
    titleTypography: "bold",
  });
}

export async function showEndPrompt() {
  await endPrompt({
    title: "📖 Learn the docs here: https://docs.reliverse.org/prompts",
    titleAnimation: "glitch",
    ...basicConfig,
    titleColor: "viceGradient",
    titleTypography: "italic",
    endTitleColor: "viceGradient",
    titleAnimationDelay: 1000,
  });
}
