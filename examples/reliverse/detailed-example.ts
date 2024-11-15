// examples/reliverse/detailed-example.ts: An advanced example of a CLI application with a beautiful UI.
// This example demonstrates how we create a drop-in replacement for libraries like @inquirer/prompts.

import {
  askDir,
  doSomeFunStuff,
  showAnimatedText,
  showAnyKeyPrompt,
  showConfirmPrompt,
  showDatePrompt,
  showEndPrompt,
  showMultiselectPrompt,
  showNextStepsPrompt,
  showNumberPrompt,
  showNumSelectPrompt,
  showPasswordPrompt,
  showResults,
  showStartPrompt,
  showTextPrompt,
} from "./detailed-prompts";
import { type UserInput } from "./detailed-schema";
import { errorHandler } from "./detailed-utils";

export async function detailedExample() {
  await showStartPrompt();
  await showAnyKeyPrompt("privacy");

  const username = await showTextPrompt();
  const dir = await askDir(username);
  const age = await showNumberPrompt();
  const color = await showNumSelectPrompt();
  const password = await showPasswordPrompt();
  const birthday = await showDatePrompt();
  const features = await showMultiselectPrompt();
  const deps = await showConfirmPrompt(username);
  const userInput = {
    username,
    dir,
    age,
    color,
    password,
    birthday,
    features,
    deps,
  } satisfies UserInput;
  await showResults(userInput);
  await doSomeFunStuff(userInput);
  await showNextStepsPrompt();
  await showAnimatedText();
  await showEndPrompt();
}

await detailedExample().catch((error) => errorHandler(error));
