import { prompts } from "examples/reliverse/experiments/tests/main-merged";

import type { PromptState, SymbolCharacter } from "~/types";

import { colorize } from "~/utils/colorize";
import { symbol } from "~/utils/symbols";

async function main() {
  console.log();

  const promptIds: string[] = ["start", "userInput", "dir", "end"] as const;
  type PromptId = (typeof promptIds)[number];
  const promptStates: PromptState[] = promptIds.map((id) => ({
    id,
    state: "initial",
    figure: symbol("S_MIDDLE", "initial"),
    value: undefined,
    symbol: "S_MIDDLE" as SymbolCharacter,
  }));
  function getState(id: PromptId): PromptState {
    const state = promptStates.find((state) => state.id === id);
    if (!state) {
      throw new Error(`Invalid prompt ID: ${id}`);
    }
    return state;
  }

  let currentState: PromptState = getState("start");

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
    contentTypography: "pulse",
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
    default: "./sparkling-solid",
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

await main().catch((error) => {
  console.error("│  An error occurred:\n", error.message);
  console.error(
    "└  Please report this issue at https://github.com/blefnk/reliverse/issues",
  );
  process.exit(1);
});
