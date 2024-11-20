import { version } from "~/../package.json" with { type: "json" };
import { detect } from "detect-package-manager";
import { emojify } from "node-emoji";
import { bold } from "picocolors";
import { pressAnyKeyPrompt } from "~/components/any-key.js";
import { numSelectPrompt } from "~/components/num-select.js";
import { promptsDisplayResults } from "~/components/results.js";
import { relinka } from "~/create.js";
import { animateText, datePrompt, endPrompt, msg, numMultiSelectPrompt, nextStepsPrompt, numberPrompt, passwordPrompt, 
// selectPrompt,
spinnerPrompts, startPrompt, textPrompt, } from "~/main.js";
import { basicConfig, extendedConfig } from "./main-configs.js";
import { schema } from "./main-schema.js";
import { calculateAge, createColorChoices, displayUserInputs, hashPassword, validateAge, } from "./main-utils.js";
const IDs = {
    start: "start",
    username: "username",
    dir: "dir",
    deps: "deps",
    password: "password",
    age: "age",
    lang: "lang",
    color: "color",
    birthday: "birthday",
    features: "features",
};
export async function showStartPrompt() {
    await startPrompt({
        id: IDs.start,
        title: `@reliverse/relinka v${version}`,
        ...basicConfig,
        titleColor: "inverse",
        clearConsole: true,
    });
}
export async function showTextPrompt() {
    const username = await textPrompt({
        // 'id' is the key in the userInput result object.
        // Choose any name for it, but ensure it’s unique.
        // Intellisense will show you all available IDs.
        id: IDs.username,
        title: "We're glad you're testing our interactive prompts library!",
        content: "Let's get to know each other!\nWhat's your username?",
        hint: "Press <Enter> to use the default value. [Default: johnny911]",
        defaultValue: "johnny911",
        schema: schema.properties.username,
        ...extendedConfig,
    });
    return username ?? "johnny911";
}
export async function askDir(username) {
    const dir = await textPrompt({
        id: IDs.dir,
        title: `Great! Nice to meet you, ${username}!`,
        content: "Where should we create your project?",
        // Schema is required, because it provides a runtime typesafety validation.
        schema: schema.properties.dir,
        ...extendedConfig,
        titleVariant: "doubleBox",
        hint: "Default: ./prefilled-default-value",
        defaultValue: "./prefilled-default-value",
    });
    return dir ?? "./prefilled-default-value";
}
export async function showNumberPrompt() {
    const age = await numberPrompt({
        id: IDs.age,
        ...extendedConfig,
        // Adding a hint helps users understand the expected input format.
        hint: "Default: 36",
        defaultValue: "36",
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
export async function showSelectPrompt() {
    const lang = await relinka.prompt("Choose your language", {
        type: "select",
        options: [
            { label: "English", value: "English" },
            { label: "Ukrainian", value: "Ukrainian" },
            { label: "Other", value: "Other" },
        ],
        initial: "English",
    });
    if (typeof lang !== "string") {
        process.exit(0);
    }
    return lang.toString();
}
export async function showNumSelectPrompt() {
    const choices = createColorChoices();
    const color = await numSelectPrompt({
        id: IDs.color,
        title: "Choose your favorite color",
        content: "You are free to customize everything in your prompts using the following color palette.",
        ...extendedConfig,
        choices,
        defaultValue: "17",
        hint: "Default: 17",
        schema: schema.properties.color,
    });
    return color ?? "red";
}
export async function showPasswordPrompt() {
    // Initialize `passwordResult` to avoid uninitialized variable errors.
    let password = "silverHand2077";
    // Wrap password prompts with a try-catch block to handle cancellations,
    // which otherwise would terminate the process with an error.
    try {
        password = await passwordPrompt({
            id: IDs.password,
            title: "Imagine a password",
            schema: schema.properties.password,
            defaultValue: "silverHand2077",
            hint: "Default: silverHand2077",
            validate: (input) => {
                if (!/[A-Z]/.test(input)) {
                    return "Password must be latin letters and contain at least one uppercase letter.";
                }
                return true;
            },
        });
    }
    catch (error) {
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
        id: IDs.birthday,
        dateKind: "birthday",
        dateFormat: "DD.MM.YYYY",
        title: "Enter your birthday",
        hint: "Default: 16.11.1988",
        // You can set a default value for the prompt if desired.
        defaultValue: "16.11.1988",
        schema: schema.properties.birthday,
    });
    return birthdayDate ?? "16.11.1988";
}
export async function showMultiSelectPrompt() {
    const features = await relinka.prompt("Select your programming language(s) | Use <space> to select/deselect", {
        type: "multiselect",
        options: [
            {
                label: "TypeScript",
                value: "typescript",
                hint: emojify(":blue_heart:"),
            },
            {
                label: "JavaScript",
                value: "javascript",
                hint: emojify(":yellow_heart:"),
            },
            {
                label: "CoffeeScript",
                value: "coffeescript",
                hint: emojify(":coffee:"),
            },
            {
                label: "Python",
                value: "python",
                hint: emojify(":snake:"),
            },
            { label: "Java", value: "java", hint: emojify(":coffee:") },
            { label: "C#", value: "csharp", hint: emojify(":hash:") },
            { label: "Go", value: "go", hint: emojify(":dolphin:") },
            { label: "Rust", value: "rust", hint: emojify(":crab:") },
            { label: "Swift", value: "swift", hint: emojify(":apple:") },
        ],
        initial: ["javascript", "typescript"],
    });
    if (!Array.isArray(features)) {
        process.exit(0);
    }
    return features.toString().split(",");
}
export async function showNumMultiSelectPrompt() {
    const features = await numMultiSelectPrompt({
        id: IDs.features,
        title: "What features do you want to use?",
        defaultValue: ["react", "typescript"],
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
                description: "A programming language that adds static typing to JavaScript.",
            },
            {
                title: "ESLint",
                id: "eslint",
                description: "A tool for identifying patterns in JavaScript code.",
            },
        ],
        schema: schema.properties.features,
    });
    return features ?? ["react", "typescript"];
}
// TODO: fix bun crash
/* export async function showConfirmPrompt(
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
    // @reliverse/relinka includes styled prompts, with the `title` color defaulting
    // to "cyanBright". Setting the color to "none" removes the default styling.
    content: "Spinners are helpful for long-running tasks.",
    ...extendedConfig,
    // Default value can be set both by the `defaultValue` property,
    // or by returning the value in your own function like this one.
    defaultValue: true,
    action: async () => await showSpinner(),
  });
  // A return value is unnecessary for prompts when the result is not needed later.
  return deps ?? false;
} */
// Prompt ID is not required for the following
// components, as they don't return any values.
export async function showSpinner() {
    await spinnerPrompts({
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
export async function showAnyKeyPrompt(kind, username) {
    const pm = await detect();
    let notification = bold("Press any key to continue...");
    if (kind === "privacy") {
        notification = `Before you continue, please note that you are only testing an example CLI app.\n│  None of your responses will be sent anywhere. No actions, such as installing dependencies, will actually take place;\n│  this is simply a simulation with a sleep timer and spinner. You can always review the source code to learn more.\n│  ============================\n│  ${notification}`;
    }
    if (kind === "pm" && pm === "bun" && username) {
        notification += `\n│  ============================\n│  ${username}, did you know? Bun currently may crash if you press Enter while setTimeout\n│  is running. So please avoid doing that in the prompts after this one! 😅`;
    }
    await pressAnyKeyPrompt(notification);
}
export async function showNextStepsPrompt() {
    await nextStepsPrompt({
        id: "nextSteps",
        title: "Next Steps",
        content: "- Set up your profile\n- Review your dashboard\n- Add tasks",
        ...extendedConfig,
    });
}
export async function showAnimatedText() {
    await animateText({
        title: emojify("ℹ  :exploding_head: Our library even supports animated messages and emojis!"),
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
        title: emojify("ℹ  :books: Learn the docs here: https://docs.reliverse.org/relinka"),
        titleAnimation: "glitch",
        ...basicConfig,
        titleColor: "retroGradient",
        titleTypography: "bold",
        titleAnimationDelay: 2000,
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
