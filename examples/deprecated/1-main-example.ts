// 1-main-example.ts: An advanced example of a CLI application with a beautiful UI config. This example
// demonstrates all possible prompt components. Everything is divided into separate files for clarity.

import {
  askDir,
  doSomeFunStuff,
  showAnimatedText,
  showAnyKeyPrompt,
  // showConfirmPrompt,
  showDatePrompt,
  showEndPrompt,
  showNumMultiSelectPrompt,
  showNextStepsPrompt,
  showNumberPrompt,
  showNumSelectPrompt,
  showPasswordPrompt,
  showResults,
  showStartPrompt,
  showTextPrompt,
  showSelectPrompt,
  showMultiSelectPrompt,
} from "@/extended/modules/prompts";
import { type UserInput } from "@/extended/modules/schema";

import { errorHandler } from "~/unsorted/utils/errors";

const hexRegEx = /(\d|[a-f])/gim;
const isHex = (value: string) =>
  (value.match(hexRegEx) || []).length === value.length &&
  (value.length === 3 || value.length === 6);

export async function detailedExample() {
  await showStartPrompt();
  await showAnyKeyPrompt("privacy");
  const username = await showTextPrompt();
  const dir = await askDir(username);
  const age = await showNumberPrompt();
  const lang = await showSelectPrompt();
  const color = await showNumSelectPrompt();
  const password = await showPasswordPrompt();
  const birthday = await showDatePrompt();
  const langs = await showMultiSelectPrompt();
  const features = await showNumMultiSelectPrompt();
  // const deps = await showConfirmPrompt(username);
  const userInput = {
    username,
    dir,
    age,
    lang,
    color,
    password,
    birthday,
    langs,
    features,
    // deps,
  } satisfies UserInput;
  await showResults(userInput);
  await doSomeFunStuff(userInput);
  await showNextStepsPrompt();
  await showAnimatedText();
  await showEndPrompt();
}

await detailedExample().catch((error) => errorHandler(error));
