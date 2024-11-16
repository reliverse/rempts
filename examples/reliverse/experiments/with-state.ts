import { symbol } from "@/reliverse/experiments/utils/symbols";
import { errorHandler } from "~/utils/helpers/errors";

import type {
  PromptStateDeprecated,
  SymbolCharacterDeprecated,
} from "~/types/dev";

import { prompt } from "~/mono";
import { colorize } from "~/utils/colorize";

async function main() {
  console.log();

  const promptIds: string[] = ["start", "userInput", "dir", "end"] as const;
  type PromptId = (typeof promptIds)[number];
  const promptStates: PromptStateDeprecated[] = promptIds.map((id) => ({
    id,
    state: "initial",
    figure: symbol("S_MIDDLE", "initial"),
    value: undefined,
    symbol: "S_MIDDLE" as SymbolCharacterDeprecated,
  }));
  function getState(id: PromptId): PromptStateDeprecated {
    const state = promptStates.find((state) => state.id === id);
    if (!state) {
      throw new Error(`Invalid prompt ID: ${id}`);
    }
    return state;
  }

  let currentState: PromptStateDeprecated = getState("start");

  currentState = getState("start");
  await prompt({
    id: currentState.id,
    type: "start",
    title: "create-app",
    titleColor: "bgCyanBright",
    titleTypography: "bold",
  });
  currentState.state = "completed";

  currentState = getState("userInput");
  const userInput = await prompt({
    type: "text",
    id: currentState.id,
    title: `Please enter your username (Prompt state: ${currentState.state})`,
    titleColor: "blue",
    titleTypography: "bold",
    content: "Your username will be used to identify you in the system.\n",
    contentTypography: "italic",
    validate: (input) => input.length > 0 || "Username cannot be empty.",
  });
  currentState.state = "completed";
  currentState.value = userInput;
  console.log("currentState of userInput: ", currentState);

  currentState = getState("dir");
  const dir = await prompt({
    id: currentState.id,
    type: "text",
    title: `Where should we create your project? (Prompt state: ${currentState.state})`,
    defaultValue: "./sparkling-solid",
  });
  currentState.state = "completed";
  currentState.value = dir;

  currentState = getState("end");
  await prompt({
    type: "end",
    id: currentState.id,
    title: `Problems? ${colorize("https://github.com/blefnk/reliverse/prompts", "cyanBright")}`,
  });
  currentState.state = "completed";

  process.exit(0);
}

await main().catch((error) => errorHandler(error));
