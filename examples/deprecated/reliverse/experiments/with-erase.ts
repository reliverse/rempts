import { symbol } from "@/deprecated/reliverse/experiments/utils/symbols.js";

import type {
  PromptStateDeprecated,
  SymbolCharacterDeprecated,
} from "~/types/internal.js";

import { prompt } from "~/components/mono/mono.js";
import { errorHandler } from "~/utils/errors.js";

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
    id: currentState.id,
    type: "text",
    title: `Please enter your username (Prompt state: ${currentState.state})`,
    titleColor: "blue",
    titleTypography: "bold",
    content: "Your username will be used to identify you in the system.\n",
    contentTypography: "italic",
    validate: (input: string) =>
      input.length > 0 || "Username cannot be empty.",
    action: async () => {
      console.log("action of promptId: ", currentState.id);
      currentState.state = "completed";
    },
  });
  currentState.state = "completed";
  currentState.value = userInput;
  console.log("currentState of userInput: ", currentState);

  process.exit(0);
}

await main().catch((error) => errorHandler(error));
