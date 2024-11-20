import { useEffect, useKeypress, } from "@/external/inquirer/src/hooks/index.js";
import { useState } from "@/external/inquirer/src/hooks/use-state.js";
import { symbol } from "@/reliverse/experiments/utils/symbols.js";
import { Value } from "@sinclair/typebox/value";
import { stdin as input, stdout as output } from "node:process";
import readline from "node:readline/promises";
import { colorize } from "~/utils/colorize.js";
import { applyVariant } from "~/utils/variants.js";
export async function textPrompt(options) {
    const { title, hint, validate, defaultValue, schema, titleColor, titleTypography, content, contentColor, contentTypography, titleVariant, contentVariant, defaultColor, defaultTypography, state: initialState = "initial", } = options;
    const [state, setState] = useState(initialState);
    const [answer, setAnswer] = useState(defaultValue);
    const [errorMessage, setErrorMessage] = useState("");
    const rl = readline.createInterface({ input, output });
    // Handle keypress events
    useKeypress(async (event, rl) => {
        if (event.name === "enter") {
            // Perform validation
            let isValid = true;
            let error = "";
            if (schema) {
                isValid = Value.Check(schema, answer);
                if (!isValid) {
                    const errors = [...Value.Errors(schema, answer)];
                    error = errors[0]?.message || "Invalid input.";
                }
            }
            if (validate && isValid) {
                const validation = await validate(answer);
                if (validation !== true) {
                    isValid = false;
                    error =
                        typeof validation === "string" ? validation : "Invalid input.";
                }
            }
            if (isValid) {
                setState("submit");
                rl.close();
            }
            else {
                setState("error");
                setErrorMessage(error);
            }
        }
        else if (event.name === "backspace") {
            setAnswer(answer.slice(0, -1));
        }
        else if (event.sequence) {
            setAnswer(answer + event.sequence);
        }
    });
    useEffect(() => {
        // Update the prompt display when state or answer changes
        const figure = symbol("S_MIDDLE", state);
        const coloredTitle = colorize(title, titleColor, titleTypography);
        const promptText = `${figure} ${applyVariant([coloredTitle], titleVariant)}`;
        console.log(promptText);
        if (hint) {
            console.log(`(${hint})`);
        }
        if (answer) {
            console.log(`Answer: ${answer}`);
        }
        if (state === "error") {
            console.log(`Error: ${errorMessage}`);
        }
    }, [state, answer]);
    return new Promise((resolve) => {
        rl.on("close", () => {
            resolve(answer);
        });
    });
}
