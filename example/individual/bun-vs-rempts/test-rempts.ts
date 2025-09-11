import { createCli, defineCommand, inputPrompt } from "../../../src/mod";

const main = defineCommand({
  meta: {
    name: "bm",
    version: "1.0.0",
    description: "repro",
  },
  run: async () => {
    const input = await inputPrompt({ title: "Enter your name: " });
    console.log(`Hello, ${input}!`);
    process.exit(0);
  },
});

await createCli(main);
