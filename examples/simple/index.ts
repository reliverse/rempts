#!/usr/bin/env node

import colors from "picocolors";

import figures from "~/components/figures/index.js";
import { select } from "~/components/prompts/index.js";

import checkboxDemo from "./modules/checkbox.js";
import confirmDemo from "./modules/confirm.js";
import editorDemo from "./modules/editor.js";
import expandDemo from "./modules/expand.js";
import inputDemo from "./modules/input.js";
import loaderDemo from "./modules/loader.js";
import numberDemo from "./modules/number.js";
import passwordDemo from "./modules/password.js";
import rawlistDemo from "./modules/rawlist.js";
import searchDemo from "./modules/search.js";
import selectDemo from "./modules/select.js";
import timeoutDemo from "./modules/timeout.js";

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
      // @ts-expect-error TODO: fix ts
      { name: "Input", value: "input" },
      // @ts-expect-error TODO: fix ts
      { name: "Password", value: "password" },
      // @ts-expect-error TODO: fix ts
      { name: "Confirm", value: "confirm" },
      // @ts-expect-error TODO: fix ts
      { name: "Select", value: "select" },
      // @ts-expect-error TODO: fix ts
      { name: "Checkbox", value: "checkbox" },
      // @ts-expect-error TODO: fix ts
      { name: "Search", value: "search" },
      // @ts-expect-error TODO: fix ts
      { name: "Expand", value: "expand" },
      // @ts-expect-error TODO: fix ts
      { name: "Rawlist", value: "rawlist" },
      // @ts-expect-error TODO: fix ts
      { name: "Editor", value: "editor" },
      // @ts-expect-error TODO: fix ts
      { name: "Number", value: "number" },
      // @ts-expect-error TODO: fix ts
      { name: "Advanced demos", value: "advanced" },
      // @ts-expect-error TODO: fix ts
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
          // @ts-expect-error TODO: fix ts
          { name: "Default value after timeout", value: "timeout" },
          // @ts-expect-error TODO: fix ts
          { name: "Loader", value: "loader" },
          // @ts-expect-error TODO: fix ts
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
