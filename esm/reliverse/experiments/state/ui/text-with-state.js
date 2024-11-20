import { symbol } from "@/reliverse/experiments/utils/symbols.js";
import { Value } from "@sinclair/typebox/value";
import { stdin as input, stdout as output } from "node:process";
import readline from "node:readline/promises";
import { colorize } from "~/utils/colorize.js";
import { applyVariant } from "~/utils/variants.js";
export async function textPrompt(options, currentState = {
    id: "",
    state: "initial",
    symbol: symbol("S_MIDDLE", "initial"),
    value: undefined,
}) {
    const { title, hint, validate, defaultValue, schema, titleColor, titleTypography, content, contentColor, contentTypography, titleVariant, contentVariant, action, state = "initial", } = options;
    const updateState = (newState) => {
        currentState.state = newState;
        currentState.symbol = symbol("S_MIDDLE", newState);
    };
    updateState(state);
    const rl = readline.createInterface({ input, output });
    const promptText = [
        applyVariant([colorize(title, titleColor, titleTypography)], titleVariant),
        content
            ? applyVariant([colorize(content, contentColor, contentTypography)], contentVariant)
            : "",
    ]
        .filter(Boolean)
        .join("\n");
    const question = `${promptText}${hint ? ` (${hint})` : ""}${defaultValue ? ` [${defaultValue}]` : ""}: `;
    function displayPrompt(answer) {
        console.log(`${currentState.symbol} ${promptText}`);
        console.log(answer ?? "-");
    }
    while (true) {
        const answer = (await rl.question(question)) || defaultValue;
        if (!answer)
            continue;
        let isValid = true;
        let errorMessage = "";
        if (schema && !(isValid = Value.Check(schema, answer))) {
            errorMessage =
                [...Value.Errors(schema, answer)][0]?.message || "Invalid input.";
        }
        else if (validate) {
            const validation = await validate(answer);
            if (validation !== true) {
                isValid = false;
                errorMessage =
                    typeof validation === "string" ? validation : "Invalid input.";
            }
        }
        if (isValid) {
            if (action)
                await action();
            updateState("completed");
            currentState.value = answer;
            displayPrompt(answer);
            rl.close();
            return answer;
        }
        else {
            updateState("error");
            displayPrompt();
            console.log(`${currentState.symbol} ${errorMessage}`);
        }
    }
}
