import { createCli, defineCommand } from "../../../src/mod";
import { inputPrompt } from "./inputPrompt";

const main = defineCommand({
  meta: {
    name: "bm",
    version: "1.0.0",
    description: "repro",
  },
  run: async () => {
    const input = await inputPrompt({ message: "Enter your name: " });
    console.log(`Hello, ${input}!`);
    process.exit(0);
  },
});

await createCli(main);
