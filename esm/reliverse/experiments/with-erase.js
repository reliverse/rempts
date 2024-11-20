import { symbol } from "@/reliverse/experiments/utils/symbols.js";
import { errorHandler } from "~/utils/errors.js";
import { prompt } from "~/components/mono.js";
async function main() {
    console.log();
    const promptIds = ["start", "userInput", "dir", "end"];
    const promptStates = promptIds.map((id) => ({
        id,
        state: "initial",
        figure: symbol("S_MIDDLE", "initial"),
        value: undefined,
        symbol: "S_MIDDLE",
    }));
    function getState(id) {
        const state = promptStates.find((state) => state.id === id);
        if (!state) {
            throw new Error(`Invalid prompt ID: ${id}`);
        }
        return state;
    }
    let currentState = getState("start");
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
        validate: (input) => input.length > 0 || "Username cannot be empty.",
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
