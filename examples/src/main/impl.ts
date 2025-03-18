import type { UserInput } from "@/src/main/schema.js";

import {
  askDir,
  doSomeFunStuff,
  showAnimatedText,
  showConfirmPrompt,
  showEndPrompt,
  showNumMultiselectPrompt,
  showNextStepsPrompt,
  showNumberPrompt,
  showNumSelectPrompt,
  showInputPromptMasked,
  showResults,
  showInputPrompt,
  showSelectPrompt,
  showMultiselectPrompt,
  showTogglePrompt,
  showDatePrompt,
} from "@/src/main/prompts.js";

/**
 * Union type for available example types.
 */
export type ExampleType =
  | "input"
  | "inputmasked"
  | "select"
  | "multiselect"
  | "nummultiselect"
  | "numselect"
  | "toggle"
  | "confirm"
  | "spinner"
  | "progressbar"
  | "results"
  | "nextsteps"
  | "animatedtext"
  | "date"
  | "end";

/**
 * Defines a prompt option for the example selector.
 */
type ExampleOption = {
  label: string;
  value: ExampleType;
  hint: string;
  description?: string;
};

/**
 * Available example options for the demo.
 */
export const EXAMPLE_OPTIONS: ExampleOption[] = [
  {
    label: "Input",
    value: "input",
    hint: "input-username",
    description: "Demonstrates basic text input",
  },
  {
    label: "Date Input",
    value: "date",
    hint: "date-input",
    description: "Enter dates in a specific format",
  },
  {
    label: "Input Masked",
    value: "inputmasked",
    hint: "input-masked-username",
    description: "Shows password-style masked input",
  },
  {
    label: "Select",
    value: "select",
    hint: "select-language",
    description: "Single option selection from a list",
  },
  {
    label: "Multiselect",
    value: "multiselect",
    hint: "multiselect-languages",
    description: "Multiple options selection from a list",
  },
  {
    label: "Number Multiselect",
    value: "nummultiselect",
    hint: "numbers",
    description: "Select multiple numeric options",
  },
  {
    label: "Number Select",
    value: "numselect",
    hint: "number-select",
    description: "Select a single numeric option",
  },
  {
    label: "Toggle",
    value: "toggle",
    hint: "toggle-yes-no",
    description: "Simple boolean toggle control",
  },
  {
    label: "Confirm",
    value: "confirm",
    hint: "confirm-yes-no",
    description: "Yes/No confirmation prompt",
  },
  {
    label: "Spinner",
    value: "spinner",
    hint: "spinner-yes-no",
    description: "Loading spinner demonstration",
  },
  {
    label: "Progress Bar",
    value: "progressbar",
    hint: "progressBar",
    description: "Visual progress indicator",
  },
  {
    label: "Input Results + Fun Stuff + Next Steps",
    value: "results",
    hint: "results-funstuff-nextsteps",
    description: "Displays user input summary with animations",
  },
  {
    label: "Next Steps",
    value: "nextsteps",
    hint: "nextSteps",
    description: "Shows guidance on next actions",
  },
  {
    label: "Animated Text",
    value: "animatedtext",
    hint: "animatedText",
    description: "Text with animation effects",
  },
  {
    label: "End",
    value: "end",
    hint: "end",
    description: "Closing/exit screen",
  },
];

/**
 * List of input-related examples that collect user data.
 */
export const INPUT_EXAMPLES: ExampleType[] = [
  "input",
  "select",
  "multiselect",
  "date",
  "inputmasked",
  "numselect",
  "nummultiselect",
  "toggle",
  "confirm",
];

/**
 * Default user input values when examples are skipped.
 */
export const DEFAULT_USER_INPUT: Partial<UserInput> = {
  username: "johnny911",
  dir: "./prefilled-default-value",
  lang: "en",
  age: 36,
  password: "silverHand2077",
  birthday: "16.11.1988",
  langs: ["en"],
  color: "blue",
  toggle: false,
  spinner: false,
};

