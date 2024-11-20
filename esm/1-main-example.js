// 1-main-example.ts: An advanced example of a CLI application with a beautiful UI config. This example
// demonstrates all possible prompt components. Everything is divided into separate files for clarity.
import { askDir, showAnimatedText, showAnyKeyPrompt, 
// showConfirmPrompt,
showDatePrompt, showEndPrompt, showNumMultiSelectPrompt, showNextStepsPrompt, showNumberPrompt, showNumSelectPrompt, showPasswordPrompt, showStartPrompt, showTextPrompt, showSelectPrompt, showMultiSelectPrompt, } from "@/reliverse/main-prompts.js";
import { errorHandler } from "~/utils/errors.js";
export async function detailedExample() {
    await showStartPrompt();
    await showAnyKeyPrompt("privacy");
    const username = await showTextPrompt();
    const dir = await askDir(username);
    const age = await showNumberPrompt();
    const lang = await showSelectPrompt();
    const color = await showNumSelectPrompt();
    const password = await showPasswordPrompt();
    const birthday = await showDatePrompt();
    const langs = await showMultiSelectPrompt();
    const features = await showNumMultiSelectPrompt();
    // const deps = await showConfirmPrompt(username);
    const userInput = {
        username,
        dir,
        age,
        lang,
        color,
        password,
        birthday,
        langs,
        features,
        // deps,
    };
    // await showResults(userInput);
    // await doSomeFunStuff(userInput);
    await showNextStepsPrompt();
    await showAnimatedText();
    await showEndPrompt();
}
await detailedExample().catch((error) => errorHandler(error));
