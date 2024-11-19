// 1-main-example.ts: An advanced example of a CLI application with a beautiful UI config. This example
// demonstrates all possible prompt components. Everything is divided into separate files for clarity.

import {
  askDir,
  doSomeFunStuff,
  showAnimatedText,
  showAnyKeyPrompt,
  showConfirmPrompt,
  showDatePrompt,
  showEndPrompt,
  // showMultiSelectPrompt,
  showNextStepsPrompt,
  showNumberPrompt,
  showNumSelectPrompt,
  showPasswordPrompt,
  showResults,
  showStartPrompt,
  showTextPrompt,
} from "@/reliverse/main-prompts";
import { type UserInput } from "@/reliverse/main-schema";

import { multiSelectPrompt } from "~/components/multi-select";
import { selectPrompt } from "~/components/select";
import { errorHandler } from "~/utils/errors";

export async function detailedExample() {
  await showStartPrompt();
  await showAnyKeyPrompt("privacy");

  const selectOptions = ["Option 1", "Option 2", "Option 3", "Option 4"];
  const multiSelectOptions = ["Option 1", "Option 2", "Option 3", "Option 4"];

  const selectedOption = await selectPrompt(selectOptions);
  console.log(`You selected: ${selectedOption}`);

  const selectedOptions = await multiSelectPrompt(multiSelectOptions);
  console.log("You selected:");
  selectedOptions.forEach((option) => console.log(option));

  const username = await showTextPrompt();
  const dir = await askDir(username);
  const age = await showNumberPrompt();
  const color = await showNumSelectPrompt();
  const password = await showPasswordPrompt();
  const birthday = await showDatePrompt();
  // const features = await showMultiSelectPrompt();
  const features = ["Feature 1", "Feature 2", "Feature 3"];
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