/**
 * Mapping of example types to their handler functions for input examples.
 */
const exampleHandlers: Partial<
  Record<
    ExampleType,
    (
      userInput: Partial<UserInput>,
      selectedExamples: ExampleType[],
    ) => Promise<void>
  >
> = {
  input: async (userInput) => {
    userInput.username = await showInputPrompt();
    if (userInput.username) {
      userInput.dir = await askDir(userInput.username);
    }
  },
  select: async (userInput) => {
    userInput.lang = await showSelectPrompt();
  },
  date: async (userInput) => {
    userInput.birthday = await showDatePrompt();
  },
  inputmasked: async (userInput) => {
    userInput.password = await showInputPromptMasked();
  },
  numselect: async (userInput, selectedExamples) => {
    userInput.age = await showNumberPrompt();
    if (selectedExamples.includes("numselect")) {
      userInput.color = await showNumSelectPrompt();
    }
  },
  nummultiselect: async () => {
    await showNumMultiselectPrompt();
  },
  multiselect: async (userInput) => {
    userInput.langs = await showMultiselectPrompt();
  },
  toggle: async (userInput) => {
    userInput.toggle = await showTogglePrompt();
  },
  confirm: async (userInput) => {
    if (userInput.username) {
      userInput.spinner = await showConfirmPrompt(userInput.username);
    }
  },
};

/**
 * Validates that the user input has all required fields.
 * @param input Partial user input.
 * @returns Complete UserInput object with all required fields.
 */
export function validateUserInput(input: Partial<UserInput>): UserInput {
  const validated: UserInput = {
    username: input.username ?? DEFAULT_USER_INPUT.username,
    dir: input.dir ?? DEFAULT_USER_INPUT.dir,
    lang: input.lang ?? DEFAULT_USER_INPUT.lang,
    age: input.age ?? DEFAULT_USER_INPUT.age,
    password: input.password ?? DEFAULT_USER_INPUT.password,
    birthday: input.birthday ?? DEFAULT_USER_INPUT.birthday,
    langs: input.langs ?? DEFAULT_USER_INPUT.langs,
    color: input.color ?? DEFAULT_USER_INPUT.color,
    toggle: input.toggle ?? DEFAULT_USER_INPUT.toggle,
    spinner: input.spinner ?? DEFAULT_USER_INPUT.spinner,
  };

  return validated;
}

/**
 * Handles specific example based on user selection.
 * @param exampleType The type of example to show.
 * @param userInput Current user input object.
 * @param selectedExamples Array of selected example types.
 * @returns Promise that resolves when the example handling is complete.
 */
export async function handleExample(
  exampleType: ExampleType,
  userInput: Partial<UserInput>,
  selectedExamples: ExampleType[],
): Promise<void> {
  try {
    const handler = exampleHandlers[exampleType];
    if (handler) {
      await handler(userInput, selectedExamples);
    } else {
      console.warn(`Unhandled example type: ${exampleType}`);
    }
  } catch (error: unknown) {
    console.error(`Error handling example ${exampleType}:`, error);
    // Fallback to default value if available
    const key = exampleType as keyof typeof DEFAULT_USER_INPUT;
    if (key in DEFAULT_USER_INPUT) {
      (userInput as any)[key] = DEFAULT_USER_INPUT[key];
    }
  }
}

/**
 * Processes all output/visualization examples based on user selection.
 *
 * @param selectedExamples List of examples the user chose to run.
 * @param userInput Validated user input data.
 */
export async function processOutputExamples(
  selectedExamples: ExampleType[],
  userInput: UserInput,
): Promise<void> {
  if (selectedExamples.includes("results")) {
    await showResults(userInput);
    await doSomeFunStuff(userInput);
  }

  if (selectedExamples.includes("nextsteps")) {
    await showNextStepsPrompt();
  }

  if (selectedExamples.includes("animatedtext")) {
    await showAnimatedText();
  }

  if (selectedExamples.includes("end") || selectedExamples.length === 0) {
    await showEndPrompt();
  }
}
