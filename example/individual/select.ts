// bun example/individual/select.ts

import { selectPrompt } from "~/mod";

async function main() {
  await selectPrompt({
    title: "Select Prompt",
    titleColor: "cyan",
    titleTypography: "bold",
    options: [
      { label: "Option 1", value: "option1" },
      { label: "Option 2", value: "option2" },
    ],
  });
}

main();
