import { version } from "~/../package.json";
import { detect } from "detect-package-manager";
import { emojify } from "node-emoji";
import { bold } from "picocolors";

import { animateText } from "~/components/animate";
import { pressAnyKeyPrompt } from "~/components/any-key";
import { numSelectPrompt } from "~/components/num-select";
import { promptsDisplayResults } from "~/components/results";
import {
  confirmPrompt,
  datePrompt,
  endPrompt,
  multiselectPrompt,
  nextStepsPrompt,
  numberPrompt,
  passwordPrompt,
  selectPrompt,
  startPrompt,
  textPrompt,
} from "~/main";
import { fmt } from "~/utils/messages";

import { basicConfig, extendedConfig } from "./main-configs";
import { schema, type UserInput } from "./main-schema";
import { exampleSpinner } from "./main-utils";

const IDs = {
  start: "start",
  username: "username",
  dir: "dir",
  deps: "deps",
  password: "password",
  age: "age",
  language: "language",
  color: "color",
  birthday: "birthday",
  features: "features",
};

export async function showStartPrompt() {
  await startPrompt({
    id: IDs.start,
    title: `@reliverse/prompts v${version}`,
    ...basicConfig,
    titleColor: "inverse",
    clearConsole: true,
  });
}

export async function showTextPrompt(): Promise<UserInput["username"]> {
  const username = await textPrompt({
    // 'id' is the key in the userInput result object.
    // Choose any name for it, but ensure it’s unique.
    // Intellisense will show you all available IDs.
    id: IDs.username,
    title: "We're glad you're testing our interactive prompts library!",
    content: "Let's get to know each other!\nWhat's your username?",
    schema: schema.properties.username,
    ...extendedConfig,
  });
  return username ?? "johnny";
}

export async function askDir(username: string): Promise<UserInput["dir"]> {
  const dir = await textPrompt({
    id: IDs.dir,
    title: `Great! Nice to meet you, ${username}!`,
    content: "Where should we create your project?",
    // Schema is required, because it provides a runtime typesafety validation.
    schema: schema.properties.dir,
    ...extendedConfig,
    titleVariant: "doubleBox",
    defaultValue: "./prefilled-default-value",
    hint: "Press <Enter> to use the default value.",
  });
  return dir ?? "./prefilled-default-value";
}

