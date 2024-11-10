import type { PromptState } from "~/types";

import { prompts } from "~/main";
import { textPrompt } from "~/ui/text";
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
  const userInput = await textPrompt(
    {
      id: currentState.id,
      type: "text",
      title: `Please enter your username (Prompt state: ${currentState.state})`,
      stateCompletedTitle: `Please enter your username (Prompt state: ${currentState.state})`,
      titleColor: "blue",
      titleTypography: "bold",
      message: "Your username will be used to identify you in the system.\n",
      msgTypography: "pulse",
      state: currentState.state,
      validate: (input: string) =>
        input.length > 0 || "Username cannot be empty.",
      action: async () => {
        console.log("action of promptId: ", currentState.id);
        currentState.state = "completed";
      },
    },
    currentState,
  );
  currentState.state = "completed";
  currentState.value = userInput;
  console.log("currentState of userInput: ", currentState);

  process.exit(0);
}

await main().catch((error) => {
  console.error("│  An error occurred:\n", error.message);
  console.error(
    "└  Please report this issue at https://github.com/blefnk/reliverse/issues",
  );
  process.exit(1);
});
