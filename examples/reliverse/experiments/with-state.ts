import { errorHandler } from "examples/helpers/error-handler";
import { prompts } from "examples/reliverse/experiments/tests/main-merged";
import { symbol } from "examples/reliverse/experiments/utils/symbols";

import type {
  PromptStateDeprecated,
  SymbolCharacterDeprecated,
} from "~/types/dev";

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
  await prompts({
    id: currentState.id,
    type: "start",
    title: "create-app",
    titleColor: "bgCyanBright",
    titleTypography: "bold",
    state: currentState.state,
  });
  currentState.state = "completed";

  currentState = getState("userInput");
  const userInput = await prompts({
    type: "text",
    id: currentState.id,
    title: `Please enter your username (Prompt state: ${currentState.state})`,
    titleColor: "blue",
    titleTypography: "bold",
    content: "Your username will be used to identify you in the system.\n",
    contentTypography: "italic",
    state: currentState.state,
    validate: (input) => input.length > 0 || "Username cannot be empty.",
  });
  currentState.state = "completed";
  currentState.value = userInput;
  console.log("currentState of userInput: ", currentState);

  currentState = getState("dir");
  const dir = await prompts({
    id: currentState.id,
    type: "text",
    title: `Where should we create your project? (Prompt state: ${currentState.state})`,
    defaultValue: "./sparkling-solid",
    state: currentState.state,
  });
  currentState.state = "completed";
  currentState.value = dir;

  currentState = getState("end");
  await prompts({
    type: "end",
    id: currentState.id,
    title: `Problems? ${colorize("https://github.com/blefnk/reliverse/prompts", "cyanBright")}`,
    state: currentState.state,
  });
  currentState.state = "completed";

  process.exit(0);
}

await main().catch((error) => errorHandler(error));
