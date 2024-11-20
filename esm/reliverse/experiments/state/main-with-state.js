import { symbol } from "@/reliverse/experiments/utils/symbols.js";
import { confirmPrompt } from "~/components/confirm-two.js";
import { datePrompt } from "~/components/date.js";
import { endPrompt } from "~/components/end.js";
import { nextStepsPrompt } from "~/components/next-steps.js";
// import { multiSelectPrompt } from "~/components/num-multi-select";
import { numberPrompt } from "~/components/number.js";
import { passwordPrompt } from "~/components/password-two.js";
import { startPrompt } from "./ui/start-with-state.js";
import { textPrompt } from "./ui/text-with-state.js";
// export { createSpinner } from "~/components/spinner";
export async function prompts(options, currentState = {
    id: "",
    state: "initial",
    symbol: symbol("S_MIDDLE", "initial"),
    value: undefined,
}) {
    const { type, id, action } = options;
    let value;
    switch (type) {
        case "start":
            await startPrompt(options, currentState);
            value = null;
            break;
        case "text":
            value = await textPrompt(options, currentState);
            break;
        case "number":
            value = await numberPrompt(options);
            break;
        case "confirm":
            value = await confirmPrompt(options);
            break;
        // case "select":
        //   value = await selectPrompt(options);
        //   break;
        // case "multiselect":
        //   value = await multiSelectPrompt(options);
        //   break;
        case "password":
            value = await passwordPrompt(options);
            break;
        case "date":
            value = await datePrompt({
                ...options,
                dateFormat: "DD/MM/YYYY",
                dateKind: "other",
            });
            break;
        case "nextSteps":
            await nextStepsPrompt(options);
            value = null;
            break;
        case "end":
            await endPrompt(options);
            value = null;
            break;
        default:
            throw new Error(`Unknown prompt type: ${type}`);
    }
    if (action) {
        await action();
    }
    return { [id]: value };
}
