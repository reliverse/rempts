#!/usr/bin/env node

import colors from "picocolors";

import figures from "~/figures";
import { select } from "~/prompts";

import checkboxDemo from "./modules/checkbox";
import confirmDemo from "./modules/confirm";
import editorDemo from "./modules/editor";
import expandDemo from "./modules/expand";
import inputDemo from "./modules/input";
import loaderDemo from "./modules/loader";
import numberDemo from "./modules/number";
import passwordDemo from "./modules/password";
import rawlistDemo from "./modules/rawlist";
import searchDemo from "./modules/search";
import selectDemo from "./modules/select";
import timeoutDemo from "./modules/timeout";

const demos = {
  checkbox: checkboxDemo,
  confirm: confirmDemo,
  editor: editorDemo,
  expand: expandDemo,
  input: inputDemo,
  loader: loaderDemo,
  number: numberDemo,
  password: passwordDemo,
  rawlist: rawlistDemo,
  search: searchDemo,
  select: selectDemo,
  timeout: timeoutDemo,
} as const;

type Demos = keyof typeof demos | "advanced" | "back" | "exit";

async function askNextDemo() {
  let selectedDemo: Demos = await select({
    message: "Which prompt demo do you want to run?",
    choices: [
      { name: "Input", value: "input" },
      { name: "Password", value: "password" },
      { name: "Confirm", value: "confirm" },
      { name: "Select", value: "select" },
      { name: "Checkbox", value: "checkbox" },
      { name: "Search", value: "search" },
      { name: "Expand", value: "expand" },
      { name: "Rawlist", value: "rawlist" },
      { name: "Editor", value: "editor" },
      { name: "Number", value: "number" },
      { name: "Advanced demos", value: "advanced" },
      { name: "Exit (I'm done)", value: "exit" },
    ],
    theme: {
      prefix: {
        done: colors.magenta(figures.play),
      },
    },
  });

  if (selectedDemo === "advanced") {
    selectedDemo = await select(
      {
        message: "Which demo do you want to run?",
        choices: [
          { name: "Default value after timeout", value: "timeout" },
          { name: "Loader", value: "loader" },
          { name: "Go back", value: "back" },
        ],
      },
      {
        clearPromptOnDone: true,
      },
    );
  }

  if (selectedDemo === "back") {
    return askNextDemo();
  }

  return selectedDemo;
}

try {
  let nextDemo = await askNextDemo();
  while (nextDemo !== "exit") {
    await demos[nextDemo]();
    nextDemo = await askNextDemo();
  }
} catch (error) {
  if (error instanceof Error && error.name === "ExitPromptError") {
    // noop; silence this error
  } else {
    throw error;
  }
}