export async function showNumberPrompt(): Promise<UserInput["age"]> {
  const age = await numberPrompt({
    id: IDs.age,
    // Adding a hint helps users understand the expected input format.
    hint: "Example: 25",
    title: "Enter your age",
    // Define a schema to validate the input.
    // Errors are automatically handled and displayed based on the type.
    schema: schema.properties.age,
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

// TODO: fix, currently works only if it's the first prompt
export async function showSelectPrompt(): Promise<string> {
  const language = await selectPrompt({
    id: IDs.language,
    title: "Choose your language",
    choices: [
      {
        title: "English",
        id: "en",
      },
      { title: "Other", id: "other" },
    ],
  });

  return language ?? "";
}

export async function showNumSelectPrompt(): Promise<UserInput["color"]> {
  const color = await numSelectPrompt({
    id: IDs.color,
    title: "Choose your favorite color",
    choices: [
      { title: "Red", id: "red" },
      { title: "Green", id: "green" },
      { title: "Blue", id: "blue" },
    ] as const, // Define choices as const to make them literal types.
    schema: schema.properties.color, // Use schema-defined color enum.
  });
  return color ?? "red";
}

export async function showPasswordPrompt(): Promise<UserInput["password"]> {
  // Initialize `passwordResult` to avoid uninitialized variable errors.
  let password = "silverHand2077";
  // Wrap password prompts with a try-catch block to handle cancellations,
  // which otherwise would terminate the process with an error.
  try {
    password = await passwordPrompt({
      id: IDs.password,
      title: "Enter your password",
      schema: schema.properties.password,
    });
  } catch (error) {
    console.error("\nPassword prompt was aborted or something went wrong.");
  }
  // We can set default values for missing responses, especially
  // for the cases when we allow the user to cancel the prompt.
  return password ?? "silverHand2077";
}

export async function showDatePrompt(): Promise<UserInput["birthday"]> {
  const birthdayDate = await datePrompt({
    id: IDs.birthday,
    dateKind: "birthday",
    dateFormat: "DD.MM.YYYY",
    title: "Enter your birthday",
    hint: "Press <Enter> to use the default value",
    // You can set a default value for the prompt if desired.
    defaultValue: "14.09.1999",
    schema: schema.properties.birthday,
  });
  return birthdayDate ?? "16.11.1988";
}

export async function showMultiselectPrompt(): Promise<UserInput["features"]> {
  const features = await multiselectPrompt({
    id: IDs.features,
    title: "What features do you want to use?",
    choices: [
      {
        title: "React",
        id: "react",
        // Some properties, like 'choices.description', are optional.
        description: "A library for building user interfaces.",
      },
      {
        title: "TypeScript",
        id: "typescript",
        description:
          "A programming language that adds static typing to JavaScript.",
      },
      {
        title: "ESLint",
        id: "eslint",
        description: "A tool for identifying patterns in JavaScript code.",
      },
    ] as const,
    schema: schema.properties.features,
  });
  return features ?? ["react", "typescript"];
}

export async function showConfirmPrompt(
  username: string,
): Promise<UserInput["deps"]> {
  await showAnyKeyPrompt("pm", username);

  const deps = await confirmPrompt({
    id: IDs.deps,
    title: "Do you want to see spinner in action?",
    // Intellisense will show you all available colors thanks to the enum.
    titleColor: "red",
    titleVariant: "doubleBox",
    schema: schema.properties.deps,
    // @reliverse/prompts includes styled prompts, with the `title` color defaulting
    // to "cyanBright". Setting the color to "none" removes the default styling.
    content: "Spinners are helpful for long-running tasks.",
    contentColor: "dim",
    contentVariant: "underline",
    // Default value can be set both by the `defaultValue` property,
    // or by returning the value in your own function like this one.
    defaultValue: true,
    action: async () => exampleSpinner(),
  });
  // A return value is unnecessary for prompts when the result is not needed later.
  return deps ?? false;
}

// Prompt ID is not required for the following
// prompts, as they don't return any values.

export async function showAnyKeyPrompt(
  kind: "pm" | "privacy",
  username?: string,
) {
  const pm = await detect();
  let notification = bold("Press any key to continue...");
  if (kind === "privacy") {
    notification = `Before you continue, please note that you are only testing an example CLI app.\n│  None of your responses will be sent anywhere. No actions, such as installing dependencies, will actually take place;\n│  this is simply a simulation with a sleep timer and spinner. You can always review the source code to learn more.\n│  ============================\n│  ${notification}`;
  }
  if (kind === "pm" && pm === "bun" && username) {
    notification += `\n\n${username}, did you know? Bun currently may crash if you press Enter while setTimeout\nis running. So please avoid doing that in the prompts after this one! 😅`;
  }
  await pressAnyKeyPrompt(notification);
}

export async function showNextStepsPrompt() {
  await nextStepsPrompt({
    id: "nextSteps",
    title: "Next Steps",
    titleColor: "none",
    titleVariant: "banner",
    content: "- Set up your profile\n║ - Add tasks\n║ - Review your dashboard",
    contentColor: "white",
    contentVariant: "doubleBox",
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
    id: "end",
    title: emojify(
      "ℹ  :books: Learn the docs here: https://docs.reliverse.org/prompts",
    ),
    titleAnimation: "glitch",
    ...basicConfig,
    titleColor: "retroGradient",
    titleTypography: "bold",
    titleAnimationDelay: 2000,
  });
}

export async function showResults(userInput: UserInput) {
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

export async function doSomeFunStuff(userInput: UserInput) {
  // For fun, create an age calculator based on the birthday to verify age accuracy.
  // const calculatedAge =
  //   new Date().getFullYear() - new Date(userInput.birthday).getFullYear();
  // if (calculatedAge === userInput.age) {
  //   console.log("Your age and birthday correspond!");
  // } else {
  //   console.log("Your age and birthday don't correspond!");
  // }

  // Simulate password hashing and update the user input object
  userInput.password = userInput.password.split("").reverse().join("");

  // Access values by their keys
  fmt({
    type: "M_INFO",
    title: `User successfully registered: ${userInput.username}`,
    titleColor: "dim",
  });

  // Full intellisense is available when defining choices using an enum
  if (userInput.color === "red") {
    console.log("User's favorite color is red. Johnny Silverhand approves.");
  }
}
