// 👉 bun examples/separate/select/select-example.ts

import { showEndPrompt, showStartPrompt } from "@/src/prompts.js";

import {
  confirmPrompt,
  msg,
  multiselectPrompt,
  selectPrompt,
  togglePrompt,
} from "~/main.js";
import { errorHandler } from "~/utils/errors.js";

export async function detailedExample() {
  await showStartPrompt();

  msg({
    type: "M_INFO",
    title:
      "[msg | linesHandler: wrap] Let's embark on a creative journey and build something completely new! Afterward, it's all yours to refine. What category best describes your project? What web technologies do you like? 42 is the answer to everything. What do you think about testing the very very very long text? Is something broken for you?",
    content:
      "What web technologies do you like? 42 is the answer to everything. What do you think about testing the very long text? Is something broken for you? What category best describes your project?",
    hint: "hint !!! What do you think about testing the very long text? Is something broken for you? What category best describes your project?",
  });

  await confirmPrompt({
    title:
      "[confirmPrompt | displayInstructions: true | linesHandler: wrap] Let's embark on a creative journey and build something completely new! Afterward, it's all yours to refine. What category best describes your project? What web technologies do you like? 42 is the answer to everything. What do you think about testing the very very very long text? Is something broken for you?",
    content:
      "What web technologies do you like? 42 is the answer to everything. What do you think about testing the very long text? Is something broken for you? What category best describes your project?",
    displayInstructions: true,
  });

  await confirmPrompt({
    title:
      "[confirmPrompt | displayInstructions: false (default) | linesHandler: wrap] Let's embark on a creative journey and build something completely new! Afterward, it's all yours to refine. What category best describes your project? What web technologies do you like? 42 is the answer to everything. What do you think about testing the very very very long text? Is something broken for you?",
    content:
      "What web technologies do you like? 42 is the answer to everything. What do you think about testing the very long text? Is something broken for you? What category best describes your project?",
  });

  await togglePrompt({
    title:
      "[togglePrompt | linesHandler: wrap] Let's embark on a creative journey and build something completely new! Afterward, it's all yours to refine. What category best describes your project? What web technologies do you like? 42 is the answer to everything. What do you think about testing the very very very long text? Is something broken for you?",
    content:
      "What web technologies do you like? 42 is the answer to everything. What do you think about testing the very long text? Is something broken for you? What category best describes your project?",
  });

  await selectPrompt({
    title:
      "[selectPrompt | linesHandler: wrap] Let's embark on a creative journey and build something completely new! Afterward, it's all yours to refine. What category best describes your project? What web technologies do you like? 42 is the answer to everything. What do you think about testing the very very very long text? Is something broken for you?",
    content:
      "What web technologies do you like? 42 is the answer to everything. What do you think about testing the very long text? Is something broken for you? What category best describes your project?",
    displayInstructions: true,
    linesHandler: "wrap",
    terminalWidth: 92,
    options: [
      {
        label: "Development",
        value: "development",
        hint: "apps, sites, plugins, etc",
      },
      {
        label: "UI Design",
        hint: "ui-design",
        value: "ui-design",
      },
    ],
  });

  await multiselectPrompt({
    title:
      "[multiselectPrompt | linesHandler: wrap] What web technologies do you like? 42 is the answer to everything. What do you think about testing the very long text? Is something broken for you? What category best describes your project?",
    content:
      "Let's embark on a creative journey and build something completely new! Afterward, it's all yours to refine. What category best describes your project? What web technologies do you like? 42 is the answer to everything. What do you think about testing the very very very long text? Is something broken for you?",
    defaultValue: ["react", "typescript"],
    options: [
      {
        label: "React",
        value: "react",
        hint: "A library for building user interfaces.",
      },
      {
        label: "TypeScript",
        value: "typescript",
        hint: "A programming language that adds static typing to JavaScript.",
      },
      {
        label: "ESLint",
        value: "eslint",
        hint: "A tool for identifying patterns in JavaScript code.",
      },
    ] as const,
  });

  await selectPrompt({
    title:
      "[selectPrompt | linesHandler: truncate] What web technologies do you like? 42 is the answer to everything. What do you think about testing the very long text? Is something broken for you? What category best describes your project?",
    content:
      "Let's embark on a creative journey and build something completely new! Afterward, it's all yours to refine. What category best describes your project? What web technologies do you like? 42 is the answer to everything. What do you think about testing the very very very long text? Is something broken for you?",
    linesHandler: "truncate",
    defaultValue: "react",
    options: [
      {
        label: "React",
        value: "react",
        hint: "A library for building user interfaces.",
      },
      {
        label: "TypeScript",
        value: "typescript",
        hint: "A programming language that adds static typing to JavaScript.",
      },
      {
        label: "ESLint",
        value: "eslint",
        hint: "A tool for identifying patterns in JavaScript code.",
      },
    ] as const,
  });

  await showEndPrompt();
}

await detailedExample().catch((error) => errorHandler(error));
