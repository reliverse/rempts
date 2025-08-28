// bun example/individual/outro.ts

import { outroPrompt } from "~/mod";

async function main() {
  await outroPrompt({
    title: "Outro Prompt",
    titleColor: "cyan",
    titleTypography: "bold",
  });
}

main();
