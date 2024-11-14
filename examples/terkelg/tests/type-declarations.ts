// @ts-nocheck

import * as prompts from "../src/main.js";

// Utility type to check if a property exists on a given type
type HasProperty<T, K> = K extends keyof T ? true : false;

// Prompt to input a number and double it
(async () => {
  const response = await prompts({
    type: "number",
    name: "value",
    message: "Input a value to double:",
    validate: (value: any) => (value < 0 ? "Cannot be less than zero" : true),
  });
  const hasValueProperty: HasProperty<typeof response, "value"> = true;
  const withoutAsdfProperty: HasProperty<typeof response, "asdf"> = false;
})();

// Prompt for text input and conditional confirmation based on response
(async () => {
  await prompts([
    {
      type: "text",
      name: "language",
      message: "What language is the next greatest thing since sliced bread?",
    },
    {
      type: (prev, values) => {
        const hasLanguageProperty: HasProperty<typeof values, "language"> =
          true;
        const withoutTextProperty: HasProperty<typeof values, "text"> = false;

        return prev === "javascript" ? "confirm" : null;
      },
      name: "confirmation",
      message: "Have you tried TypeScript?",
    },
    {
      type: "select",
      name: "options",
      message: "Choose an option:",
      choices: [
        { title: "Option A", value: "A" },
        { title: "Option B", value: { foo: "bar" } },
        { title: "Option C", value: "C", description: "This is a description" },
      ],
      warn: "Warning, option is disabled",
    },
    {
      type: "multiselect",
      name: "multiChoices",
      message: "Why not select multiple?",
      instructions: false,
      choices: [
        { title: "Option A", value: "A" },
        { title: "Option B", value: "B" },
      ],
      warn: "Warning, option is disabled",
    },
  ]);
})();

// Nested select prompts with dynamic choices
(async () => {
  await prompts([
    {
      type: "select",
      name: "primaryChoice",
      instructions: false,
      message: "Select a primary option:",
      choices: [
        { title: "Option A", value: "A" },
        { title: "Option B", value: "B" },
      ],
      warn: "Warning, option is disabled",
    },
    {
      type: "select",
      name: "subChoice",
      message: "Choose a sub-option:",
      choices: (prev) => [
        { title: `${prev} Sub-A`, value: `${prev}A` },
        { title: `${prev} Sub-B`, value: `${prev}B` },
      ],
    },
  ]);
})();

// Testing PromptObject with various initial values
(async () => {
  await prompts({
    type: "text",
    name: "textValue",
    message: "Enter a string",
    initial: "default text",
  });

  await prompts({
    type: "number",
    name: "numberValue",
    message: "Enter a number",
    initial: 0,
  });

  await prompts({
    type: "confirm",
    name: "confirmValue",
    message: "Confirm?",
    initial: true,
  });

  await prompts({
    type: "date",
    name: "dateValue",
    message: "Select a date",
    initial: new Date(),
  });

  await prompts({
    type: "text",
    name: "functionTextValue",
    message: "Enter a string (function-based initial)",
    initial: () => "default function value",
  });

  await prompts({
    type: "number",
    name: "functionNumberValue",
    message: "Enter a number (function-based initial)",
    initial: () => 1,
  });

  await prompts({
    type: "confirm",
    name: "functionConfirmValue",
    message: "Confirm? (function-based initial)",
    initial: () => true,
  });

  await prompts({
    type: "date",
    name: "functionDateValue",
    message: "Select a date (function-based initial)",
    initial: () => new Date(),
  });

  await prompts({
    type: "text",
    name: "asyncTextValue",
    message: "Enter a string (async function-based initial)",
    initial: async () => "async initial value",
  });

  await prompts({
    type: "number",
    name: "asyncNumberValue",
    message: "Enter a number (async function-based initial)",
    initial: async () => 1,
  });

  await prompts({
    type: "confirm",
    name: "asyncConfirmValue",
    message: "Confirm? (async function-based initial)",
    initial: async () => true,
  });

  await prompts({
    type: "date",
    name: "asyncDateValue",
    message: "Select a date (async function-based initial)",
    initial: async () => new Date(),
  });
})();
