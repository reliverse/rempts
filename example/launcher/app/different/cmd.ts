// 👉 `bun examples/src/other/different.ts`

import {
  confirmPrompt,
  inputPrompt,
  msg,
  multiselectPrompt,
  selectPrompt,
  togglePrompt,
} from "~/mod";

import { showEndPrompt, showStartPrompt } from "../../../prompts/impl/prompts";

export async function detailedExample() {
  await showStartPrompt();

  await inputPrompt({
    title: "What is your name?",
    defaultValue: "John Snow",
  });

  msg({
    type: "M_INFO",
    title:
      "Let's embark on a creative journey and build something completely new! Afterward, it's all yours to refine. What category best describes your project? What web technologies do you like? 42 is the answer to everything. What do you mind about testing the very very very long text? Is something broken for you?",
    content:
      "What web technologies do you like? 42 is the answer to everything. What do you mind about testing the very long text? Is something broken for you? What category best describes your project?",
    hint: "hint !!! What do you mind about testing the very long text? Is something broken for you? What category best describes your project?",
  });

  await confirmPrompt({
    title:
      "Let's embark on a creative journey and build something completely new! Afterward, it's all yours to refine. What category best describes your project? What web technologies do you like? 42 is the answer to everything. What do you mind about testing the very very very long text? Is something broken for you?",
    content:
      "What web technologies do you like? 42 is the answer to everything. What do you mind about testing the very long text? Is something broken for you? What category best describes your project?",
    displayInstructions: true,
  });

  await confirmPrompt({
    title:
      "Let's embark on a creative journey and build something completely new! Afterward, it's all yours to refine. What category best describes your project? What web technologies do you like? 42 is the answer to everything. What do you mind about testing the very very very long text? Is something broken for you?",
    content:
      "What web technologies do you like? 42 is the answer to everything. What do you mind about testing the very long text? Is something broken for you? What category best describes your project?",
  });

  await togglePrompt({
    title:
      "Let's embark on a creative journey and build something completely new! Afterward, it's all yours to refine. What category best describes your project? What web technologies do you like? 42 is the answer to everything. What do you mind about testing the very very very long text? Is something broken for you?",
    content:
      "What web technologies do you like? 42 is the answer to everything. What do you mind about testing the very long text? Is something broken for you? What category best describes your project?",
  });

  await selectPrompt({
    title:
      "Let's embark on a creative journey and build something completely new! Afterward, it's all yours to refine. What category best describes your project? What web technologies do you like? 42 is the answer to everything. What do you mind about testing the very very very long text? Is something broken for you?",
    content:
      "What web technologies do you like? 42 is the answer to everything. What do you mind about testing the very long text? Is something broken for you? What category best describes your project?",
    displayInstructions: true,
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
      "What web technologies do you like? 42 is the answer to everything. What do you mind about testing the very long text? Is something broken for you? What category best describes your project?",
    content:
      "Let's embark on a creative journey and build something completely new! Afterward, it's all yours to refine. What category best describes your project? What web technologies do you like? 42 is the answer to everything. What do you mind about testing the very very very long text? Is something broken for you?",
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
      "What web technologies do you like? 42 is the answer to everything. What do you mind about testing the very long text? Is something broken for you? What category best describes your project?",
    content:
      "Let's embark on a creative journey and build something completely new! Afterward, it's all yours to refine. What category best describes your project? What web technologies do you like? 42 is the answer to everything. What do you mind about testing the very very very long text? Is something broken for you?",
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
